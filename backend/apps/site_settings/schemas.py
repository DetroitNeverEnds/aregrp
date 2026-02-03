"""
Схемы для API настроек сайта.
"""
from ninja import Schema


class MainSettingsOut(Schema):
    """Схема для возврата основных настроек сайта."""
    phone: str
    display_phone: str
    email: str
    whatsapp_link: str | None = None
    telegram_link: str | None = None
    description: str | None = None
    info_name: str | None = None
    inn: str | None = None



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
