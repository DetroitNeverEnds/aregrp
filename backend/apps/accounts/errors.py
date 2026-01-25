"""
Коды ошибок для приложения accounts.
"""
from api.errors import create_problem_detail


class AccountsErrorCodes:
    """Коды ошибок для модуля accounts."""
    
    # Аутентификация
    INVALID_CREDENTIALS = "ACCOUNTS_INVALID_CREDENTIALS"
    EMAIL_EXISTS = "ACCOUNTS_EMAIL_EXISTS"
    PHONE_EXISTS = "ACCOUNTS_PHONE_EXISTS"
    PASSWORD_MISMATCH = "ACCOUNTS_PASSWORD_MISMATCH"
    PASSWORD_VALIDATION_FAILED = "ACCOUNTS_PASSWORD_VALIDATION_FAILED"
    INVALID_USER_TYPE = "ACCOUNTS_INVALID_USER_TYPE"
    MISSING_ORGANIZATION_NAME = "ACCOUNTS_MISSING_ORGANIZATION_NAME"
    MISSING_INN = "ACCOUNTS_MISSING_INN"
    UNAUTHORIZED = "ACCOUNTS_UNAUTHORIZED"
    TOKEN_EXPIRED = "ACCOUNTS_TOKEN_EXPIRED"
    INVALID_TOKEN = "ACCOUNTS_INVALID_TOKEN"
    NO_REFRESH_TOKEN = "ACCOUNTS_NO_REFRESH_TOKEN"
    
    # Профиль
    USER_NOT_FOUND = "ACCOUNTS_USER_NOT_FOUND"
    EMAIL_ALREADY_USED = "ACCOUNTS_EMAIL_ALREADY_USED"
    PHONE_ALREADY_USED = "ACCOUNTS_PHONE_ALREADY_USED"
    INVALID_CURRENT_PASSWORD = "ACCOUNTS_INVALID_CURRENT_PASSWORD"
    
    # Общие
    REGISTRATION_ERROR = "ACCOUNTS_REGISTRATION_ERROR"
    LOGIN_ERROR = "ACCOUNTS_LOGIN_ERROR"
    PASSWORD_RESET_ERROR = "ACCOUNTS_PASSWORD_RESET_ERROR"
    PASSWORD_RESET_TOKEN_INVALID = "ACCOUNTS_PASSWORD_RESET_TOKEN_INVALID"
    PASSWORD_RESET_TOKEN_EXPIRED = "ACCOUNTS_PASSWORD_RESET_TOKEN_EXPIRED"


def create_accounts_error(
    status: int,
    code: str,
    title: str,
    detail: str,
    instance: str = None
) -> dict:
    """
    Создает ошибку для модуля accounts.
    
    Args:
        status: HTTP статус код
        code: Код ошибки из AccountsErrorCodes
        title: Краткое описание ошибки
        detail: Детальное описание ошибки
        instance: URI ресурса (опционально)
    
    Returns:
        dict: Объект ошибки в формате ProblemDetail
    """
    if instance is None:
        instance = "/api/v1/auth"
    
    return create_problem_detail(
        status=status,
        code=code,
        title=title,
        detail=detail,
        instance=instance
    )
