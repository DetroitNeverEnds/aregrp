"""
Сервисный слой для помещений: фильтрация, пагинация, получение по UUID.

Публичный API:
- parse_building_uuids(value) — парсит строку 'uuid1,uuid2,...' в список UUID для фильтра зданий.
- get_premise_list(params) — пагинированный список по фильтрам (sale_type, available, building_query, building_uuids, price/area, order_by).
- get_buildings_for_filter(sale_type, available) — список зданий для фильтра (uuid, name, address). available: None — без фильтра.
- get_buildings(page, page_size) — список зданий с пагинацией.
- get_premise_by_uuid(...): price — legacy; sale_price / rent_price — по флагам available_for_sale / available_for_rent.
- get_premises_for_floor(building_uuid, floor_number, sale_type) — данные этажа (is_available зависит от sale_type).

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
from django.utils import timezone

from core.pagination import get_paginated_list

from apps.bookings.models import Booking
from apps.deals.models import Deal

from ..availability import annotate_premise_availability, premise_filter_for_buildings_q
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

    sale_type: rent | sale (из settings). available: при None и sale_type задан — как True (каталог).
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
        min_price: Optional[int] = None,
        max_price: Optional[int] = None,
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

    Фильтры: available (True/False; при sale_type=rent|sale и None — как True), sale_type, building_query,
    building_uuids, min_price, max_price, min_area, max_area. Сортировка по order_by.
    Не обращается к БД (lazy), пагинация не применяется.
    Результат передаётся в async-методы (acount, async for).
    """
    qs = Premise.objects.select_related("building", "city", "floor").prefetch_related(
        "images"
    )
    qs = annotate_premise_availability(qs)

    rent = settings.RE_OBJECTS_SALE_TYPE_RENT
    sale = settings.RE_OBJECTS_SALE_TYPE_SALE

    # Каталог с sale_type: без query available — только реально свободные по сделкам/брони.
    avail = params.available
    if avail is None and params.sale_type in (rent, sale):
        avail = True

    if avail is True:
        if params.sale_type == rent:
            qs = qs.filter(
                available_for_rent=True,
                _active_rent_period=False,
                _active_booking=False,
            )
        elif params.sale_type == sale:
            qs = qs.filter(
                available_for_sale=True,
                _active_booking=False,
                _has_sale_deal=False,
            )
        else:
            qs = qs.filter(
                (
                    Q(available_for_rent=True)
                    & Q(_active_rent_period=False)
                    & Q(_active_booking=False)
                )
                | (
                    Q(available_for_sale=True)
                    & Q(_active_booking=False)
                    & Q(_has_sale_deal=False)
                )
            )
    elif avail is False:
        if params.sale_type == rent:
            qs = qs.filter(
                Q(available_for_rent=False)
                | Q(_active_rent_period=True)
                | Q(_active_booking=True)
            )
        elif params.sale_type == sale:
            qs = qs.filter(
                Q(available_for_sale=False)
                | Q(_active_booking=True)
                | Q(_has_sale_deal=True)
            )
        else:
            qs = qs.exclude(
                (
                    Q(available_for_rent=True)
                    & Q(_active_rent_period=False)
                    & Q(_active_booking=False)
                )
                | (
                    Q(available_for_sale=True)
                    & Q(_active_booking=False)
                    & Q(_has_sale_deal=False)
                )
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
        "full_sell_price"
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
        "full_sell_price"
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


async def get_buildings_for_filter(
    sale_type: Optional[str] = None,
    available: Optional[bool] = None,
) -> list[BuildingOptionOut]:
    """
    Список зданий для фильтра (чекбоксы «бизнес-центры»).

    Возвращает здания, у которых есть хотя бы одно помещение с учётом sale_type и available.
    available: True/False — по правилам сделок и броней, None — без фильтра по доступности.
    Ответ: список [{ uuid, name, address }, ...].
    """
    premise_filter = premise_filter_for_buildings_q(sale_type, available)
    subq = Premise.objects.filter(premise_filter).values("building_id").distinct()
    qs = Building.objects.filter(id__in=Subquery(subq)).order_by("name")
    return [
        BuildingOptionOut(uuid=str(b.uuid), name=b.name, address=b.address)
        async for b in qs
    ]


def _photo_api_urls(img) -> tuple[Optional[str], Optional[str]]:
    """url = card (или оригинал), full_url = detail (или оригинал) — fallback до бэкфилла."""
    if img.card and img.detail:
        return img.card.url, img.detail.url
    if img.original:
        u = img.original.url
        return u, u
    return None, None


def _video_api_urls(vid) -> tuple[Optional[str], Optional[str]]:
    if vid.file and vid.card:
        return vid.card.url, vid.file.url
    if vid.file:
        u = vid.file.url
        return u, u
    return None, None


def _build_building_media(building: Building) -> list[BaseMediaItemOut]:
    """Собирает медиа здания: один плоский список images + videos, сортировка по order."""
    items: list[tuple[int, int, str, str, str]] = []
    for img in building.images.all():
        url, full_url = _photo_api_urls(img)
        if url and full_url:
            items.append((img.order, img.pk, "photo", url, full_url))
    for vid in building.videos.all():
        url, full_url = _video_api_urls(vid)
        if url and full_url:
            items.append((vid.order, vid.pk, "video", url, full_url))
    items.sort(key=lambda x: (x[0], x[1]))
    return [
        BaseMediaItemOut(type=t, url=u, full_url=fu) for _, _, t, u, fu in items
    ]


def building_to_list_out(b: Building) -> BuildingListOut:
    """Маппинг Building -> BuildingListOut (uuid, title, address, description, min_sale_price, min_rent_price, media)."""
    min_rent_val = int(b.min_rent) if b.min_rent is not None else None
    min_sale_val = int(b.min_sale) if b.min_sale is not None else None
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
                "premises__full_sell_price",
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
    items: list[tuple[int, int, str, str, str, str, Optional[str]]] = []

    for img in building.images.all():
        url, full_url = _photo_api_urls(img)
        if url and full_url:
            cat = img.category.strip() if img.category else ""
            if cat:
                categories.add(cat)
            items.append((img.order, img.pk, "photo", url, full_url, cat, img.title or None))
    for vid in building.videos.all():
        url, full_url = _video_api_urls(vid)
        if url and full_url:
            cat = vid.category.strip() if vid.category else ""
            if cat:
                categories.add(cat)
            items.append((vid.order, vid.pk, "video", url, full_url, cat, vid.title or None))

    items.sort(key=lambda x: (x[0], x[1]))
    media = [
        BuildingMediaItemOut(type=t, url=u, full_url=fu, category=cat, title=title)
        for _, _, t, u, fu, cat, title in items
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
                    "premises__full_sell_price",
                    filter=Q(premises__available_for_sale=True),
                ),
            )
            .filter(premises__isnull=False)
            .aget(uuid=building_uuid)
        )
    except Building.DoesNotExist:
        return None

    media_categories, media = _build_building_detail_media(b)
    min_rent_val = int(b.min_rent) if b.min_rent is not None else None
    min_sale_val = int(b.min_sale) if b.min_sale is not None else None

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
    """Собирает медиа помещения: плоский список с type, url, full_url. Видео помещений в модели пока нет."""
    out: list[BaseMediaItemOut] = []
    for img in sorted(p.images.all(), key=lambda x: (x.order, x.pk)):
        url, full_url = _photo_api_urls(img)
        if url and full_url:
            out.append(BaseMediaItemOut(type="photo", url=url, full_url=full_url))
    return out


