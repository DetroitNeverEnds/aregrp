"""
Сервисный слой для помещений: фильтрация, пагинация, получение по UUID.

Публичный API:
- parse_building_uuids(value) — парсит строку 'uuid1,uuid2,...' в список UUID для фильтра зданий.
- get_premise_list(params) — пагинированный список по фильтрам (sale_type, available, building_query, building_uuids, price/area, order_by).
- get_buildings_for_filter(sale_type, available) — список зданий для фильтра (uuid, name, address). available: None — без фильтра.
- get_buildings(page, page_size) — список зданий с пагинацией.
- get_premise_by_uuid(premise_uuid, sale_type=None) — одна запись по UUID или None; поле price при продаже — human_price (кэш в модели).
- get_premises_for_floor(building_uuid, floor_number) — данные этажа (building_uuid, floor_number, schema_svg, premises).

Рассчитан на async-контекст (Uvicorn + Django 5 + Ninja):
- публичные функции — async, обращаются к БД через async ORM (aget, acount, async for);
- построение queryset и маппинг в DTO — синхронные хелперы, без I/O.
"""
from decimal import Decimal
from typing import Optional
from uuid import UUID

from asgiref.sync import sync_to_async
from django.conf import settings
from django.db.models import Min, Q, Subquery

from core.pagination import get_paginated_list

from ..models import Building, Floor, Premise
from ..schemas import (
    BaseMediaItemOut,
    BuildingDetailOut,
    BuildingGeoPointOut,
    BuildingListOut,
    BuildingListResponse,
    BuildingMediaItemOut,
    BuildingOptionOut,
    FloorPremiseOut,
    FloorResponseOut,
    PremiseListOut,
    PremiseListResponse,
    PremiseDetailOut,
)


def _decimal_coord_to_float(value) -> Optional[float]:
    return float(value) if value is not None else None


def _building_geo_point_out(b: Building) -> Optional[BuildingGeoPointOut]:
    lat = _decimal_coord_to_float(b.latitude)
    lon = _decimal_coord_to_float(b.longitude)
    if lat is None or lon is None:
        return None
    return BuildingGeoPointOut(lat=lat, lon=lon)


def parse_building_uuids(value: Optional[str]) -> Optional[list[UUID]]:
    """
    Парсит building_uuids из query-строки 'uuid1,uuid2,...' в список UUID.

    Пустая или невалидная строка — None. Невалидные фрагменты пропускаются.
    """
    if not value or not value.strip():
        return None
    uuids = []
    for part in value.strip().split(","):
        part = part.strip()
        if not part:
            continue
        try:
            uuids.append(UUID(part))
        except (ValueError, TypeError):
            continue
    return uuids if uuids else None


