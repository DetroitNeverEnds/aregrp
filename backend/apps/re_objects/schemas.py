"""
Схемы API для объектов недвижимости (помещения).

Используются в GET /premises (список с фильтрами и пагинацией) и GET /premises/{uuid} (деталь).
Поля ответа: uuid, название, price (legacy), sale_price, rent_price, адрес, этаж, площадь, has_tenant, media.
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
    """Помещение в списке.

    price — устаревшее поле для обратной совместимости (как раньше: от sale_type/флагов).
    sale_price — полная стоимость продажи, если помещение в продаже; иначе null.
    rent_price — аренда за месяц, если в аренде; иначе null.
    """

    uuid: str  # Публичный идентификатор (UUID)
    building_uuid: str  # UUID здания, к которому относится помещение
    name: str
    price: Optional[int] = None
    sale_price: Optional[int] = None
    rent_price: Optional[int] = None
    address: str
    floor: Optional[int] = None
    area: Decimal
    has_tenant: bool
    media: list[BaseMediaItemOut]


class PremiseDetailOut(PremiseListOut):
    """Помещение: полная информация для страницы объекта (все поля списка + описание и доп. параметры)."""

    description: Optional[str] = None
    price_per_sqm: Optional[int] = None
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


class BuildingGeoPointOut(Schema):
    """Точка на карте (WGS-84): lat — широта, lon — долгота."""

    lat: float
    lon: float


class BuildingListOut(Schema):
    """Здание в списке: uuid, title, address, description, geo_point, min_sale_price, min_rent_price, media."""

    uuid: str
    title: str
    address: str
    description: str
    geo_point: Optional[BuildingGeoPointOut] = None
    min_sale_price: Optional[int] = None
    min_rent_price: Optional[int] = None
    media: list[BaseMediaItemOut]


class BuildingDetailOut(Schema):
    """Здание (деталь): uuid, title, address, description, geo_point, total_floors, year_built, min_sale_price, min_rent_price, media_categories, media."""

    uuid: str
    title: str
    address: str
    description: str
    geo_point: Optional[BuildingGeoPointOut] = None
    total_floors: Optional[int] = None
    year_built: Optional[int] = None
    min_sale_price: Optional[int] = None
    min_rent_price: Optional[int] = None
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
    """Помещение на этаже: номер/название, площадь, стоимость, доступность и занятость по аренде."""

    uuid: str
    name: str  # номер помещения (Premise.number или название)
    label_area: str  # площадь, например "50 м²"
    label_price: str  # стоимость, например "100 000 ₽"
    is_available: bool  # по sale_type запроса: свободно для аренды или для продажи
    is_occupied: bool  # True — есть сделки типа «аренда» (для rent и sale одинаково)


class FloorResponseOut(Schema):
    """Ответ по этажу: UUID здания, номер этажа, SVG-схема и список помещений."""

    building_uuid: str
    floor_number: int
    schema_svg: Optional[str] = None
    premises: list[FloorPremiseOut]
