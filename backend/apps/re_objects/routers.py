"""
Роутер API помещений: поиск (список) и деталь.

Краткое описание ручек поиска:

1) GET /api/v1/premises — поиск помещений с фильтрами и пагинацией (sale_type опционально).
   Ответ: { items: [...], total, page, page_size, total_pages }. Параметры: sale_type, available (необяз.), building, building_uuids, min/max price, min/max area, order_by, page, page_size.
2) GET /api/v1/premises/buildings — список зданий для фильтра (uuid, name, address); опционально sale_type, available.
3) GET /api/v1/buildings/ — список зданий (uuid, title, address, description, min_sale_price, min_rent_price, media).
4) GET /api/v1/buildings/catalogue/{uuid} — информация о здании по UUID (каталог).
5) GET /api/v1/buildings/info/{uuid} — общая информация о здании (media_categories, media).
6) GET /api/v1/premises/{premise_uuid} — детальная карточка помещения по UUID (те же поля + description,
   price_per_sqm, ceiling_height, has_windows, has_parking, is_furnished). 404 — ProblemDetail.

Вся логика в services.premise_service; роутер только парсит query (в т.ч. через parse_building_uuids)
и вызывает async-функции сервиса.
"""
from decimal import Decimal
from typing import Optional
from uuid import UUID

from django.conf import settings
from ninja import Query, Router

from api.schemas import ProblemDetail
from .errors import ReObjectsErrorCodes, create_re_objects_error
from .schemas import (
    BuildingCatalogueOut,
    BuildingCatalogueResponse,
    BuildingInfoOut,
    BuildingOptionOut,
    FloorPremiseOut,
    PremiseDetailOut,
    PremiseListResponse,
)
from .services import (
    PremiseFilterParams,
    get_building_by_uuid,
    get_building_info,
    get_buildings_catalogue,
    get_buildings_for_filter,
    get_premise_by_uuid,
    get_premise_list,
    get_premises_for_floor,
    parse_building_uuids,
)


premises_router = Router(tags=["Premises"])
buildings_router = Router(tags=["Buildings"])
floors_router = Router(tags=["Floors"])


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
    response={200: BuildingCatalogueResponse},
    summary="Список зданий",
    description="Список зданий с помещениями: uuid, title, address, description, min_sale_price, min_rent_price, media.",
)
async def building_catalogue_list(request):
    """Список зданий для страницы каталога. Ответ: [{ uuid, title, address, description, min_sale_price?, min_rent_price?, media }, ...]."""
    items = await get_buildings_catalogue()
    return 200, items


@buildings_router.get(
    "/info/{building_uuid}",
    response={200: BuildingInfoOut, 404: ProblemDetail},
    summary="Общая информация о здании",
    description="Детальная информация о здании: uuid, title, address, description, total_floors, year_built, min_sale_price, min_rent_price, media_categories, media.",
)
async def building_info(request, building_uuid: UUID):
    """Возвращает общую информацию о здании по UUID (с категориями и медиа) или 404."""
    result = await get_building_info(building_uuid)
    if result is None:
        return 404, create_re_objects_error(
            status=404,
            code=ReObjectsErrorCodes.NOT_FOUND,
            title="Not Found",
            detail="Здание не найдено.",
            instance=f"/api/v1/buildings/info/{building_uuid}",
        )
    return 200, result


@buildings_router.get(
    "/catalogue/{building_uuid}",
    response={200: BuildingCatalogueOut, 404: ProblemDetail},
    summary="Информация о здании",
    description="Детальная информация о здании по UUID: uuid, title, address, description, min_sale_price, min_rent_price, media.",
)
async def building_detail(request, building_uuid: UUID):
    """Возвращает информацию о здании по UUID или 404 (ProblemDetail)."""
    result = await get_building_by_uuid(building_uuid)
    if result is None:
        return 404, create_re_objects_error(
            status=404,
            code=ReObjectsErrorCodes.NOT_FOUND,
            title="Not Found",
            detail="Здание не найдено.",
            instance=f"/api/v1/buildings/catalogue/{building_uuid}",
        )
    return 200, result


# ─── Floors (prefix /floors) ──────────────────────────────────────────────────

@floors_router.get(
    "/{building_uuid}/{floor_number}",
    response={200: list[FloorPremiseOut]},
    summary="Помещения на этаже",
    description="Список помещений для этажа здания: name (номер/название), label_area, label_price, is_occupied.",
)
async def floor_premises_list(request, building_uuid: UUID, floor_number: int):
    """Возвращает список помещений на указанном этаже здания."""
    items = await get_premises_for_floor(building_uuid=building_uuid, floor_number=floor_number)
    return 200, items


# ─── Premises (продолжение) ───────────────────────────────────────────────────

@premises_router.get(
    "",
    response={200: PremiseListResponse},
    summary="Список помещений с фильтрами и пагинацией",
    description=(
        f"Фильтры: sale_type ({settings.RE_OBJECTS_SALE_TYPE_RENT}|{settings.RE_OBJECTS_SALE_TYPE_SALE}), "
        "available (true/false — свободно/занято), building (поиск по тексту), building_uuids (UUID зданий через запятую), "
        "min_price, max_price, min_area, max_area. Сортировка: order_by. Пагинация: page, page_size."
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
        description="true — свободные, false — занятые. Не передано — без фильтра по доступности.",
    ),
    building: Optional[str] = Query(None, description="Поиск по адресу или названию здания"),
    building_uuids: Optional[str] = Query(None, description="Фильтр по UUID зданий (через запятую)"),
    min_price: Optional[Decimal] = Query(None, description="Минимальная цена, ₽/мес"),
    max_price: Optional[Decimal] = Query(None, description="Максимальная цена, ₽/мес"),
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
)
async def premise_detail(request, premise_uuid: UUID):
    """Возвращает одну запись по UUID или 404 (ProblemDetail), только статус AVAILABLE."""
    result = await get_premise_by_uuid(premise_uuid)
    if result is None:
        return 404, create_re_objects_error(
            status=404,
            code=ReObjectsErrorCodes.NOT_FOUND,
            title="Not Found",
            detail="Помещение не найдено или недоступно.",
            instance=f"/api/v1/premises/{premise_uuid}",
        )
    return 200, result