class PremiseFilterParams:
    """
    Параметры фильтрации и пагинации списка помещений.

    sale_type: rent | sale (из settings). available: True — свободные, False — занятые, None — без фильтра.
    building_query: поиск по адресу/названию здания. building_uuids: фильтр по UUID зданий (чекбоксы).
    min/max price, min/max area. order_by, page, page_size.
    """

    __slots__ = (
        "sale_type",
        "available",
        "building_query",
        "building_uuids",
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
        building_uuids: Optional[list[UUID]] = None,
        min_price: Optional[Decimal] = None,
        max_price: Optional[Decimal] = None,
        min_area: Optional[Decimal] = None,
        max_area: Optional[Decimal] = None,
        order_by: str = "default",
        page: int = 1,
        page_size: int = 20,
    ):
        self.sale_type = sale_type
        # True — свободные, False — занятые, None — без фильтра по доступности
        self.available = available
        self.building_query = building_query and building_query.strip() or None
        self.building_uuids = list(building_uuids) if building_uuids else None
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

    Фильтры: available (True — свободные, False — занятые, None — без фильтра), sale_type, building_query,
    building_uuids, min_price, max_price, min_area, max_area. Сортировка по order_by.
    Не обращается к БД (lazy), пагинация не применяется.
    Результат передаётся в async-методы (acount, async for).
    """
    qs = Premise.objects.select_related("building", "city", "floor").prefetch_related(
        "images"
    )
    # available: True — свободные, False — занятые, None — без фильтра по статусу
    if params.available is not None:
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
    if params.building_uuids:
        qs = qs.filter(building__uuid__in=params.building_uuids)

    price_field = (
        "human_price"
        if params.sale_type == settings.RE_OBJECTS_SALE_TYPE_SALE
        else "price_per_month"
    )
    if params.min_price is not None:
        qs = qs.filter(**{f"{price_field}__gte": params.min_price})
    if params.max_price is not None:
        qs = qs.filter(**{f"{price_field}__lte": params.max_price})
    if params.min_area is not None:
        qs = qs.filter(area__gte=params.min_area)
    if params.max_area is not None:
        qs = qs.filter(area__lte=params.max_area)

    price_order = (
        "human_price"
        if params.sale_type == settings.RE_OBJECTS_SALE_TYPE_SALE
        else "price_per_month"
    )
    if params.order_by == "price_asc":
        qs = qs.order_by(price_order, "id")
    elif params.order_by == "price_desc":
        qs = qs.order_by(f"-{price_order}", "id")
    elif params.order_by == "area_asc":
        qs = qs.order_by("area", "id")
    elif params.order_by == "area_desc":
        qs = qs.order_by("-area", "id")
    else:
        qs = qs.order_by("city", "building", "floor__number", "number", "id")
    return qs


def _premise_filter_for_buildings(
    sale_type: Optional[str],
    available: Optional[bool],
) -> Q:
    """Фильтр помещений по sale_type и available. available: True/False — фильтр по статусу, None — без фильтра."""
    q = Q()
    if available is not None:
        if available:
            q &= Q(status=Premise.Status.AVAILABLE)
        else:
            q &= Q(
                status__in=[
                    Premise.Status.RESERVED,
                    Premise.Status.RENTED,
                    Premise.Status.UNAVAILABLE,
                ]
            )
    if sale_type == settings.RE_OBJECTS_SALE_TYPE_RENT:
        q &= Q(available_for_rent=True)
    elif sale_type == settings.RE_OBJECTS_SALE_TYPE_SALE:
        q &= Q(available_for_sale=True)
    return q


async def get_buildings_for_filter(
    sale_type: Optional[str] = None,
    available: Optional[bool] = None,
) -> list[BuildingOptionOut]:
    """
    Список зданий для фильтра (чекбоксы «бизнес-центры»).

    Возвращает здания, у которых есть хотя бы одно помещение с учётом sale_type и available.
    available: True/False — фильтр по статусу, None — без фильтра (любые помещения).
    Ответ: список [{ uuid, name, address }, ...].
    """
    premise_filter = _premise_filter_for_buildings(sale_type, available)
    subq = Premise.objects.filter(premise_filter).values("building_id").distinct()
    qs = Building.objects.filter(id__in=Subquery(subq)).order_by("name")
    return [
        BuildingOptionOut(uuid=str(b.uuid), name=b.name, address=b.address)
        async for b in qs
    ]


def _build_building_media(building: Building) -> list[BaseMediaItemOut]:
    """Собирает медиа здания: один плоский список images + videos, сортировка по order."""
    items: list[tuple[int, int, str, str]] = []
    for img in building.images.all():
        if img.file:
            items.append((img.order, img.pk, "photo", img.file.url))
    for vid in building.videos.all():
        if vid.file:
            items.append((vid.order, vid.pk, "video", vid.file.url))
    items.sort(key=lambda x: (x[0], x[1]))
    return [
        BaseMediaItemOut(type=t, url=url) for _, _, t, url in items
    ]


def building_to_list_out(b: Building) -> BuildingListOut:
    """Маппинг Building -> BuildingListOut (uuid, title, address, description, min_sale_price, min_rent_price, media)."""
    min_rent_val = float(b.min_rent) if b.min_rent is not None else None
    min_sale_val = float(b.min_sale) if b.min_sale is not None else None
    return BuildingListOut(
        uuid=str(b.uuid),
        title=b.name,
        address=b.address,
        description=b.description or "",
        geo_point=_building_geo_point_out(b),
        min_sale_price=min_sale_val,
        min_rent_price=min_rent_val,
        media=_build_building_media(b),
    )


def get_buildings_queryset():
    """Строит queryset зданий с помещениями и аннотациями min_rent, min_sale."""
    return (
        Building.objects.filter(premises__isnull=False)
        .prefetch_related("images", "videos")
        .annotate(
            min_rent=Min(
                "premises__price_per_month",
                filter=Q(premises__available_for_rent=True),
            ),
            min_sale=Min(
                "premises__human_price",
                filter=Q(premises__available_for_sale=True),
            ),
        )
        .distinct()
        .order_by("name")
    )


async def get_buildings(
    page: int = 1,
    page_size: int = 6,
) -> BuildingListResponse:
    """
    Список зданий: uuid, title, address, description, min_sale_price, min_rent_price, media.

    Пагинация: page, page_size. Ответ: { items, total, page, page_size, total_pages }.
    """
    qs = get_buildings_queryset()
    result = await get_paginated_list(
        qs,
        page=page,
        page_size=page_size,
        to_out=building_to_list_out,
    )
    return BuildingListResponse(**result)


def _build_building_detail_media(building: Building) -> tuple[list[str], list[BuildingMediaItemOut]]:
    """
    Собирает категории и медиа здания.

    Возвращает (media_categories, media). Один плоский список images + videos, сортировка по order.
    """
    categories: set[str] = set()
    items: list[tuple[int, int, str, str, str, Optional[str]]] = []

    for img in building.images.all():
        if img.file:
            cat = img.category.strip() if img.category else ""
            if cat:
                categories.add(cat)
            items.append((img.order, img.pk, "photo", img.file.url, cat, img.title or None))
    for vid in building.videos.all():
        if vid.file:
            cat = vid.category.strip() if vid.category else ""
            if cat:
                categories.add(cat)
            items.append((vid.order, vid.pk, "video", vid.file.url, cat, vid.title or None))

    items.sort(key=lambda x: (x[0], x[1]))
    media = [
        BuildingMediaItemOut(type=t, url=url, category=cat, title=title)
        for _, _, t, url, cat, title in items
    ]
    return (sorted(categories), media)


async def get_building(building_uuid: UUID) -> Optional[BuildingDetailOut]:
    """
    Здание по UUID: uuid, title, address, description, total_floors, year_built, min_sale_price, min_rent_price, media_categories, media.

    Только здания с помещениями. Использует aget() и prefetch images, videos.
    """
    try:
        b = await (
            Building.objects.select_related("city")
            .prefetch_related("images", "videos")
            .annotate(
                min_rent=Min(
                    "premises__price_per_month",
                    filter=Q(premises__available_for_rent=True),
                ),
                min_sale=Min(
                    "premises__human_price",
                    filter=Q(premises__available_for_sale=True),
                ),
            )
            .filter(premises__isnull=False)
            .aget(uuid=building_uuid)
        )
    except Building.DoesNotExist:
        return None

    media_categories, media = _build_building_detail_media(b)
    min_rent_val = float(b.min_rent) if b.min_rent is not None else None
    min_sale_val = float(b.min_sale) if b.min_sale is not None else None

    return BuildingDetailOut(
        uuid=str(b.uuid),
        title=b.name,
        address=b.address,
        description=b.description or "",
        geo_point=_building_geo_point_out(b),
        total_floors=b.total_floors,
        year_built=b.year_built,
        min_sale_price=min_sale_val,
        min_rent_price=min_rent_val,
        media_categories=media_categories,
        media=media,
    )


def _build_premise_media(p: Premise) -> list[BaseMediaItemOut]:
    """Собирает медиа помещения: плоский список с type, url. Видео помещений в модели пока нет."""
    return [
        BaseMediaItemOut(type="photo", url=img.file.url)
        for img in sorted(p.images.all(), key=lambda x: (x.order, x.pk))
        if img.file
    ]


def _use_human_price_in_price_field(p: Premise, sale_type: Optional[str]) -> bool:
    """Для поля price отдаём human_price (продажа), иначе price_per_month (аренда)."""
    if sale_type == settings.RE_OBJECTS_SALE_TYPE_SALE:
        return True
    if sale_type == settings.RE_OBJECTS_SALE_TYPE_RENT:
        return False
    return bool(p.available_for_sale and not p.available_for_rent)


def _premise_price_for_api(p: Premise, sale_type: Optional[str]) -> Decimal:
    if _use_human_price_in_price_field(p, sale_type):
        return p.human_price
    return p.price_per_month


def premise_to_list_out(p: Premise, sale_type: Optional[str] = None) -> PremiseListOut:
    """Маппинг Premise -> PremiseListOut; price при продаже — human_price (без отдельного поля в схеме)."""
    return PremiseListOut(
        uuid=str(p.uuid),
        building_uuid=str(p.building.uuid),
        name=p.number or p.building.name or "",
        price=_premise_price_for_api(p, sale_type),
        address=p.building.address,
        floor=p.floor.number if p.floor else None,
        area=p.area,
        has_tenant=(p.status != Premise.Status.AVAILABLE),
        media=_build_premise_media(p),
    )


def premise_to_detail_out(p: Premise, sale_type: Optional[str] = None) -> PremiseDetailOut:
    """Маппинг Premise -> PremiseDetailOut; price при продаже — human_price."""
    return PremiseDetailOut(
        uuid=str(p.uuid),
        building_uuid=str(p.building.uuid),
        name=p.number or p.building.name or "",
        price=_premise_price_for_api(p, sale_type),
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

    Использует get_paginated_list (core.pagination).
    """
    qs = get_filtered_premise_queryset(params)
    result = await get_paginated_list(
        qs,
        page=params.page,
        page_size=params.page_size,
        to_out=lambda p: premise_to_list_out(p, params.sale_type),
    )
    return PremiseListResponse(**result)


