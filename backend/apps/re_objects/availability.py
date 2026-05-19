"""
Правила доступности помещений без поля status.

Фильтры каталога (query available, список зданий для фильтра): «свободно» — без активной брони
и без незавершённой оплаты (pending / waiting_for_capture). Записи Deal (оформленные сделки)
в эти фильтры не входят.

Занятость по схеме этажа (is_occupied): см. premise_service._floor_premise_availability_rows —
по флагам помещения и админке, не по броням и платежам.
"""
from __future__ import annotations

from typing import TYPE_CHECKING

from django.conf import settings
from django.db.models import Exists, OuterRef, Q
from django.utils import timezone

from apps.bookings.models import Booking
from apps.payments.models import Payment

if TYPE_CHECKING:
    from django.db.models import QuerySet

    from .models import Premise


def _now():
    return timezone.now()


def active_booking_subquery():
    return Booking.objects.filter(
        premise_id=OuterRef('pk'),
        expires_at__gt=_now(),
    )


def active_pending_payment_subquery():
    return Payment.objects.filter(
        premise_id=OuterRef('pk'),
        status__in=(
            Payment.Status.PENDING,
            Payment.Status.WAITING_FOR_CAPTURE,
        ),
    )


def annotate_premise_availability(qs: QuerySet[Premise]):
    """
    Аннотации для фильтрации списка помещений: _active_booking, _active_pending_payment.
    """
    return qs.annotate(
        _active_booking=Exists(active_booking_subquery()),
        _active_pending_payment=Exists(active_pending_payment_subquery()),
    )


def premise_is_available_for_deal(
    *,
    premise,
    deal_type: str,
    has_active_booking: bool | None = None,
    has_active_pending_payment: bool | None = None,
) -> bool:
    rent = settings.RE_OBJECTS_SALE_TYPE_RENT
    sale = settings.RE_OBJECTS_SALE_TYPE_SALE

    if deal_type == rent:
        flag_is_available = bool(premise.available_for_rent)
    elif deal_type == sale:
        flag_is_available = bool(premise.available_for_sale)
    else:
        return False

    if not flag_is_available:
        return False

    if has_active_booking is None:
        has_active_booking = Booking.objects.filter(
            premise_id=premise.pk,
            expires_at__gt=_now(),
        ).exists()
    if has_active_pending_payment is None:
        has_active_pending_payment = Payment.objects.filter(
            premise_id=premise.pk,
            status__in=(
                Payment.Status.PENDING,
                Payment.Status.WAITING_FOR_CAPTURE,
            ),
        ).exists()

    return not has_active_booking and not has_active_pending_payment


def has_tenant_value(*, available_for_rent: bool) -> bool:
    """
    Значение has_tenant для списков/детали помещений.

    Бизнес-правило: если помещение недоступно для аренды, считаем что арендатор есть.
    """
    return premise_is_occupied_by_rent_availability(available_for_rent=available_for_rent)


def premise_is_occupied_by_rent_availability(*, available_for_rent: bool) -> bool:
    """
    Унифицированное правило «занято ли помещение» по флагам помещения.

    Если помещение недоступно для аренды, считаем его занятым.
    """
    return not bool(available_for_rent)


def floor_is_occupied_value(
    sale_type: str,
    *,
    show_rented_button: bool,
) -> bool:
    """
    Значение is_occupied для схемы этажа.

    Текущая бизнес-логика:
    - rent: всегда False (упрощение отображения);
    - sale: True, если в админке включён флаг «Показать кнопку "Сдано"».
    """
    if sale_type == settings.RE_OBJECTS_SALE_TYPE_RENT:
        return False
    if sale_type == settings.RE_OBJECTS_SALE_TYPE_SALE:
        return bool(show_rented_button)
    return False


def premise_filter_for_buildings_q(
    sale_type: str | None,
    available: bool | None,
) -> Q:
    """
    Q для Premise при выборе зданий в фильтре (по sale_type и available).

    available учитывает активные брони и незавершённые оплаты (те же условия, что и в каталоге).
    """
    active_book_sq = active_booking_subquery()
    pending_payment_sq = active_pending_payment_subquery()

    rent_free = Q(available_for_rent=True) & ~Exists(active_book_sq) & ~Exists(pending_payment_sq)
    sale_free = Q(available_for_sale=True) & ~Exists(active_book_sq) & ~Exists(pending_payment_sq)

    q = Q()
    rent = settings.RE_OBJECTS_SALE_TYPE_RENT
    sale = settings.RE_OBJECTS_SALE_TYPE_SALE

    if available is True:
        if sale_type == rent:
            q &= rent_free
        elif sale_type == sale:
            q &= sale_free
        else:
            q &= rent_free | sale_free
    elif available is False:
        if sale_type == rent:
            q &= ~rent_free
        elif sale_type == sale:
            q &= ~sale_free
        else:
            q &= ~(rent_free | sale_free)

    if sale_type == rent:
        q &= Q(available_for_rent=True)
    elif sale_type == sale:
        q &= Q(available_for_sale=True)

    return q
