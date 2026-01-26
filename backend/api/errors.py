"""
Общие утилиты для генерации ошибок в формате RFC 7807.

Каждое приложение должно иметь свой модуль errors.py с кодами ошибок.
"""
from typing import Optional


# Базовый URL для типов ошибок
ERROR_TYPE_BASE = "https://api.example.com/problems"


def create_problem_detail(
    status: int,
    code: str,
    title: str,
    detail: str,
    instance: Optional[str] = None,
    error_type: Optional[str] = None
) -> dict:
    """
    Создает объект ошибки в формате RFC 7807.
    
    Используется всеми приложениями для генерации стандартизированных ошибок.
    Каждое приложение должно иметь свой модуль errors.py с кодами ошибок.
    
    Args:
        status: HTTP статус код
        code: Внутренний код ошибки (используется фронтендом)
        title: Краткое описание ошибки
        detail: Детальное описание ошибки
        instance: URI ресурса, на котором произошла ошибка
        error_type: Тип ошибки (URI). Если не указан, генерируется автоматически
    
    Returns:
        dict: Объект ошибки в формате ProblemDetail
    
    Example:
        >>> error = create_problem_detail(
        ...     status=400,
        ...     code="ACCOUNTS_EMAIL_EXISTS",
        ...     title="Email already exists",
        ...     detail="User with this email already exists",
        ...     instance="/api/v1/auth/register"
        ... )
    """
    if error_type is None:
        error_type = f"{ERROR_TYPE_BASE}/{code.lower().replace('_', '-')}"
    
    return {
        "type": error_type,
        "status": status,
        "title": title,
        "detail": detail,
        "instance": instance,
        "code": code
    }
