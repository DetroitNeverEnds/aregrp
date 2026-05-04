"""
Роутер для настроек сайта.
"""
from asgiref.sync import sync_to_async
from ninja import Router

from api.schemas import ProblemDetail

from .errors import SiteSettingsErrorCodes, create_site_settings_error
from .models import ContactsSettings, InvestorSettings, MainSettings
from .schemas import ContactsSettingsOut, CoordinatesOut, InvestorSettingsOut, MainSettingsOut

site_settings_router = Router()


def _file_field_url(field_file) -> str | None:
    """URL медиафайла так, как его отдаёт storage (как у медиа в API объектов)."""
    if not field_file or not getattr(field_file, "name", None):
        return None
    return field_file.url


def _canonical_public_pdf_path(field_file, path: str) -> str | None:
    """Короткий путь на сайте (nginx отдаёт файл), без раскрытия MEDIA."""
    if not field_file or not getattr(field_file, "name", None):
        return None
    return path


@site_settings_router.get(
    "/main-info",
    response={200: MainSettingsOut, 404: ProblemDetail},
    summary="Получить основные настройки сайта",
    description=(
        "Возвращает основные настройки: контакты (phone, display_phone, email, max_link, "
        "telegram_link), описание, название организации (org_name), ИНН, кейсы "
        "(cases — URL PDF из storage или null), privacy_pdf и oplata_pdf — "
        "\"/privacy.pdf\" и \"/oplata.pdf\" если файлы загружены иначе null (короткие пути для nginx)."
    ),
)
async def get_main_settings(request):
    """
    Получить основные настройки сайта (MainSettings).

    Возвращает:
    - Контактная информация: phone, display_phone, email, max_link, telegram_link
    - Описание и название организации: description, org_name
    - ИНН: inn
    - Кейсы: cases — ссылка на PDF из DEFAULT_FILE_STORAGE (часто относительная /media/… или полный URL в S3)
    - Документы: privacy_pdf, oplata_pdf — короткие пути «/privacy.pdf», «/oplata.pdf», если файл загружен

    Эндпоинт публичный, аутентификация не требуется.
    При отсутствии настроек в БД возвращает 404.
    """
    try:
        settings = await sync_to_async(MainSettings.load)()

        def build_out():
            return MainSettingsOut(
                phone=settings.phone,
                display_phone=settings.display_phone or settings.phone,
                email=settings.email,
                max_link=settings.max_link or None,
                telegram_link=settings.telegram_link or None,
                description=settings.description or None,
                org_name=settings.org_name or None,
                inn=settings.inn or None,
                cases=_file_field_url(settings.cases_pdf),
                privacy_pdf=_canonical_public_pdf_path(settings.privacy_pdf, "/privacy.pdf"),
                oplata_pdf=_canonical_public_pdf_path(settings.oplata_pdf, "/oplata.pdf"),
            )

        return 200, await sync_to_async(build_out)()
        
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
    description=(
        "Возвращает реквизиты и офис из ContactsSettings: ОГРН, юридический адрес, "
        "координаты (lat/lng), адрес офиса продаж."
    ),
)
async def get_contacts_settings(request):
    """
    Получить настройки контактов (ContactsSettings).

    Возвращает: ogrn, legal_address, coordinates (объект {lat, lng}), sales_center_address.
    Контактные данные (телефон, email, мессенджеры) — в эндпоинте /main-info.

    Эндпоинт публичный, аутентификация не требуется.
    При отсутствии настроек в БД возвращает 404.
    """
    try:
        contacts_settings = await sync_to_async(ContactsSettings.load)()

        return 200, ContactsSettingsOut(
            ogrn=contacts_settings.ogrn or None,
            legal_address=contacts_settings.legal_address or None,
            coordinates=(
                CoordinatesOut(lat=contacts_settings.latitude, lng=contacts_settings.longitude)
                if contacts_settings.latitude is not None and contacts_settings.longitude is not None
                else None
            ),
            sales_center_address=contacts_settings.sales_center_address or None,
        )
    except Exception as e:
        return 404, create_site_settings_error(
            status=404,
            code=SiteSettingsErrorCodes.NOT_FOUND,
            title="Settings not found",
            detail=f"Contacts settings not found. Create contacts settings in admin panel. Error: {str(e)}",
            instance="/api/v1/site-settings/contacts",
        )


@site_settings_router.get(
    "/investors",
    response={200: InvestorSettingsOut, 404: ProblemDetail},
    summary="Документы для инвесторов (PDF)",
    description=(
        "Возвращает до трёх ссылок на PDF, загруженных в админке "
        "(Настройки для инвесторов): document_1, document_2, document_3."
    ),
)
async def get_investor_settings(request):
    """
    Публичный эндпоинт: URL файлов из DEFAULT_FILE_STORAGE (как у cases в /main-info).
    """
    try:
        settings = await sync_to_async(InvestorSettings.load)()

        def build_out():
            return InvestorSettingsOut(
                document_1=_file_field_url(settings.document_1),
                document_2=_file_field_url(settings.document_2),
                document_3=_file_field_url(settings.document_3),
            )

        return 200, await sync_to_async(build_out)()
    except Exception as e:
        return 404, create_site_settings_error(
            status=404,
            code=SiteSettingsErrorCodes.NOT_FOUND,
            title="Investor settings not found",
            detail=(
                f"Investor settings not found. Create them in admin panel. Error: {str(e)}"
            ),
            instance="/api/v1/site-settings/investors",
        )
