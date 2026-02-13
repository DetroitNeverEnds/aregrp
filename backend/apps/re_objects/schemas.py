"""
Схемы API для объектов недвижимости (помещения).

Используются в GET /premises (список с фильтрами и пагинацией) и GET /premises/{uuid} (деталь).
Поля ответа: uuid, название, стоимость, адрес, этаж, площадь, has_tenant, media (фото/видео).
"""
from decimal import Decimal
from typing import Optional

from ninja import Schema


class MediaPhotoOut(Schema):
    """Один элемент фото в блоке медиа помещения."""

    url: str
    title: Optional[str] = None
    is_primary: bool = False


class MediaVideoOut(Schema):
    """Один элемент видео в блоке медиа помещения (пока не используется)."""

    url: str
    title: Optional[str] = None


class PremiseMediaOut(Schema):
    """Медиа помещения: списки фото и видео."""

    photos: list[MediaPhotoOut]
    videos: list[MediaVideoOut]


class PremiseListOut(Schema):
    """Помещение в списке (карточка в выдаче)."""

    uuid: str  # Публичный идентификатор (UUID)
    name: str
    price: Decimal
    address: str
    floor: Optional[int] = None
    area: Decimal
    has_tenant: bool
    media: PremiseMediaOut


class PremiseDetailOut(PremiseListOut):
    """Помещение: полная информация для страницы объекта (все поля списка + описание и доп. параметры)."""

    description: Optional[str] = None
    price_per_sqm: Optional[Decimal] = None
    ceiling_height: Optional[Decimal] = None
    has_windows: bool = True
    has_parking: bool = False
    is_furnished: bool = False


class PremiseListResponse(Schema):
    """Ответ списка помещений: массив items, total, page, page_size."""

    items: list[PremiseListOut]
    total: int
    page: int
    page_size: int
