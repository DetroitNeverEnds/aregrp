from asgiref.sync import sync_to_async
from ninja import Router

from api.schemas import ProblemDetail
from apps.accounts.services.auth_service import jwt_auth

from .schemas import PaymentCreateIn, PaymentCreateOut
from .services import create_payment

payments_router = Router(tags=['Payments'])


@payments_router.post(
    '/',
    response={201: PaymentCreateOut, 400: ProblemDetail, 401: ProblemDetail, 404: ProblemDetail, 409: ProblemDetail, 502: ProblemDetail},
    auth=jwt_auth,
    summary='Создать платеж за бронирование',
    description='Создает платеж YooKassa для бронирования помещения по premise_id.',
)
async def create_payment_endpoint(request, data: PaymentCreateIn):
    out, err = await sync_to_async(create_payment, thread_sensitive=True)(data.premise_id)
    if err:
        status, body = err
        return status, body
    return 201, out
