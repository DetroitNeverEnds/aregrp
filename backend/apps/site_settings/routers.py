"""
Роутер для настроек сайта.
"""
from ninja import Router
from asgiref.sync import sync_to_async

from api.schemas import ProblemDetail
from .models import MainSettings, ContactsSettings
from .schemas import (
    MainSettingsOut,
    ContactsSettingsOut
)
from .errors import create_site_settings_error, SiteSettingsErrorCodes


site_settings_router = Router()


@site_settings_router.get(
    "/main-info",
    response={200: MainSettingsOut, 404: ProblemDetail},
    summary="Получить основные настройки сайта",
    description="Возвращает основные настройки сайта (контакты и информация для footer)"
)
async def get_main_settings(request): 
    """
    Получить основные настройки сайта.
    
    Возвращает основные настройки сайта, включая контактную информацию
    (телефон, email, WhatsApp, Telegram) и информацию для footer.
    Эндпоинт публичный, не требует аутентификации.
    """
    try:
        settings = await sync_to_async(MainSettings.load)()
        
        return 200, MainSettingsOut(
            phone=settings.phone,
            display_phone=settings.display_phone or settings.phone,
            email=settings.email,
            whatsapp_link=settings.whatsapp_link or None,
            telegram_link=settings.telegram_link or None,
            footer_description=settings.footer_description or None,
            footer_org_info=settings.footer_org_info or None,
            footer_inn=settings.footer_inn or None
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
    description="Возвращает контактную информацию и реквизиты организации"
)
async def get_contacts_settings(request): 
    """
    Получить настройки контактов.
    
    Возвращает контактную информацию и реквизиты организации,
    включая телефон, email, мессенджеры, ФИО руководителя и ИНН.
    Эндпоинт публичный, не требует аутентификации.
    """
    try:
        contact_settings = await sync_to_async(ContactsSettings.load)()
        main_settings = await sync_to_async(MainSettings.load)()

        return 200, ContactsSettingsOut(
            phone=contact_settings.phone,
            email=contact_settings.email,
            whats_app=contact_settings.whats_app or None,
            telegram=contact_settings.telegram or None,
            ruk_fio=contact_settings.ruk_fio,
            inn=contact_settings.inn
        )
        
    except Exception as e:
        return 404, create_site_settings_error(
            status=404,
            code=SiteSettingsErrorCodes.NOT_FOUND,
            title="Contacts settings not found",
            detail=f"Contacts settings not found. Please create contacts settings in admin panel. Error: {str(e)}",
            instance="/api/v1/site-settings/contacts"
        )


