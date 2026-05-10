from decimal import Decimal
import uuid

from django.conf import settings
from django.utils import timezone
from yookassa import Payment

from apps.bookings.models import Booking
from apps.re_objects.models import Premise

from .errors import PaymentsErrorCodes, create_payments_error
from .schemas import PaymentAmountOut, PaymentConfirmationOut, PaymentCreateOut


def _build_amount_value() -> str:
    return str(Decimal(settings.PAYMENTS_BOOKING_AMOUNT).quantize(Decimal('0.00')))


def create_payment(premise_id: int) -> tuple[PaymentCreateOut | None, tuple[int, dict] | None]:
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

    try:
        payment = Payment.create(
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
            },
            str(uuid.uuid4()),
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
