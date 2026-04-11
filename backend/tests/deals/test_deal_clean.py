import pytest
from asgiref.sync import sync_to_async
from django.core.exceptions import ValidationError
from django.utils import timezone

from apps.deals.models import Deal


@pytest.mark.django_db
class TestDealValidation:
    async def test_rent_requires_rent_expires_at(self, test_user, building_with_premise):
        _, premise = building_with_premise
        d = Deal(
            user_id=test_user.id,
            premise=premise,
            deal_type=Deal.DealType.RENT,
            commission_amount=1,
        )
        with pytest.raises(ValidationError) as exc:
            await sync_to_async(d.save)()
        assert 'rent_expires_at' in exc.value.error_dict

    async def test_sale_requires_contract_type(self, test_user, building_with_premise):
        _, premise = building_with_premise
        d = Deal(
            user_id=test_user.id,
            premise=premise,
            deal_type=Deal.DealType.SALE,
            commission_amount=1,
            contract_signed_on=timezone.now().date(),
        )
        with pytest.raises(ValidationError) as exc:
            await sync_to_async(d.save)()
        assert 'contract_type' in exc.value.error_dict

    async def test_commission_required(self, test_user, building_with_premise):
        _, premise = building_with_premise
        d = Deal(
            user_id=test_user.id,
            premise=premise,
            deal_type=Deal.DealType.RENT,
            rent_expires_at=timezone.now().date(),
        )
        with pytest.raises(ValidationError) as exc:
            await sync_to_async(d.save)()
        assert 'commission_amount' in exc.value.error_dict
