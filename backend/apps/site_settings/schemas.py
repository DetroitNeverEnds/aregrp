"""
Схемы для API настроек сайта.
"""
from typing import Any

from ninja import Schema
from pydantic import Field


class MainSettingsOut(Schema):
    """Схема для возврата основных настроек сайта."""
    phone: str
    display_phone: str
    email: str
    max_link: str | None = None
    telegram_link: str | None = None
    description: str | None = None
    org_name: str | None = None
    inn: str | None = None
    cases: list[Any] = Field(default_factory=list)



class CoordinatesOut(Schema):
    """Точка на карте (для JSON)."""
    lat: float
    lng: float


class ContactsSettingsOut(Schema):
    """Схема для возврата настроек контактов."""
    ogrn: str | None = None
    legal_address: str | None = None
    coordinates: CoordinatesOut | None = None
    sales_center_address: str | None = None
