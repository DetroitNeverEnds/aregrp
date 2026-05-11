import json
from datetime import timedelta
from decimal import Decimal
import uuid

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from yookassa import Payment as YooKassaPayment
from yookassa.domain.notification import WebhookNotification

from apps.bookings.models import Booking
from apps.re_objects.models import Premise

from .models import Payment
from .errors import PaymentsErrorCodes, create_payments_error
from .schemas import PaymentAmountOut, PaymentConfirmationOut, PaymentCreateOut


def _build_amount_value() -> str:
    return str(Decimal(settings.PAYMENTS_BOOKING_AMOUNT).quantize(Decimal('0.00')))


def _is_positive_int_string(value: str) -> bool:
    return value.isdigit() and int(value) > 0


def _ensure_sale_booking(metadata: dict, local_payment: Payment | None) -> None:
    user_id_raw = metadata.get('user_id')
    premise_id_raw = metadata.get('premise_id')

    if not isinstance(user_id_raw, str) or not _is_positive_int_string(user_id_raw):
        return

    if not isinstance(premise_id_raw, str) or not _is_positive_int_string(premise_id_raw):
        if local_payment is None or local_payment.premise_id is None:
            return
        premise_id = local_payment.premise_id
    else:
        premise_id = int(premise_id_raw)

    user = get_user_model().objects.filter(pk=int(user_id_raw)).first()
    premise = Premise.objects.filter(pk=premise_id).first()
    if user is None or premise is None:
        return

    now = timezone.now()
    expires_at = now + timedelta(days=3)
    with transaction.atomic():
        active_booking_exists = Booking.objects.select_for_update().filter(
            premise=premise,
            expires_at__gt=now,
        ).exists()
        if active_booking_exists:
            return
        Booking.objects.create(
            user=user,
            premise=premise,
            deal_type=Booking.DealType.SALE,
            expires_at=expires_at,
        )


def create_payment(user_id: int, premise_id: int) -> tuple[PaymentCreateOut | None, tuple[int, dict] | None]:
    try:
        premise = Premise.objects.get(pk=premise_id)
    except Premise.DoesNotExist:
        return None, (
            404,
            create_payments_error(
                status=404,
                code=PaymentsErrorCodes.PREMISE_NOT_FOUND,
                title='Premise not found',
                detail='No premise with the given ID',
                instance='/api/v1/payments/',
            ),
        )

    if not premise.is_available_for_sale():
        return None, (
            400,
            create_payments_error(
                status=400,
                code=PaymentsErrorCodes.PREMISE_UNAVAILABLE,
                title='Premise not available',
                detail='This premise is not available for sale',
                instance='/api/v1/payments/',
            ),
        )

    if Booking.objects.filter(premise=premise, expires_at__gt=timezone.now()).exists():
        return None, (
            409,
            create_payments_error(
                status=409,
                code=PaymentsErrorCodes.ACTIVE_BOOKING_EXISTS,
                title='Active booking exists',
                detail='This premise already has an active booking',
                instance='/api/v1/payments/',
            ),
        )

    amount_value = _build_amount_value()
    description = f'Бронирование помещения {premise_id}'
    idempotence_key = uuid.uuid4()
    metadata = {
        'payment_token': str(idempotence_key),
        'user_id': str(user_id),
        'premise_id': str(premise_id),
        'premise_uuid': str(premise.uuid),
    }

    try:
        payment = YooKassaPayment.create(
            {
                'amount': {
                    'value': amount_value,
                    'currency': 'RUB',
                },
                'confirmation': {
                    'type': 'redirect',
                    'return_url': settings.PAYMENTS_REDIRECT_URL,
                },
                'capture': True,
                'description': description,
                'metadata': metadata,
            },
            str(idempotence_key),
        )
    except Exception as exc:
        return None, (
            502,
            create_payments_error(
                status=502,
                code=PaymentsErrorCodes.CREATION_ERROR,
                title='Payment creation failed',
                detail=str(exc),
                instance='/api/v1/payments/',
            ),
        )

    Payment.objects.update_or_create(
        provider_payment_id=str(payment.id),
        defaults={
            'premise': premise,
            'idempotence_key': idempotence_key,
            'status': str(payment.status),
            'paid': bool(payment.paid),
            'amount_value': Decimal(str(payment.amount.value)),
            'amount_currency': str(payment.amount.currency),
            'description': str(payment.description or ''),
            'metadata': metadata,
        },
    )

    confirmation_url = None
    confirmation_type = 'redirect'
    try:
        confirmation_url = payment.confirmation.confirmation_url
        confirmation_type = payment.confirmation.type
    except AttributeError:
        pass

    created_at = None
    try:
        created_at = payment.created_at
    except AttributeError:
        pass

    out = PaymentCreateOut(
        id=str(payment.id),
        status=str(payment.status),
        paid=bool(payment.paid),
        amount=PaymentAmountOut(
            value=str(payment.amount.value),
            currency=str(payment.amount.currency),
        ),
        description=str(payment.description),
        premise_id=premise_id,
        confirmation=PaymentConfirmationOut(
            type=confirmation_type,
            confirmation_url=confirmation_url,
        ),
        created_at=str(created_at) if created_at else None,
    )
    return out, None


