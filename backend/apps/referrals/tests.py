from decimal import Decimal
import uuid

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from apps.accounts.services.auth_service import generate_jwt_tokens
from apps.re_objects.models import Building, City, Premise, Region
from apps.referrals.models import ReferralLink


@override_settings(FRONTEND_REFERRAL_BASE_URL='http://localhost:5173')
class ReferralLinkEndpointTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='ref-agent',
            email='ref-agent@example.com',
            password='secret',
        )
        access_token, _ = generate_jwt_tokens(self.user)
        self.auth_header = f'Bearer {access_token}'
        self.url = '/api/v1/referrals/links'

        region = Region.objects.create(name='Реферальный регион', code='88')
        city = City.objects.create(name='Казань', region=region, is_default=True)
        building = Building.objects.create(name='Реферальный БЦ', address='ул. Ссылка, 1', city=city)
        self.premise = Premise.objects.create(
            city=city,
            building=building,
            area=Decimal('33.00'),
            price_per_sqm=150000,
            available_for_sale=True,
            available_for_rent=False,
            premise_type=Premise.PremiseType.OFFICE,
            room_number='42',
            title='Офис для рефералки',
        )

    def test_create_referral_link_success(self):
        response = self.client.post(
            self.url,
            data={'premise_uuid': str(self.premise.uuid), 'phone': '+7 900 000-00-00'},
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header,
        )

        self.assertEqual(response.status_code, 201)
        body = response.json()
        self.assertEqual(body['premise_uuid'], str(self.premise.uuid))
        self.assertIn('?ref=', body['url'])

        link = ReferralLink.objects.get(code=body['code'])
        self.assertEqual(link.referrer_id, self.user.id)
        self.assertEqual(link.premise_id, self.premise.id)
        self.assertEqual(link.contact_phone, '+7 900 000-00-00')

    def test_create_referral_link_premise_not_found(self):
        response = self.client.post(
            self.url,
            data={'premise_uuid': str(uuid.uuid4()), 'phone': '+7 900 000-00-00'},
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header,
        )

        self.assertEqual(response.status_code, 404)
        body = response.json()
        self.assertEqual(body['code'], 'RE_OBJECTS_NOT_FOUND')

