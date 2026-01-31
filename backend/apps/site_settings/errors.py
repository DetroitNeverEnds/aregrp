"""
Коды ошибок для приложения site_settings.
"""
from api.errors import create_problem_detail
from api.schemas import ErrorCode


class SiteSettingsErrorCodes:
    """Коды ошибок для модуля site_settings."""
    
    NOT_FOUND = ErrorCode.SITE_SETTINGS_NOT_FOUND
    ERROR = ErrorCode.SITE_SETTINGS_ERROR


def create_site_settings_error(
    status: int,
    code: ErrorCode,
    title: str,
    detail: str,
    instance: str = None
) -> dict:
    """
    Создает ошибку для модуля site_settings.
    
    Args:
        status: HTTP статус код
        code: Код ошибки из SiteSettingsErrorCodes (ErrorCode enum)
        title: Краткое описание ошибки
        detail: Детальное описание ошибки
        instance: URI ресурса (опционально)
    
    Returns:
        dict: Объект ошибки в формате ProblemDetail
    """
    if instance is None:
        instance = "/api/v1/site-settings"
    
    return create_problem_detail(
        status=status,
        code=code,
        title=title,
        detail=detail,
        instance=instance
    )
