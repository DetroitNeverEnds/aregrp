"""
Схемы для API настроек сайта.
"""
from ninja import Schema


class MainSettingsOut(Schema):
    """Схема для возврата основных настроек сайта."""
    phone: str
    email: str
    whatsapp_link: str | None = None
    telegram_link: str | None = None
    footer_description: str | None = None
    footer_org_info: str | None = None


class ContactsSettingsOut(Schema):
    """Схема для возврата настроек контактов."""
    phone: str
    email: str
    whats_app: str | None = None
    telegram: str | None = None
    ruk_fio: str
    inn: str
