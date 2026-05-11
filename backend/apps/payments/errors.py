from api.errors import create_problem_detail
from api.schemas import ErrorCode


class PaymentsErrorCodes:
    CREATION_ERROR = ErrorCode.PAYMENTS_CREATION_ERROR
    PREMISE_NOT_FOUND = ErrorCode.PAYMENTS_PREMISE_NOT_FOUND
    PREMISE_UNAVAILABLE = ErrorCode.PAYMENTS_PREMISE_UNAVAILABLE
    ACTIVE_BOOKING_EXISTS = ErrorCode.PAYMENTS_ACTIVE_BOOKING_EXISTS


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