def _api_price_is_full_sell(p: Premise, sale_type: Optional[str]) -> bool:
    """True — в ответе API поле price = полная стоимость продажи; иначе цена аренды за месяц."""
    if sale_type == settings.RE_OBJECTS_SALE_TYPE_SALE:
        return True
    if sale_type == settings.RE_OBJECTS_SALE_TYPE_RENT:
        return False
    return bool(p.available_for_sale and not p.available_for_rent)


def _premise_price_for_api(p: Premise, sale_type: Optional[str]) -> Optional[int]:
    if _api_price_is_full_sell(p, sale_type):
        return p.full_sell_price
    return p.price_per_month


def _premise_sale_price_for_api(p: Premise) -> Optional[int]:
    """Полная стоимость продажи, если помещение предлагается к продаже."""
    return p.full_sell_price if p.available_for_sale else None


def _premise_rent_price_for_api(p: Premise) -> Optional[int]:
    """Аренда за месяц, если помещение в аренде."""
    return p.price_per_month if p.available_for_rent else None


def premise_to_list_out(p: Premise, sale_type: Optional[str] = None) -> PremiseListOut:
    """Маппинг Premise -> PremiseListOut; price — full_sell_price или price_per_month по типу запроса."""
    return PremiseListOut(
        uuid=str(p.uuid),
        building_uuid=str(p.building.uuid),
        name=p.number or p.building.name or "",
        price=_premise_price_for_api(p, sale_type),
        sale_price=_premise_sale_price_for_api(p),
        rent_price=_premise_rent_price_for_api(p),
        address=p.building.address,
        floor=p.floor.number if p.floor else None,
        area=p.area,
        has_tenant=bool(getattr(p, '_any_rent_deal', False)),
        media=_build_premise_media(p),
    )


