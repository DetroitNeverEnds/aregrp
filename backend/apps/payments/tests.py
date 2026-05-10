from types import SimpleNamespace
from unittest.mock import patch
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone

from apps.accounts.services.auth_service import generate_jwt_tokens
from apps.bookings.models import Booking
from apps.re_objects.models import Building, City, Premise, Region


@override_settings(
    PAYMENTS_REDIRECT_URL='https://www.example.com/return_url',
    PAYMENTS_BOOKING_AMOUNT=10000,
)
class PaymentsCreateEndpointTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='testuser',
            email='test@example.com',
            password='secret',
        )
        access_token, _ = generate_jwt_tokens(self.user)
        self.auth_header = f'Bearer {access_token}'
        self.url = '/api/v1/payments/'
        self.premise = self._create_sale_premise()

    def _create_sale_premise(self) -> Premise:
        region = Region.objects.create(name='Тестовый регион', code='16')
        city = City.objects.create(name='Казань', region=region, is_default=True)
        building = Building.objects.create(name='БЦ Тест', address='ул. Тестовая, 1', city=city)
        return Premise.objects.create(
            city=city,
            building=building,
            area=Decimal('50.00'),
            price_per_sqm=100000,
            available_for_sale=True,
            available_for_rent=False,
            premise_type=Premise.PremiseType.OFFICE,
            room_number='101',
            title='Офис 101',
        )

    @patch('apps.payments.services.Payment.create')
    def test_create_payment_success(self, payment_create_mock):
        payment_create_mock.return_value = SimpleNamespace(
            id='23d93cac-000f-5000-8000-126628f15141',
            status='pending',
            paid=False,
            amount=SimpleNamespace(value='10000.00', currency='RUB'),
            description='Бронирование помещения 123',
            confirmation=SimpleNamespace(
                type='redirect',
                confirmation_url='https://yoomoney.ru/api-pages/v2/payment-confirm/example',
            ),
            created_at='2026-05-09T12:00:00+00:00',
        )

        response = self.client.post(
            self.url,
            data={'premise_id': self.premise.id},
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header,
        )

        self.assertEqual(response.status_code, 201)
        body = response.json()
        self.assertEqual(body['id'], '23d93cac-000f-5000-8000-126628f15141')
        self.assertEqual(body['premise_id'], self.premise.id)
        self.assertEqual(body['amount']['value'], '10000.00')
        self.assertEqual(
            body['confirmation']['confirmation_url'],
            'https://yoomoney.ru/api-pages/v2/payment-confirm/example',
        )

    @patch('apps.payments.services.Payment.create')
    def test_create_payment_yookassa_error(self, payment_create_mock):
        payment_create_mock.side_effect = Exception('gateway error')

        response = self.client.post(
            self.url,
            data={'premise_id': self.premise.id},
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header,
        )

        self.assertEqual(response.status_code, 502)
        body = response.json()
        self.assertEqual(body['code'], 'PAYMENTS_CREATION_ERROR')

    def test_create_payment_premise_not_found(self):
        response = self.client.post(
            self.url,
            data={'premise_id': 999999},
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header,
        )
        self.assertEqual(response.status_code, 404)
        body = response.json()
        self.assertEqual(body['code'], 'PAYMENTS_PREMISE_NOT_FOUND')

    def test_create_payment_premise_unavailable(self):
        self.premise.available_for_sale = False
        self.premise.save(update_fields=['available_for_sale'])

        response = self.client.post(
            self.url,
            data={'premise_id': self.premise.id},
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header,
        )
        self.assertEqual(response.status_code, 400)
        body = response.json()
        self.assertEqual(body['code'], 'PAYMENTS_PREMISE_UNAVAILABLE')

    def test_create_payment_active_booking_exists(self):
        Booking.objects.create(
            user=self.user,
            premise=self.premise,
            deal_type=Booking.DealType.SALE,
            expires_at=timezone.now() + timedelta(days=1),
        )
        response = self.client.post(
            self.url,
            data={'premise_id': self.premise.id},
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header,
        )
        self.assertEqual(response.status_code, 409)
        body = response.json()
        self.assertEqual(body['code'], 'PAYMENTS_ACTIVE_BOOKING_EXISTS')
