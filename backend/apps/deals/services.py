from functools import partial

from core.pagination import get_paginated_list

from .models import Deal
from .schemas import BuildingBriefOut, PremiseBriefOut, ProfilePremiseRowOut


def _premise_display_name(premise) -> str:
    if premise.number:
        return premise.number
    if premise.building and premise.building.name:
        return premise.building.name
    return ''


def _deal_to_row(deal: Deal, *, include_commission: bool) -> ProfilePremiseRowOut:
    p = deal.premise
    b = p.building
    row = ProfilePremiseRowOut(
        premise=PremiseBriefOut(uuid=str(p.uuid), name=_premise_display_name(p)),
        building=BuildingBriefOut(uuid=str(b.uuid), name=b.name or ''),
        commission=(deal.commission_amount if include_commission else None),
        rent_expires_at=deal.rent_expires_at if deal.deal_type == Deal.DealType.RENT else None,
        contract_type=(
            Deal.ContractType(deal.contract_type).label
            if deal.deal_type == Deal.DealType.SALE and deal.contract_type
            else None
        ),
        contract_signed_on=deal.contract_signed_on if deal.deal_type == Deal.DealType.SALE else None,
    )
    return row


async def list_deals_for_profile_page(
    user,
    deal_type: str,
    *,
    page: int,
    page_size: int,
) -> dict:
    include_commission = user.user_type == 'agent'
    qs = (
        Deal.objects.filter(user=user, deal_type=deal_type)
        .select_related('premise', 'premise__building')
        .order_by('-created_at')
    )
    to_out = partial(_deal_to_row, include_commission=include_commission)
    return await get_paginated_list(qs, page=page, page_size=page_size, to_out=to_out)
