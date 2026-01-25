"""
Коды ошибок для приложения feedback.

Пример структуры для других приложений.
"""
from api.errors import create_problem_detail


class FeedbackErrorCodes:
    """Коды ошибок для модуля feedback."""
    
    # Общие ошибки
    FEEDBACK_NOT_FOUND = "FEEDBACK_NOT_FOUND"
    FEEDBACK_CREATION_ERROR = "FEEDBACK_CREATION_ERROR"
    FEEDBACK_UPDATE_ERROR = "FEEDBACK_UPDATE_ERROR"
    FEEDBACK_DELETE_ERROR = "FEEDBACK_DELETE_ERROR"
    VALIDATION_ERROR = "FEEDBACK_VALIDATION_ERROR"


def create_feedback_error(
    status: int,
    code: str,
    title: str,
    detail: str,
    instance: str = None
) -> dict:
    """
    Создает ошибку для модуля feedback.
    
    Args:
        status: HTTP статус код
        code: Код ошибки из FeedbackErrorCodes
        title: Краткое описание ошибки
        detail: Детальное описание ошибки
        instance: URI ресурса (опционально)
    
    Returns:
        dict: Объект ошибки в формате ProblemDetail
    """
    if instance is None:
        instance = "/api/v1/feedback"
    
    return create_problem_detail(
        status=status,
        code=code,
        title=title,
        detail=detail,
        instance=instance
    )
