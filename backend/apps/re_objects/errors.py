"""
Коды и фабрики ошибок для приложения re_objects (формат RFC 7807 ProblemDetail).

Используется в роутерах при 404 и других ошибках; ответ клиенту — единый формат с type, status, title, detail, instance, code.
"""
from api.errors import create_problem_detail
from api.schemas import ErrorCode


class ReObjectsErrorCodes:
    """Коды ошибок API помещений (re_objects)."""

    NOT_FOUND = ErrorCode.RE_OBJECTS_NOT_FOUND


def create_re_objects_error(
    *,
    status: int,
    code: ErrorCode,
    title: str,
    detail: str,
    instance: str | None = None,
) -> dict:
    """
    Создаёт объект ошибки в формате ProblemDetail для ответа API.

    instance по умолчанию /api/v1/premises. Возвращает dict для Ninja (response 404 и т.д.).
    """
    if instance is None:
        instance = "/api/v1/premises"
    return create_problem_detail(
        status=status,
        code=code,
        title=title,
        detail=detail,
        instance=instance,
    )
