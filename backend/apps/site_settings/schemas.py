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



class ContactsSettingsOut(Schema):
    """Схема для возврата настроек контактов."""
    phone: str
    display_phone: str
    email: str
    whatsapp_link: str | None = None
    telegram_link: str | None = None
    ogrn: str | None = None
    legal_address: str | None = None
