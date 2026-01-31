"""
Коды ошибок для приложения accounts.
"""
from api.errors import create_problem_detail
from api.schemas import ErrorCode


class AccountsErrorCodes:
    """Коды ошибок для модуля accounts."""
    
    # Аутентификация
    INVALID_CREDENTIALS = ErrorCode.ACCOUNTS_INVALID_CREDENTIALS
    EMAIL_EXISTS = ErrorCode.ACCOUNTS_EMAIL_EXISTS
    PHONE_EXISTS = ErrorCode.ACCOUNTS_PHONE_EXISTS
    PASSWORD_MISMATCH = ErrorCode.ACCOUNTS_PASSWORD_MISMATCH
    PASSWORD_VALIDATION_FAILED = ErrorCode.ACCOUNTS_PASSWORD_VALIDATION_FAILED
    INVALID_USER_TYPE = ErrorCode.ACCOUNTS_INVALID_USER_TYPE
    MISSING_ORGANIZATION_NAME = ErrorCode.ACCOUNTS_MISSING_ORGANIZATION_NAME
    MISSING_INN = ErrorCode.ACCOUNTS_MISSING_INN
    UNAUTHORIZED = ErrorCode.ACCOUNTS_UNAUTHORIZED
    TOKEN_EXPIRED = ErrorCode.ACCOUNTS_TOKEN_EXPIRED
    INVALID_TOKEN = ErrorCode.ACCOUNTS_INVALID_TOKEN
    NO_REFRESH_TOKEN = ErrorCode.ACCOUNTS_NO_REFRESH_TOKEN
    
    # Профиль
    USER_NOT_FOUND = ErrorCode.ACCOUNTS_USER_NOT_FOUND
    EMAIL_ALREADY_USED = ErrorCode.ACCOUNTS_EMAIL_ALREADY_USED
    PHONE_ALREADY_USED = ErrorCode.ACCOUNTS_PHONE_ALREADY_USED
    INVALID_CURRENT_PASSWORD = ErrorCode.ACCOUNTS_INVALID_CURRENT_PASSWORD
    
    # Общие
    REGISTRATION_ERROR = ErrorCode.ACCOUNTS_REGISTRATION_ERROR
    LOGIN_ERROR = ErrorCode.ACCOUNTS_LOGIN_ERROR
    PASSWORD_RESET_ERROR = ErrorCode.ACCOUNTS_PASSWORD_RESET_ERROR
    PASSWORD_RESET_TOKEN_INVALID = ErrorCode.ACCOUNTS_PASSWORD_RESET_TOKEN_INVALID
    PASSWORD_RESET_TOKEN_EXPIRED = ErrorCode.ACCOUNTS_PASSWORD_RESET_TOKEN_EXPIRED


def create_accounts_error(
    status: int,
    code: ErrorCode,
    title: str,
    detail: str,
    instance: str = None
) -> dict:
    """
    Создает ошибку для модуля accounts.
    
    Args:
        status: HTTP статус код
        code: Код ошибки из AccountsErrorCodes (ErrorCode enum)
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
