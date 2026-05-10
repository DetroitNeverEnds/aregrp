from api.errors import create_problem_detail
from api.schemas import ErrorCode


class PaymentsErrorCodes:
    CREATION_ERROR = ErrorCode.PAYMENTS_CREATION_ERROR


def create_payments_error(
    *,
    status: int,
    code: ErrorCode,
    title: str,
    detail: str,
    instance: str | None = None,
) -> dict:
    if instance is None:
        instance = '/api/v1/payments'
    return create_problem_detail(
        status=status,
        code=code,
        title=title,
        detail=detail,
        instance=instance,
    )
