from api.errors import create_problem_detail
from api.schemas import ErrorCode


class BookingsErrorCodes:
    PREMISE_UNAVAILABLE = ErrorCode.BOOKINGS_PREMISE_UNAVAILABLE
    ACTIVE_BOOKING_EXISTS = ErrorCode.BOOKINGS_ACTIVE_BOOKING_EXISTS
    INVALID_DEAL_TYPE = ErrorCode.BOOKINGS_INVALID_DEAL_TYPE


def create_bookings_error(
    *,
    status: int,
    code: ErrorCode,
    title: str,
    detail: str,
    instance: str | None = None,
) -> dict:
    if instance is None:
        instance = "/api/v1/bookings"
    return create_problem_detail(
        status=status,
        code=code,
        title=title,
        detail=detail,
        instance=instance,
    )
