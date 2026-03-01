"""
Универсальная пагинация для Django Ninja.

Использование:

1) По queryset:
    qs = Building.objects.filter(...).order_by("name")
    result = await get_paginated_list(qs, page=1, page_size=20, to_out=building_to_out)

2) По модели (базовый queryset):
    result = await get_paginated_list_for_model(
        Building, page=1, page_size=6, to_out=building_to_out,
        order_by="name", **filters
    )
"""
import math
from collections.abc import Callable
from typing import Any, TypeVar

from django.db.models import Model, QuerySet

T = TypeVar("T")


def _total_pages(total: int, page_size: int) -> int:
    """Общее количество страниц."""
    return math.ceil(total / page_size) if page_size > 0 else 0


async def get_paginated_list(
    queryset: QuerySet,
    page: int,
    page_size: int,
    to_out: Callable[[object], T],
) -> dict:
    """
    Пагинированный список по готовому queryset.

    Args:
        queryset: Django QuerySet (уже отфильтрованный и отсортированный).
        page: Номер страницы (1-based).
        page_size: Размер страницы.
        to_out: Синхронная функция маппинга: model_instance -> schema/dict.

    Returns:
        dict с ключами: items, total, page, page_size.
    """
    total = await queryset.acount()
    start = (page - 1) * page_size
    page_qs = queryset[start : start + page_size]

    items: list[T] = []
    async for obj in page_qs:
        items.append(to_out(obj))

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": _total_pages(total, page_size),
    }


async def get_paginated_list_for_model(
    model: type[Model],
    page: int,
    page_size: int,
    to_out: Callable[[object], T],
    *,
    order_by: str | list[str] | None = None,
    **filters: Any,
) -> dict:
    """
    Пагинированный список по модели с фильтрами.

    Args:
        model: Класс модели Django (Building, Premise и т.д.).
        page: Номер страницы (1-based).
        page_size: Размер страницы.
        to_out: Синхронная функция маппинга: model_instance -> schema/dict.
        order_by: Поле или список полей для сортировки.
        **filters: Фильтры для queryset.filter(**filters).

    Returns:
        dict с ключами: items, total, page, page_size.
    """
    qs = model.objects.filter(**filters)
    if order_by is not None:
        order = order_by if isinstance(order_by, list) else [order_by]
        qs = qs.order_by(*order)
    return await get_paginated_list(qs, page=page, page_size=page_size, to_out=to_out)
