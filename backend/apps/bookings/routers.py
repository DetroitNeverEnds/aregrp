from asgiref.sync import sync_to_async
from ninja import Router

from api.schemas import ProblemDetail
from apps.accounts.services.auth_service import jwt_auth

from .schemas import BookingCreateIn, BookingOut
from .services import create_booking, list_bookings_for_user


bookings_router = Router(tags=["Bookings"])


@bookings_router.post(
    "/",
    response={201: BookingOut, 400: ProblemDetail, 401: ProblemDetail, 404: ProblemDetail, 409: ProblemDetail},
    auth=jwt_auth,
    summary="Создать бронь",
    description="Бронь помещения: AVAILABLE, соответствие deal_type флагам аренды/продажи, не более одной активной брони на помещение. Срок — 3 суток.",
)
async def post_booking(request, data: BookingCreateIn):
    out, err = await sync_to_async(create_booking, thread_sensitive=True)(
        request.auth,
        data.premise_uuid,
        data.deal_type,
    )
    if err:
        status, body = err
        return status, body
    return 201, out
