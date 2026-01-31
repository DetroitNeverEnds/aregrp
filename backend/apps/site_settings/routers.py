"""
Роутер для настроек сайта.
"""
from ninja import Router
from asgiref.sync import sync_to_async

from api.schemas import ProblemDetail
from .models import SiteSettings
from .schemas import SiteSettingsOut
from .errors import create_site_settings_error, SiteSettingsErrorCodes


site_settings_router = Router()


@site_settings_router.get(
    "/",
    response={200: SiteSettingsOut, 404: ProblemDetail},
    summary="Получить настройки сайта",
    description="Возвращает публичные настройки сайта (контакты, реквизиты)"
)
async def get_site_settings(request):  # pylint: disable=unused-argument
    """
    Получить настройки сайта
    
    Возвращает публичные настройки сайта, включая контактную информацию
    и реквизиты организации. Эндпоинт публичный, не требует аутентификации.
    
    **Пример ответа:**
    ```json
    {
        "phone": "+79991234567",
        "email": "info@example.com",
        "whats_app": "https://wa.me/79991234567",
        "telegram": "@example",
        "ruk_fio": "Иванов Иван Иванович",
        "inn": "1234567890"
    }
    ```
    
    **Коды ошибок:**
    - `404`: Настройки сайта не найдены (должны быть созданы в админке)
    """
    try:
        # Получаем единственный экземпляр настроек (Singleton)
        settings = await sync_to_async(SiteSettings.load)()
        
        # Преобразуем модель в схему
        return 200, SiteSettingsOut(
            phone=settings.phone,
            email=settings.email,
            whats_app=settings.whats_app or None,
            telegram=settings.telegram or None,
            ruk_fio=settings.ruk_fio,
            inn=settings.inn
        )
        
    except Exception as e:
        return 404, create_site_settings_error(
            status=404,
            code=SiteSettingsErrorCodes.NOT_FOUND,
            title="Site settings not found",
            detail=f"Site settings not found. Please create site settings in admin panel. Error: {str(e)}",
            instance="/api/v1/site-settings/"
        )