async def get_premise_by_uuid(
    premise_uuid: UUID,
    sale_type: Optional[str] = None,
) -> Optional[PremiseDetailOut]:
    """
    Возвращает помещение по UUID в виде PremiseDetailOut или None.

    Только помещения со статусом AVAILABLE. Использует aget() и prefetch images.
    sale_type=sale: поле price — human_price (итог продажи из кэша).
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
    return premise_to_detail_out(p, sale_type)


def _format_price(value: Decimal) -> str:
    """Форматирует цену: 100000 -> '100 000 ₽/мес'."""
    if value is None:
        return "—"
    s = f"{int(value):,}".replace(",", " ")
    return f"{s} ₽/мес"


def _format_sale_total_label(value: Decimal) -> str:
    """Итоговая стоимость продажи для подписи на схеме этажа."""
    if value is None:
        return "—"
    s = f"{int(value):,}".replace(",", " ")
    return f"{s} ₽"


def _format_area(value: Decimal) -> str:
    """Форматирует площадь: 50 -> '50 м²'."""
    if value is None:
        return "—"
    return f"{value} м²"


async def get_premises_for_floor(
    building_uuid: UUID,
    floor_number: int,
) -> FloorResponseOut:
    """
    Список помещений на этаже здания.

    building_uuid: UUID здания.
    floor_number: номер этажа.
    Возвращает объект с UUID здания, номером этажа, SVG-схемой и списком помещений.
    """
    try:
        floor = await Floor.objects.select_related("building").aget(
            building__uuid=building_uuid,
            number=floor_number,
        )
    except Floor.DoesNotExist:
        return FloorResponseOut(
            building_uuid=str(building_uuid),
            floor_number=floor_number,
            schema_svg=None,
            premises=[],
        )

    items: list[FloorPremiseOut] = []
    async for p in Premise.objects.filter(floor=floor).order_by("number", "id"):
        if p.available_for_sale and not p.available_for_rent:
            label_price = _format_sale_total_label(p.human_price)
        else:
            label_price = _format_price(p.price_per_month)
        items.append(
            FloorPremiseOut(
                uuid=str(p.uuid),
                name=p.number or "Помещение",
                label_area=_format_area(p.area),
                label_price=label_price,
                is_occupied=(p.status != Premise.Status.AVAILABLE),
            )
        )
    schema_svg = await _read_floor_schema_svg(floor)
    return FloorResponseOut(
        building_uuid=str(floor.building.uuid),
        floor_number=floor.number,
        schema_svg=schema_svg,
        premises=items,
    )


@sync_to_async
def _read_floor_schema_svg(floor: Floor) -> Optional[str]:
    """Читает SVG-схему этажа и возвращает её как текст."""
    if not floor.schema_svg:
        return None

    try:
        floor.schema_svg.open("rb")
        data = floor.schema_svg.read()
    except (OSError, ValueError):
        return None
    finally:
        try:
            floor.schema_svg.close()
        except (OSError, ValueError):
            pass

    if isinstance(data, bytes):
        return data.decode("utf-8", errors="replace")
    return str(data)
