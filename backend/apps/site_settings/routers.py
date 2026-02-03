"""
Роутер для настроек сайта.
"""
from ninja import Router
from asgiref.sync import sync_to_async

from api.schemas import ProblemDetail
from .models import MainSettings, ContactsSettings
from .schemas import (
    MainSettingsOut,
    ContactsSettingsOut,
    CoordinatesOut,
)
from .errors import create_site_settings_error, SiteSettingsErrorCodes


site_settings_router = Router()


@site_settings_router.get(
    "/main-info",
    response={200: MainSettingsOut, 404: ProblemDetail},
    summary="Получить основные настройки сайта",
    description="Возвращает основные настройки: контакты (phone, display_phone, email, whatsapp_link, telegram_link), описание, название организации (info_name), ИНН."
)
async def get_main_settings(request):
    """
    Получить основные настройки сайта (MainSettings).

    Возвращает:
    - Контактная информация: phone, display_phone, email, whatsapp_link, telegram_link
    - Описание и название организации: description, info_name
    - ИНН: inn

    Эндпоинт публичный, аутентификация не требуется.
    При отсутствии настроек в БД возвращает 404.
    """
    try:
        settings = await sync_to_async(MainSettings.load)()
        
        return 200, MainSettingsOut(
            phone=settings.phone,
            display_phone=settings.display_phone or settings.phone,
            email=settings.email,
            whatsapp_link=settings.whatsapp_link or None,
            telegram_link=settings.telegram_link or None,
            description=settings.description or None,
            info_name=settings.org_name or None,
            inn=settings.inn or None
        )
        
    except Exception as e:
        return 404, create_site_settings_error(
            status=404,
            code=SiteSettingsErrorCodes.NOT_FOUND,
            title="Main settings not found",
            detail=f"Main settings not found. Please create main settings in admin panel. Error: {str(e)}",
            instance="/api/v1/site-settings/main-info"
        )


@site_settings_router.get(
    "/contacts",
    response={200: ContactsSettingsOut, 404: ProblemDetail},
    summary="Получить настройки контактов",
    description="Возвращает контакты из MainSettings и реквизиты/офис из ContactsSettings: ОГРН, юридический адрес, координаты (lat/lng), адрес офиса продаж."
)
async def get_contacts_settings(request):
    """
    Получить настройки контактов (объединённые MainSettings + ContactsSettings).

    Из MainSettings: phone, display_phone, email, whatsapp_link, telegram_link.
    Из ContactsSettings: ogrn, legal_address, coordinates (объект {lat, lng}), sales_center_address.

    Эндпоинт публичный, аутентификация не требуется.
    При отсутствии любой из настроек в БД возвращает 404.
    """
    try:
        main_settings = await sync_to_async(MainSettings.load)()
        contacts_settings = await sync_to_async(ContactsSettings.load)()

        return 200, ContactsSettingsOut(
            phone=main_settings.phone,
            display_phone=main_settings.display_phone or main_settings.phone,
            email=main_settings.email,
            whatsapp_link=main_settings.whatsapp_link or None,
            telegram_link=main_settings.telegram_link or None,
            ogrn=contacts_settings.ogrn or None,
            legal_address=contacts_settings.legal_address or None,
            coordinates=(
                CoordinatesOut(lat=contacts_settings.latitude, lng=contacts_settings.longitude)
                if contacts_settings.latitude is not None and contacts_settings.longitude is not None
                else None
            ),
            sales_center_address=contacts_settings.sales_center_address or None
        )
        
    except Exception as e:
        return 404, create_site_settings_error(
            status=404,
            code=SiteSettingsErrorCodes.NOT_FOUND,
            title="Settings not found",
            detail=f"Settings not found. Please create main settings and contacts settings in admin panel. Error: {str(e)}",
            instance="/api/v1/site-settings/contacts"
        )
