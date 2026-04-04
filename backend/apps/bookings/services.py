from datetime import timedelta
from typing import Optional
from uuid import UUID

from django.conf import settings
from django.db import transaction
from django.utils import timezone

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
        premise_name=p.number or building.name or "",
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

    if premise.status != Premise.Status.AVAILABLE:
        return None, (
            400,
            create_bookings_error(
                status=400,
                code=BookingsErrorCodes.PREMISE_UNAVAILABLE,
                title="Premise not available for booking",
                detail="The premise is not in AVAILABLE status",
                instance="/api/v1/bookings",
            ),
        )

    if deal_type == rent and not premise.available_for_rent:
        return None, (
            400,
            create_bookings_error(
                status=400,
                code=BookingsErrorCodes.PREMISE_UNAVAILABLE,
                title="Premise not available for rent",
                detail="This premise is not offered for rent",
                instance="/api/v1/bookings",
            ),
        )

    if deal_type == sale and not premise.available_for_sale:
        return None, (
            400,
            create_bookings_error(
                status=400,
                code=BookingsErrorCodes.PREMISE_UNAVAILABLE,
                title="Premise not available for sale",
                detail="This premise is not offered for sale",
                instance="/api/v1/bookings",
            ),
        )

    now = timezone.now()
    if Booking.objects.filter(premise=premise, expires_at__gt=now).exists():
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

    expires_at = now + timedelta(days=3)
    with transaction.atomic():
        if Booking.objects.filter(premise=premise, expires_at__gt=now).select_for_update().exists():
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
    return [_booking_to_out(b) for b in qs]
