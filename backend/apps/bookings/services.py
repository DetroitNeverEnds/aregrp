from datetime import timedelta
from typing import Optional
from uuid import UUID

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from apps.payments.models import Payment
from apps.re_objects.availability import premise_is_available_for_deal
from apps.re_objects.models import Premise

from .errors import BookingsErrorCodes, create_bookings_error
from .models import Booking
from .schemas import BookingOut


def _booking_to_out(b: Booking) -> BookingOut:
    p = b.premise
    building = p.building
    return BookingOut(
        id=b.id,
        premise_uuid=str(p.uuid),
        premise_name=(p.title or building.name or ""),
        building_uuid=str(building.uuid),
        building_name=building.name or "",
        building_address=building.address or "",
        deal_type=b.deal_type,
        expires_at=b.expires_at,
        created_at=b.created_at,
    )


def create_booking(
    user,
    premise_uuid: UUID,
    deal_type: str,
) -> tuple[Optional[BookingOut], Optional[tuple[int, dict]]]:
    """
    Создаёт бронь. Возвращает (BookingOut, None) или (None, (status, problem_dict)).
    Premise не изменяется.
    """
    rent = settings.RE_OBJECTS_SALE_TYPE_RENT
    sale = settings.RE_OBJECTS_SALE_TYPE_SALE
    if deal_type not in (rent, sale):
        return None, (
            400,
            create_bookings_error(
                status=400,
                code=BookingsErrorCodes.INVALID_DEAL_TYPE,
                title="Invalid deal type",
                detail=f"deal_type must be '{rent}' or '{sale}'",
                instance="/api/v1/bookings",
            ),
        )

    try:
        premise = Premise.objects.select_related("building").get(uuid=premise_uuid)
    except Premise.DoesNotExist:
        from apps.re_objects.errors import ReObjectsErrorCodes, create_re_objects_error

        return None, (
            404,
            create_re_objects_error(
                status=404,
                code=ReObjectsErrorCodes.NOT_FOUND,
                title="Premise not found",
                detail="No premise with the given UUID",
                instance="/api/v1/bookings",
            ),
        )

    flag_is_available = premise.is_available_for_rent() if deal_type == rent else premise.is_available_for_sale()
    if not flag_is_available:
        return None, (
            400,
            create_bookings_error(
                status=400,
                code=BookingsErrorCodes.PREMISE_UNAVAILABLE,
                title=f"Premise not available for {deal_type}",
                detail=f"This premise is not offered for {deal_type}",
                instance="/api/v1/bookings",
            ),
        )

    now = timezone.now()
    has_active_booking = Booking.objects.filter(premise=premise, expires_at__gt=now).exists()
    has_active_pending_payment = Payment.objects.filter(
        premise=premise,
        status__in=(Payment.Status.PENDING, Payment.Status.WAITING_FOR_CAPTURE),
    ).exists()

    if not premise_is_available_for_deal(
        premise=premise,
        deal_type=deal_type,
        has_active_booking=has_active_booking,
        has_active_pending_payment=has_active_pending_payment,
    ):
        if has_active_booking:
            return None, (
                409,
                create_bookings_error(
                    status=409,
                    code=BookingsErrorCodes.ACTIVE_BOOKING_EXISTS,
                    title="Active booking exists",
                    detail="This premise already has an active booking",
                    instance="/api/v1/bookings",
                ),
            )

        if has_active_pending_payment:
            return None, (
                409,
                create_bookings_error(
                    status=409,
                    code=BookingsErrorCodes.PREMISE_UNAVAILABLE,
                    title="Premise has payment in progress",
                    detail="This premise has an active unfinished payment",
                    instance="/api/v1/bookings",
                ),
            )

        return None, (
            409,
            create_bookings_error(
                status=409,
                code=BookingsErrorCodes.PREMISE_UNAVAILABLE,
                title="Premise unavailable",
                detail="This premise is currently unavailable",
                instance="/api/v1/bookings",
            ),
        )

    expires_at = now + timedelta(days=3)
    with transaction.atomic():
        has_active_booking_locked = Booking.objects.filter(
            premise=premise,
            expires_at__gt=now,
        ).select_for_update().exists()
        has_active_pending_payment_locked = Payment.objects.filter(
            premise=premise,
            status__in=(Payment.Status.PENDING, Payment.Status.WAITING_FOR_CAPTURE),
        ).select_for_update().exists()

        if not premise_is_available_for_deal(
            premise=premise,
            deal_type=deal_type,
            has_active_booking=has_active_booking_locked,
            has_active_pending_payment=has_active_pending_payment_locked,
        ):
            if has_active_booking_locked:
                return None, (
                    409,
                    create_bookings_error(
                        status=409,
                        code=BookingsErrorCodes.ACTIVE_BOOKING_EXISTS,
                        title="Active booking exists",
                        detail="This premise already has an active booking",
                        instance="/api/v1/bookings",
                    ),
                )

            if has_active_pending_payment_locked:
                return None, (
                    409,
                    create_bookings_error(
                        status=409,
                        code=BookingsErrorCodes.PREMISE_UNAVAILABLE,
                        title="Premise has payment in progress",
                        detail="This premise has an active unfinished payment",
                        instance="/api/v1/bookings",
                    ),
                )

            return None, (
                409,
                create_bookings_error(
                    status=409,
                    code=BookingsErrorCodes.PREMISE_UNAVAILABLE,
                    title="Premise unavailable",
                    detail="This premise is currently unavailable",
                    instance="/api/v1/bookings",
                ),
            )
        booking = Booking.objects.create(
            user=user,
            premise=premise,
            deal_type=deal_type,
            expires_at=expires_at,
        )

    booking = Booking.objects.select_related("premise", "premise__building").get(pk=booking.pk)
    return _booking_to_out(booking), None


def list_bookings_for_user(user) -> list[BookingOut]:
    qs = (
        Booking.objects.filter(user=user)
        .select_related("premise", "premise__building")
        .order_by("-created_at")
    )
    if settings.BOOKINGS_LIST_ONLY_ACTIVE:
        qs = qs.filter(expires_at__gt=timezone.now())
    return [_booking_to_out(b) for b in qs]
