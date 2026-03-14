"""
Схемы API для объектов недвижимости (помещения).

Используются в GET /premises (список с фильтрами и пагинацией) и GET /premises/{uuid} (деталь).
Поля ответа: uuid, название, стоимость, адрес, этаж, площадь, has_tenant, media (фото/видео).
"""
from decimal import Decimal
from typing import Literal, Optional

from ninja import Schema




class BaseMediaItemOut(Schema):
    """Базовая схема медиа: type, url."""

    type: Literal["photo", "video"]
    url: str


class BuildingMediaItemOut(BaseMediaItemOut):
    """Медиа здания: + category, title."""

    category: str = ""
    title: Optional[str] = None


class PremiseListOut(Schema):
    """Помещение в списке (карточка в выдаче)."""

    uuid: str  # Публичный идентификатор (UUID)
    building_uuid: str  # UUID здания, к которому относится помещение
    name: str
    price: Decimal
    address: str
    floor: Optional[int] = None
    area: Decimal
    has_tenant: bool
    media: list[BaseMediaItemOut]


class PremiseDetailOut(PremiseListOut):
    """Помещение: полная информация для страницы объекта (все поля списка + описание и доп. параметры)."""

    description: Optional[str] = None
    price_per_sqm: Optional[Decimal] = None
    ceiling_height: Optional[Decimal] = None
    has_windows: bool = True
    has_parking: bool = False
    is_furnished: bool = False


class PremiseListResponse(Schema):
    """Ответ списка помещений: items, total, page, page_size, total_pages."""

    items: list[PremiseListOut]
    total: int
    page: int
    page_size: int
    total_pages: int


class BuildingOptionOut(Schema):
    """Здание для фильтра (чекбоксы «бизнес-центры»): uuid, название, адрес."""

    uuid: str
    name: str
    address: str


class BuildingListOut(Schema):
    """Здание в списке: uuid, title, address, description, min_sale_price, min_rent_price, media."""

    uuid: str
    title: str
    address: str
    description: str
    min_sale_price: Optional[float] = None
    min_rent_price: Optional[float] = None
    media: list[BaseMediaItemOut]


class BuildingDetailOut(Schema):
    """Здание (деталь): uuid, title, address, description, total_floors, year_built, min_sale_price, min_rent_price, media_categories, media."""

    uuid: str
    title: str
    address: str
    description: str
    total_floors: Optional[int] = None
    year_built: Optional[int] = None
    min_sale_price: Optional[float] = None
    min_rent_price: Optional[float] = None
    media_categories: list[str]
    media: list[BuildingMediaItemOut]


class BuildingListResponse(Schema):
    """Ответ списка зданий: items, total, page, page_size, total_pages."""

    items: list[BuildingListOut]
    total: int
    page: int
    page_size: int
    total_pages: int


class FloorPremiseOut(Schema):
    """Помещение на этаже: номер/название, площадь, стоимость, занятость."""

    uuid: str
    name: str  # номер помещения (Premise.number или название)
    label_area: str  # площадь, например "50 м²"
    label_price: str  # стоимость, например "100 000 ₽/мес"
    is_occupied: bool  # True — занято, False — свободно


class FloorResponseOut(Schema):
    """Ответ по этажу: UUID здания, номер этажа, SVG-схема и список помещений."""

    building_uuid: str
    floor_number: int
    schema_svg: Optional[str] = None
    premises: list[FloorPremiseOut]
