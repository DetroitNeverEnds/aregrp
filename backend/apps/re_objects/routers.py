"""
Роутер API помещений: поиск (список) и деталь.

Краткое описание ручек поиска:

1) GET /api/v1/premises — поиск помещений с фильтрами и пагинацией (sale_type опционально).
   Ответ: { items: [...], total, page, page_size, total_pages }. Параметры: sale_type, available (необяз.), building, building_uuids, min/max price, min/max area, order_by, page, page_size.
2) GET /api/v1/premises/buildings — список зданий для фильтра (uuid, name, address); опционально sale_type, available.
3) GET /api/v1/buildings/ — список зданий с пагинацией (page, page_size).
4) GET /api/v1/buildings/{uuid} — информация о здании (media_categories, media).
5) GET /api/v1/floors/{building_uuid}/{floor_number} — этаж; обязательный query sale_type (rent|sale) для is_available.
6) GET /api/v1/premises/{premise_uuid} — детальная карточка помещения по UUID (те же поля + description,
   price_per_sqm, ...). Всегда: sale_price, rent_price (по флагам available_for_sale / available_for_rent).
   Поле price — обратная совместимость (зависит от sale_type). 404 — ProblemDetail.

Вся логика в services.premise_service; роутер только парсит query (в т.ч. через parse_building_uuids)
и вызывает async-функции сервиса.
"""
from decimal import Decimal
from typing import Optional
from uuid import UUID

from django.conf import settings
from ninja import Query, Router
from ninja.errors import HttpError

from api.schemas import ProblemDetail
from .errors import ReObjectsErrorCodes, create_re_objects_error
from .schemas import (
    BuildingDetailOut,
    BuildingListResponse,
    BuildingOptionOut,
    FloorResponseOut,
    PremiseDetailOut,
    PremiseListResponse,
)
from .services import (
    PremiseFilterParams,
    get_building,
    get_buildings,
    get_buildings_for_filter,
    get_premise_by_uuid,
    get_premise_list,
    get_premises_for_floor,
    parse_building_uuids,
)


premises_router = Router(tags=["Premises"])
buildings_router = Router(tags=["Buildings"])
floors_router = Router(tags=["Floors"])


def _validated_floor_sale_type(sale_type: str) -> str:
    rent, sale = settings.RE_OBJECTS_SALE_TYPE_RENT, settings.RE_OBJECTS_SALE_TYPE_SALE
    if sale_type not in (rent, sale):
        raise HttpError(422, f"sale_type must be '{rent}' or '{sale}'")
    return sale_type


# ─── Premises (prefix /premises) ─────────────────────────────────────────────

@premises_router.get(
    "/buildings",
    response={200: list[BuildingOptionOut]},
    summary="Список зданий для фильтра",
    description=(
        "Здания, у которых есть помещения (с учётом sale_type и available). "
        "Фронт запрашивает один раз и подставляет в чекбоксы «бизнес-центры»."
    ),
)
async def building_filter_list(
    request,
    sale_type: Optional[str] = Query(
        None,
        description=f"{settings.RE_OBJECTS_SALE_TYPE_RENT} — только с помещениями под аренду, {settings.RE_OBJECTS_SALE_TYPE_SALE} — под продажу",
    ),
    available: Optional[bool] = Query(
        None,
        description="true — только со свободными помещениями, false — только с занятыми. Не передано — без фильтра.",
    ),
):
    """Список зданий для мультиселекта фильтра. Ответ: [{ uuid, name, address }, ...]."""
    items = await get_buildings_for_filter(sale_type=sale_type, available=available)
    return 200, items


# ─── Buildings (prefix /buildings) ───────────────────────────────────────────

@buildings_router.get(
    "/",
    response={200: BuildingListResponse},
    summary="Список зданий",
    description="Список зданий с помещениями. Пагинация: page, page_size. Ответ: items, total, page, page_size, total_pages.",
)
async def building_list(
    request,
    page: int = Query(1, ge=1, description="Номер страницы"),
    page_size: int = Query(6, ge=1, le=100, description="Размер страницы"),
):
    """Список зданий с пагинацией. Ответ: items, total, page, page_size, total_pages."""
    result = await get_buildings(page=page, page_size=page_size)
    return 200, result


@buildings_router.get(
    "/{building_uuid}",
    response={200: BuildingDetailOut, 404: ProblemDetail},
    summary="Здание по UUID",
    description="Деталь: uuid, title, address, description, total_floors, year_built, min_sale_price, min_rent_price, media_categories, media.",
)
async def building_detail(request, building_uuid: UUID):
    """Здание по UUID. 404 — ProblemDetail."""
    result = await get_building(building_uuid)
    if result is None:
        return 404, create_re_objects_error(
            status=404,
            code=ReObjectsErrorCodes.NOT_FOUND,
            title="Not Found",
            detail="Здание не найдено.",
            instance=f"/api/v1/buildings/{building_uuid}",
        )
    return 200, result


# ─── Floors (prefix /floors) ──────────────────────────────────────────────────

