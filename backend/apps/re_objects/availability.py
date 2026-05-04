"""
Правила доступности помещений без поля status.

Фильтры каталога (query available, список зданий для фильтра): «свободно» — только без активной брони
(expires_at > now); сделки аренды/продажи в эти фильтры не входят.

Аннотации _active_rent_period / _has_sale_deal / _any_rent_deal — для has_tenant, схемы этажа и т.п., не для
фильтра available.

Занятость по схеме этажа (is_occupied): см. premise_service._floor_premise_availability_rows — только флаги помещения,
без сделок.
"""
from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from django.conf import settings
from django.db.models import Exists, OuterRef, Q
from django.utils import timezone

from apps.bookings.models import Booking
from apps.deals.models import Deal

if TYPE_CHECKING:
    from django.db.models import QuerySet

    from .models import Premise


def _today():
    return timezone.now().date()


def _now():
    return timezone.now()


def active_rent_deal_subquery():
    """Сделка аренды, действующая на текущую дату (окончание срока не раньше сегодня)."""
    return Deal.objects.filter(
        premise_id=OuterRef('pk'),
        deal_type=Deal.DealType.RENT,
        rent_expires_at__gte=_today(),
    )


def any_rent_deal_subquery():
    """Любая сделка аренды по помещению (в т.ч. архивная)."""
    return Deal.objects.filter(
        premise_id=OuterRef('pk'),
        deal_type=Deal.DealType.RENT,
    )


def sale_deal_subquery():
    return Deal.objects.filter(
        premise_id=OuterRef('pk'),
        deal_type=Deal.DealType.SALE,
    )


def active_booking_subquery():
    return Booking.objects.filter(
        premise_id=OuterRef('pk'),
        expires_at__gt=_now(),
    )


def annotate_premise_availability(qs: QuerySet[Premise]):
    """
    Добавляет аннотации для фильтров и has_tenant:
    _any_rent_deal, _active_rent_period, _has_sale_deal, _active_booking.
    """
    return qs.annotate(
        _any_rent_deal=Exists(any_rent_deal_subquery()),
        _active_rent_period=Exists(active_rent_deal_subquery()),
        _has_sale_deal=Exists(sale_deal_subquery()),
        _active_booking=Exists(active_booking_subquery()),
    )


def premise_filter_for_buildings_q(
    sale_type: Optional[str],
    available: Optional[bool],
) -> Q:
    """
    Q для Premise при выборе зданий в фильтре (по sale_type и available).

    available учитывает только активные брони, не сделки.
    """
    active_book_sq = active_booking_subquery()

    rent_free = Q(available_for_rent=True) & ~Exists(active_book_sq)
    sale_free = Q(available_for_sale=True) & ~Exists(active_book_sq)

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
