from asgiref.sync import sync_to_async
from ninja import Router

from api.schemas import ProblemDetail
from apps.accounts.services.auth_service import jwt_auth

from .schemas import ReferralLinkCreateIn, ReferralLinkOut
from .services import create_referral_link

referrals_router = Router(tags=['Referrals'])


@referrals_router.post(
    '/links',
    response={201: ReferralLinkOut, 401: ProblemDetail, 404: ProblemDetail},
    auth=jwt_auth,
    summary='Сгенерировать реферальную ссылку',
    description='Создает уникальную ссылку для помещения и возвращает URL с query-параметром ref.',
)
async def create_referral_link_endpoint(request, data: ReferralLinkCreateIn):
    out, err = await sync_to_async(create_referral_link, thread_sensitive=True)(
        request.auth,
        data.premise_uuid,
        data.phone,
    )
    if err:
        status, body = err
        return status, body
    return 201, out

