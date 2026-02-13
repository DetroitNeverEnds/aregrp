"""
Сервисный слой для помещений: фильтрация, пагинация, получение по id.

Публичный API:
- get_premise_list(params) — пагинированный список по фильтрам (sale_type, available, building, price/area, order_by).
- get_premise_by_uuid(premise_uuid) — одна запись по UUID или None.

Рассчитан на async-контекст (Uvicorn + Django 5 + Ninja):
- публичные функции — async, обращаются к БД через async ORM (aget, acount, async for);
- построение queryset и маппинг в DTO — синхронные хелперы, без I/O.
"""
from decimal import Decimal
from typing import Optional
from uuid import UUID

from django.conf import settings
from django.db.models import Q

from ..models import Premise
from ..schemas import (
    PremiseListOut,
    PremiseListResponse,
    PremiseDetailOut,
    PremiseMediaOut,
    MediaPhotoOut,
    MediaVideoOut,
)


class PremiseFilterParams:
    """
    Параметры фильтрации и пагинации списка помещений.

    sale_type: rent | sale (из settings). available: True — свободные, False — занятые.
    building_query: поиск по адресу/названию здания. min/max price, min/max area.
    order_by: default | price_asc | price_desc | area_asc | area_desc. page, page_size.
    """

    __slots__ = (
        "sale_type",
        "available",
        "building_query",
        "min_price",
        "max_price",
        "min_area",
        "max_area",
        "order_by",
        "page",
        "page_size",
    )

    def __init__(
        self,
        *,
        sale_type: Optional[str] = None,
        available: Optional[bool] = None,
        building_query: Optional[str] = None,
        min_price: Optional[Decimal] = None,
        max_price: Optional[Decimal] = None,
        min_area: Optional[Decimal] = None,
        max_area: Optional[Decimal] = None,
        order_by: str = "default",
        page: int = 1,
        page_size: int = 20,
    ):
        self.sale_type = sale_type
        # True — свободные, False — занятые, None — по умолчанию свободные
        self.available = available if available is not None else True
        self.building_query = building_query and building_query.strip() or None
        self.min_price = min_price
        self.max_price = max_price
        self.min_area = min_area
        self.max_area = max_area
        self.order_by = order_by
        self.page = max(1, page)
        self.page_size = max(1, min(100, page_size))


def get_filtered_premise_queryset(params: PremiseFilterParams):
    """
    Строит queryset помещений с фильтрами и сортировкой.

    Фильтры: available (свободные/занятые), sale_type (аренда/продажа), building_query,
    min_price, max_price, min_area, max_area. Сортировка по order_by.
    Не обращается к БД (lazy), пагинация не применяется.
    Результат передаётся в async-методы (acount, async for).
    """
    qs = Premise.objects.select_related("building", "city", "floor").prefetch_related(
        "images"
    )
    # available: True — свободные, False — занятые
    if params.available:
        qs = qs.filter(status=Premise.Status.AVAILABLE)
    else:
        qs = qs.filter(
            status__in=[
                Premise.Status.RESERVED,
                Premise.Status.RENTED,
                Premise.Status.UNAVAILABLE,
            ]
        )

    if params.sale_type == settings.RE_OBJECTS_SALE_TYPE_RENT:
        qs = qs.filter(available_for_rent=True)
    elif params.sale_type == settings.RE_OBJECTS_SALE_TYPE_SALE:
        qs = qs.filter(available_for_sale=True)

    if params.building_query:
        qs = qs.filter(
            Q(building__address__icontains=params.building_query)
            | Q(building__name__icontains=params.building_query)
        )

    if params.min_price is not None:
        qs = qs.filter(price_per_month__gte=params.min_price)
    if params.max_price is not None:
        qs = qs.filter(price_per_month__lte=params.max_price)
    if params.min_area is not None:
        qs = qs.filter(area__gte=params.min_area)
    if params.max_area is not None:
        qs = qs.filter(area__lte=params.max_area)

    if params.order_by == "price_asc":
        qs = qs.order_by("price_per_month", "id")
    elif params.order_by == "price_desc":
        qs = qs.order_by("-price_per_month", "id")
    elif params.order_by == "area_asc":
        qs = qs.order_by("area", "id")
    elif params.order_by == "area_desc":
        qs = qs.order_by("-area", "id")
    else:
        qs = qs.order_by("city", "building", "floor__number", "number", "id")
    return qs


def _build_premise_media(p: Premise) -> PremiseMediaOut:
    """Собирает блок медиа помещения: фото из PremiseImage (по order), видео пока пустой список."""
    photos = [
        MediaPhotoOut(
            url=img.file.url,
            title=img.title or None,
            is_primary=img.is_primary,
        )
        for img in sorted(p.images.all(), key=lambda x: (x.order, x.pk))
    ]
    # Видео помещений в модели пока нет — структура под будущее
    videos: list[MediaVideoOut] = []
    return PremiseMediaOut(photos=photos, videos=videos)


def premise_to_list_out(p: Premise) -> PremiseListOut:
    """Маппинг Premise -> PremiseListOut (uuid, name, price, address, floor, area, has_tenant, media)."""
    return PremiseListOut(
        uuid=str(p.uuid),
        name=p.number or p.building.name or "",
        price=p.price_per_month,
        address=p.building.address,
        floor=p.floor.number if p.floor else None,
        area=p.area,
        has_tenant=(p.status != Premise.Status.AVAILABLE),
        media=_build_premise_media(p),
    )


def premise_to_detail_out(p: Premise) -> PremiseDetailOut:
    """Маппинг Premise -> PremiseDetailOut (все поля списка + description, price_per_sqm, ceiling_height, has_windows, has_parking, is_furnished)."""
    return PremiseDetailOut(
        uuid=str(p.uuid),
        name=p.number or p.building.name or "",
        price=p.price_per_month,
        address=p.building.address,
        floor=p.floor.number if p.floor else None,
        area=p.area,
        has_tenant=(p.status != Premise.Status.AVAILABLE),
        media=_build_premise_media(p),
        description=p.description or None,
        price_per_sqm=p.price_per_sqm,
        ceiling_height=p.ceiling_height,
        has_windows=p.has_windows,
        has_parking=p.has_parking,
        is_furnished=p.is_furnished,
    )


async def get_premise_list(params: PremiseFilterParams) -> PremiseListResponse:
    """
    Возвращает пагинированный список помещений по параметрам фильтрации.

    Использует async ORM (acount, async for). Возвращает items, total, page, page_size.
    """
    qs = get_filtered_premise_queryset(params)
    total = await qs.acount()
    start = (params.page - 1) * params.page_size
    page_qs = qs[start : start + params.page_size]
    items: list[PremiseListOut] = []
    async for p in page_qs:
        items.append(premise_to_list_out(p))
    return PremiseListResponse(
        items=items,
        total=total,
        page=params.page,
        page_size=params.page_size,
    )


async def get_premise_by_uuid(premise_uuid: UUID) -> Optional[PremiseDetailOut]:
    """
    Возвращает помещение по UUID в виде PremiseDetailOut или None.

    Только помещения со статусом AVAILABLE. Использует aget() и prefetch images.
    """
    try:
        p = await Premise.objects.select_related(
            "building", "city", "floor"
        ).prefetch_related("images").aget(
            uuid=premise_uuid,
            status=Premise.Status.AVAILABLE,
        )
    except Premise.DoesNotExist:
        return None
    return premise_to_detail_out(p)