@floors_router.get(
    "/{building_uuid}/{floor_number}",
    response={200: FloorResponseOut},
    summary="Помещения на этаже",
    description=(
        "Данные этажа: building_uuid, floor_number, schema_svg и premises "
        "[{ uuid, name, label_area, label_price, is_available, is_occupied }]. "
        f"Обязательный query sale_type: {settings.RE_OBJECTS_SALE_TYPE_RENT} или "
        f"{settings.RE_OBJECTS_SALE_TYPE_SALE} — семантика is_available."
    ),
)
async def floor_premises_list(
    request,
    building_uuid: UUID,
    floor_number: int,
    sale_type: str = Query(
        ...,
        description=(
            f"{settings.RE_OBJECTS_SALE_TYPE_RENT} — аренда, "
            f"{settings.RE_OBJECTS_SALE_TYPE_SALE} — продажа (обязательно)"
        ),
    ),
):
    """Данные этажа с SVG-схемой и списком помещений."""
    st = _validated_floor_sale_type(sale_type)
    items = await get_premises_for_floor(
        building_uuid=building_uuid,
        floor_number=floor_number,
        sale_type=st,
    )
    return 200, items


# ─── Premises (продолжение) ───────────────────────────────────────────────────

@premises_router.get(
    "",
    response={200: PremiseListResponse},
    summary="Список помещений с фильтрами и пагинацией",
    description=(
        f"Фильтры: sale_type ({settings.RE_OBJECTS_SALE_TYPE_RENT}|{settings.RE_OBJECTS_SALE_TYPE_SALE}), "
        "available, building, building_uuids, min/max price и площадь, order_by, page, page_size. "
        "Без available при sale_type=rent|sale возвращаются только свободные по сделкам и брони."
    ),
)
async def premise_list(
    request,
    sale_type: Optional[str] = Query(
        None,
        description=f"{settings.RE_OBJECTS_SALE_TYPE_RENT} — аренда, {settings.RE_OBJECTS_SALE_TYPE_SALE} — продажа",
    ),
    available: Optional[bool] = Query(
        None,
        description=(
            "true — только свободные по сделкам/брони, false — только занятые. "
            "Не передано при sale_type=rent|sale — то же, что true (каталог без сданных/забронированных)."
        ),
    ),
    building: Optional[str] = Query(None, description="Поиск по адресу или названию здания"),
    building_uuids: Optional[str] = Query(None, description="Фильтр по UUID зданий (через запятую)"),
    min_price: Optional[int] = Query(
        None,
        description="Минимальная цена (целые ₽): при sale_type=sale — итог продажи, иначе аренда за месяц.",
    ),
    max_price: Optional[int] = Query(
        None,
        description="Максимальная цена (целые ₽): при sale_type=sale — итог продажи, иначе аренда за месяц.",
    ),
    min_area: Optional[Decimal] = Query(None, description="Минимальная площадь, м²"),
    max_area: Optional[Decimal] = Query(None, description="Максимальная площадь, м²"),
    order_by: str = Query("default", description="default|price_asc|price_desc|area_asc|area_desc"),
    page: int = Query(1, ge=1, description="Номер страницы"),
    page_size: int = Query(20, ge=1, le=100, description="Размер страницы"),
):
    """Список помещений с фильтрами (sale_type, available, building, building_uuids, price, area) и пагинацией. Ответ: items, total, page, page_size, total_pages."""
    params = PremiseFilterParams(
        sale_type=sale_type,
        available=available,
        building_query=building,
        building_uuids=parse_building_uuids(building_uuids),
        min_price=min_price,
        max_price=max_price,
        min_area=min_area,
        max_area=max_area,
        order_by=order_by,
        page=page,
        page_size=page_size,
    )
    result = await get_premise_list(params)
    return 200, result


@premises_router.get(
    "/{premise_uuid}",
    response={200: PremiseDetailOut, 404: ProblemDetail},
    summary="Детальная информация о помещении",
    description=(
        "Помещение по UUID: uuid, name, price (legacy), sale_price, rent_price, address, floor, area, has_tenant, media, "
        "description, price_per_sqm, ceiling_height, has_windows, has_parking, is_furnished. Только AVAILABLE. "
        "sale_price / rent_price — всегда в ответе (null, если вид сделки не предлагается). "
        f"Параметр sale_type: price — как раньше ({settings.RE_OBJECTS_SALE_TYPE_SALE} — продажа, иначе аренда). "
        "404 — ProblemDetail."
    ),
)
async def premise_detail(
    request,
    premise_uuid: UUID,
    sale_type: Optional[str] = Query(
        None,
        description=(
            f"{settings.RE_OBJECTS_SALE_TYPE_SALE} — price как полная стоимость продажи. "
            f"{settings.RE_OBJECTS_SALE_TYPE_RENT} — price как аренда за месяц."
        ),
    ),
):
    """Возвращает одну запись по UUID или 404 (ProblemDetail), только статус AVAILABLE."""
    result = await get_premise_by_uuid(premise_uuid, sale_type=sale_type)
    if result is None:
        return 404, create_re_objects_error(
            status=404,
            code=ReObjectsErrorCodes.NOT_FOUND,
            title="Not Found",
            detail="Помещение не найдено или недоступно.",
            instance=f"/api/v1/premises/{premise_uuid}",
        )
    return 200, result
