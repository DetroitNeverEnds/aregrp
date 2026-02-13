"""
Роутер API помещений: поиск (список) и деталь.

Краткое описание ручек поиска:

1) GET /api/v1/premises — поиск помещений с фильтрами и пагинацией (sale_type опционально).
2) GET /api/v1/premises/rent — то же, только для аренды (sale_type=rent).
3) GET /api/v1/premises/sale — то же, только для продажи (sale_type=sale).
   Ответ у 1–3: { items: [...], total, page, page_size }. Параметры: available, building, min/max price, min/max area, order_by, page, page_size. В каждом item: uuid, name, price, address, floor, area, has_tenant, media.

4) GET /api/v1/premises/{premise_uuid} — детальная карточка помещения по UUID (те же поля + description,
   price_per_sqm, ceiling_height, has_windows, has_parking, is_furnished). 404 — ProblemDetail.

Вся логика в services.premise_service; роутер только парсит query и вызывает async-сервис.
"""
from decimal import Decimal
from typing import Optional
from uuid import UUID

from django.conf import settings
from ninja import Query, Router

from api.schemas import ProblemDetail
from .errors import ReObjectsErrorCodes, create_re_objects_error
from .schemas import PremiseDetailOut, PremiseListResponse
from .services import PremiseFilterParams, get_premise_by_uuid, get_premise_list


re_objects_router = Router()


@re_objects_router.get(
    "/premises",
    response={200: PremiseListResponse},
    summary="Список помещений с фильтрами и пагинацией",
    description=(
        f"Фильтры: sale_type ({settings.RE_OBJECTS_SALE_TYPE_RENT}|{settings.RE_OBJECTS_SALE_TYPE_SALE}), "
        "available (true/false — свободно/занято), building, "
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
        description="true — свободные, false — занятые; по умолчанию true",
    ),
    building: Optional[str] = Query(None, description="Поиск по адресу или названию здания"),
    min_price: Optional[Decimal] = Query(None, description="Минимальная цена, ₽/мес"),
    max_price: Optional[Decimal] = Query(None, description="Максимальная цена, ₽/мес"),
    min_area: Optional[Decimal] = Query(None, description="Минимальная площадь, м²"),
    max_area: Optional[Decimal] = Query(None, description="Максимальная площадь, м²"),
    order_by: str = Query("default", description="default|price_asc|price_desc|area_asc|area_desc"),
    page: int = Query(1, ge=1, description="Номер страницы"),
    page_size: int = Query(20, ge=1, le=100, description="Размер страницы"),
):
    """Список помещений с фильтрами (sale_type, available, building, price, area) и пагинацией. Ответ: items, total, page, page_size."""
    params = PremiseFilterParams(
        sale_type=sale_type,
        available=available,
        building_query=building,
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


@re_objects_router.get(
    "/premises/rent",
    response={200: PremiseListResponse},
    summary="Список помещений для аренды",
    description="То же, что GET /premises?sale_type=rent. Остальные фильтры и пагинация — как у общего списка.",
)
async def premise_list_rent(
    request,
    available: Optional[bool] = Query(None, description="true — свободные, false — занятые; по умолчанию true"),
    building: Optional[str] = Query(None, description="Поиск по адресу или названию здания"),
    min_price: Optional[Decimal] = Query(None, description="Минимальная цена, ₽/мес"),
    max_price: Optional[Decimal] = Query(None, description="Максимальная цена, ₽/мес"),
    min_area: Optional[Decimal] = Query(None, description="Минимальная площадь, м²"),
    max_area: Optional[Decimal] = Query(None, description="Максимальная площадь, м²"),
    order_by: str = Query("default", description="default|price_asc|price_desc|area_asc|area_desc"),
    page: int = Query(1, ge=1, description="Номер страницы"),
    page_size: int = Query(20, ge=1, le=100, description="Размер страницы"),
):
    """Список помещений только для аренды (sale_type=rent). Схема ответа та же."""
    params = PremiseFilterParams(
        sale_type=settings.RE_OBJECTS_SALE_TYPE_RENT,
        available=available,
        building_query=building,
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


@re_objects_router.get(
    "/premises/sale",
    response={200: PremiseListResponse},
    summary="Список помещений для продажи",
    description="То же, что GET /premises?sale_type=sale. Остальные фильтры и пагинация — как у общего списка.",
)
async def premise_list_sale(
    request,
    available: Optional[bool] = Query(None, description="true — свободные, false — занятые; по умолчанию true"),
    building: Optional[str] = Query(None, description="Поиск по адресу или названию здания"),
    min_price: Optional[Decimal] = Query(None, description="Минимальная цена, ₽/мес"),
    max_price: Optional[Decimal] = Query(None, description="Максимальная цена, ₽/мес"),
    min_area: Optional[Decimal] = Query(None, description="Минимальная площадь, м²"),
    max_area: Optional[Decimal] = Query(None, description="Максимальная площадь, м²"),
    order_by: str = Query("default", description="default|price_asc|price_desc|area_asc|area_desc"),
    page: int = Query(1, ge=1, description="Номер страницы"),
    page_size: int = Query(20, ge=1, le=100, description="Размер страницы"),
):
    """Список помещений только для продажи (sale_type=sale). Схема ответа та же."""
    params = PremiseFilterParams(
        sale_type=settings.RE_OBJECTS_SALE_TYPE_SALE,
        available=available,
        building_query=building,
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


@re_objects_router.get(
    "/premises/{premise_uuid}",
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
