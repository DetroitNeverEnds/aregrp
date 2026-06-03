from typing import Optional
from uuid import UUID

from django.conf import settings

from apps.re_objects.errors import ReObjectsErrorCodes, create_re_objects_error
from apps.re_objects.models import Premise

from .models import ReferralLink
from .schemas import ReferralLinkOut


def _build_referral_url(premise: Premise, referral_link: ReferralLink) -> str:
    frontend_referral_base_url = settings.FRONTEND_REFERRAL_BASE_URL.rstrip('/')
    return (
        f'{frontend_referral_base_url}/building/{premise.building.uuid}'
        f'?ref={referral_link.code}&selectedPremise={premise.uuid}'
    )


def create_referral_link(
    referrer,
    premise_uuid: UUID,
    phone: str,
) -> tuple[Optional[ReferralLinkOut], Optional[tuple[int, dict]]]:
    try:
        premise = Premise.objects.select_related('building').get(uuid=premise_uuid)
    except Premise.DoesNotExist:
        return None, (
            404,
            create_re_objects_error(
                status=404,
                code=ReObjectsErrorCodes.NOT_FOUND,
                title='Premise not found',
                detail='No premise with the given UUID',
                instance='/api/v1/referrals/links',
            ),
        )

    referral_link = ReferralLink.objects.create(
        referrer=referrer,
        premise=premise,
        contact_phone=phone.strip(),
    )
    return ReferralLinkOut(
        code=str(referral_link.code),
        url=_build_referral_url(premise, referral_link),
        premise_uuid=str(premise.uuid),
        created_at=referral_link.created_at,
    ), None