def handle_yookassa_webhook(raw_body: bytes) -> tuple[int, dict | None]:
    try:
        event_json = json.loads(raw_body)
    except json.JSONDecodeError:
        return 400, {
            'detail': 'Invalid JSON payload',
        }

    try:
        notification_object = WebhookNotification(event_json)
    except Exception:
        return 400, {
            'detail': 'Invalid YooKassa notification payload',
        }

    payment = notification_object.object
    event_name = str(notification_object.event)
    payment_id = str(payment.id)
    payment_status = str(payment.status)
    payment_paid = bool(payment.paid)
    payment_amount_value = Decimal(str(payment.amount.value))
    payment_amount_currency = str(payment.amount.currency)
    payment_description = str(payment.description or '')

    event_object = event_json.get('object')
    event_metadata = {}
    if isinstance(event_object, dict):
        raw_metadata = event_object.get('metadata')
        if isinstance(raw_metadata, dict):
            event_metadata = raw_metadata

    local_payment = Payment.objects.filter(provider_payment_id=payment_id).first()
    if local_payment is None and event_metadata:
        payment_token = event_metadata.get('payment_token')
        if isinstance(payment_token, str):
            try:
                payment_token_uuid = uuid.UUID(payment_token)
            except ValueError:
                payment_token_uuid = None
            if payment_token_uuid is not None:
                local_payment = Payment.objects.filter(idempotence_key=payment_token_uuid).first()

    if local_payment is None:
        premise = None
        premise_id_from_metadata = event_metadata.get('premise_id')
        if isinstance(premise_id_from_metadata, str) and premise_id_from_metadata.isdigit():
            premise = Premise.objects.filter(pk=int(premise_id_from_metadata)).first()

        payment_token = event_metadata.get('payment_token')
        if isinstance(payment_token, str):
            try:
                idempotence_key = uuid.UUID(payment_token)
            except ValueError:
                idempotence_key = uuid.uuid4()
        else:
            idempotence_key = uuid.uuid4()

        local_payment = Payment.objects.create(
            premise=premise,
            provider_payment_id=payment_id,
            idempotence_key=idempotence_key,
            status=payment_status,
            paid=payment_paid,
            amount_value=payment_amount_value,
            amount_currency=payment_amount_currency,
            description=payment_description,
            metadata=event_metadata,
        )
    else:
        fields_to_update: list[str] = []
        if local_payment.status != payment_status:
            local_payment.status = payment_status
            fields_to_update.append('status')
        if local_payment.paid != payment_paid:
            local_payment.paid = payment_paid
            fields_to_update.append('paid')
        if local_payment.amount_value != payment_amount_value:
            local_payment.amount_value = payment_amount_value
            fields_to_update.append('amount_value')
        if local_payment.amount_currency != payment_amount_currency:
            local_payment.amount_currency = payment_amount_currency
            fields_to_update.append('amount_currency')
        if local_payment.description != payment_description:
            local_payment.description = payment_description
            fields_to_update.append('description')
        if event_metadata and local_payment.metadata != event_metadata:
            local_payment.metadata = event_metadata
            fields_to_update.append('metadata')

        if fields_to_update:
            fields_to_update.append('updated_at')
            local_payment.save(update_fields=fields_to_update)

    resolved_metadata = {}
    if isinstance(local_payment.metadata, dict):
        resolved_metadata.update(local_payment.metadata)
    if event_metadata:
        resolved_metadata.update(event_metadata)

    if event_name == 'payment.succeeded':
        _ensure_sale_booking(resolved_metadata, local_payment)
    elif event_name == 'payment.canceled':
        pass

    return 200, None
