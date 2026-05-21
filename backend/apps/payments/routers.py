from asgiref.sync import sync_to_async
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from ninja import Router

from api.schemas import ProblemDetail
from apps.accounts.services.auth_service import jwt_auth

from .schemas import PaymentCreateIn, PaymentCreateOut
from .services import create_payment, handle_yookassa_webhook

payments_router = Router(tags=['Payments'])


@payments_router.post(
    '/',
    response={201: PaymentCreateOut, 400: ProblemDetail, 401: ProblemDetail, 404: ProblemDetail, 409: ProblemDetail, 502: ProblemDetail},
    auth=jwt_auth,
    summary='Создать платеж за бронирование',
    description='Создает платеж YooKassa для бронирования помещения по premise_uuid.',
)
async def create_payment_endpoint(request, data: PaymentCreateIn):
    out, err = await sync_to_async(create_payment, thread_sensitive=True)(
        request.auth.id,
        data.premise_uuid,
        request.COOKIES.get(settings.REFERRAL_CODE_COOKIE_NAME),
    )
    if err:
        status, body = err
        return status, body
    return 201, out


@payments_router.post(
    '/webhook',
    summary='Webhook от YooKassa',
    description='Минимальная обработка событий платежей от YooKassa.',
)
def yookassa_webhook_endpoint(request):
    status, body = handle_yookassa_webhook(request.body)
    if body is None:
        return HttpResponse(status=status)
    return JsonResponse(body, status=status)
