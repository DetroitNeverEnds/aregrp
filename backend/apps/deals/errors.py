from api.errors import create_problem_detail
from api.schemas import ErrorCode


class DealsErrorCodes:
    INVALID_DEAL_TYPE = ErrorCode.DEALS_INVALID_DEAL_TYPE


def create_deals_error(
    status: int,
    code: ErrorCode,
    title: str,
    detail: str,
    instance: str | None = None,
) -> dict:
    if instance is None:
        instance = '/api/v1/profile/premises'
    return create_problem_detail(
        status=status,
        code=code,
        title=title,
        detail=detail,
        instance=instance,
    )