def premise_to_detail_out(
    p: Premise,
    sale_type: Optional[str] = None,
    *,
    has_rent_deal: Optional[bool] = None,
) -> PremiseDetailOut:
    """Маппинг Premise -> PremiseDetailOut; price — полная продажа или аренда по типу запроса."""
    tenant = (
        bool(has_rent_deal)
        if has_rent_deal is not None
        else bool(getattr(p, '_any_rent_deal', False))
    )
    return PremiseDetailOut(
        uuid=str(p.uuid),
        building_uuid=str(p.building.uuid),
        name=p.number or p.building.name or "",
        price=_premise_price_for_api(p, sale_type),
        sale_price=_premise_sale_price_for_api(p),
        rent_price=_premise_rent_price_for_api(p),
        address=p.building.address,
        floor=p.floor.number if p.floor else None,
        area=p.area,
        has_tenant=tenant,
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

    Использует aget() и prefetch images.
    has_tenant — наличие сделок аренды по помещению.
    """
    try:
        p = await Premise.objects.select_related(
            "building", "city", "floor"
        ).prefetch_related("images").aget(uuid=premise_uuid)
    except Premise.DoesNotExist:
        return None
    has_rent = await Deal.objects.filter(
        premise_id=p.pk,
        deal_type=Deal.DealType.RENT,
    ).aexists()
    return premise_to_detail_out(p, sale_type, has_rent_deal=has_rent)


def _format_area(value: Decimal) -> str:
    """Форматирует площадь: 50 -> '50 м²'."""
    if value is None:
        return "—"
    return f"{value} м²"


def _format_floor_label_price(value: Optional[int]) -> str:
    """Формат цены для схемы этажа: 100000 -> '100 000 ₽'."""
    if value is None:
        return "—"
    return f"{int(value):,}".replace(",", " ") + " ₽"


@sync_to_async
def _floor_premise_availability_rows(
    premises: list[Premise],
    sale_type: str,
) -> list[tuple[Premise, bool, bool]]:
    """
    Для списка помещений этажа: (premise, is_available, is_occupied).
    is_occupied — есть сделка аренды; is_available — по sale_type (rent/sale).
    """
    if not premises:
        return []
    rent = settings.RE_OBJECTS_SALE_TYPE_RENT
    st = sale_type

    pids = [p.pk for p in premises]
    today = timezone.now().date()
    now = timezone.now()

    any_rent = set(
        Deal.objects.filter(
            premise_id__in=pids,
            deal_type=Deal.DealType.RENT,
        ).values_list('premise_id', flat=True)
    )
    active_rent = set(
        Deal.objects.filter(
            premise_id__in=pids,
            deal_type=Deal.DealType.RENT,
            rent_expires_at__gte=today,
        ).values_list('premise_id', flat=True)
    )
    sale_deals = set(
        Deal.objects.filter(
            premise_id__in=pids,
            deal_type=Deal.DealType.SALE,
        ).values_list('premise_id', flat=True)
    )
    booked = set(
        Booking.objects.filter(
            premise_id__in=pids,
            expires_at__gt=now,
        ).values_list('premise_id', flat=True)
    )

    out: list[tuple[Premise, bool, bool]] = []
    for p in premises:
        is_occ = p.pk in any_rent
        if st == rent:
            is_avail = bool(
                p.available_for_rent
                and p.pk not in active_rent
                and p.pk not in booked
            )
        else:
            is_avail = bool(
                p.available_for_sale
                and p.pk not in booked
                and p.pk not in sale_deals
            )
        out.append((p, is_avail, is_occ))
    return out


async def get_premises_for_floor(
    building_uuid: UUID,
    floor_number: int,
    sale_type: str,
) -> FloorResponseOut:
    """
    Список помещений на этаже здания.

    sale_type: rent|sale (обязателен в API) — is_available; is_occupied — по сделкам аренды.
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

    premises = [
        p
        async for p in Premise.objects.filter(floor=floor).order_by("number", "id")
    ]
    rows = await _floor_premise_availability_rows(premises, sale_type)

    items: list[FloorPremiseOut] = []
    for p, is_avail, is_occ in rows:
        if p.available_for_sale and not p.available_for_rent:
            label_price = _format_floor_label_price(p.full_sell_price)
        else:
            label_price = _format_floor_label_price(p.price_per_month)
        items.append(
            FloorPremiseOut(
                uuid=str(p.uuid),
                name=p.number or "Помещение",
                label_area=_format_area(p.area),
                label_price=label_price,
                is_available=is_avail,
                is_occupied=is_occ,
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
