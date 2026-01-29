"""
Схемы для API настроек сайта.
"""
from ninja import Schema


class SiteSettingsOut(Schema):
    """Схема для возврата настроек сайта."""
    phone: str
    email: str
    whats_app: str | None = None
    telegram: str | None = None
    ruk_fio: str
    inn: str
