from types import SimpleNamespace
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from apps.accounts.services.auth_service import generate_jwt_tokens


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
            data={'premise_id': 123},
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header,
        )

        self.assertEqual(response.status_code, 201)
        body = response.json()
        self.assertEqual(body['id'], '23d93cac-000f-5000-8000-126628f15141')
        self.assertEqual(body['premise_id'], 123)
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
            data={'premise_id': 123},
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header,
        )

        self.assertEqual(response.status_code, 502)
        body = response.json()
        self.assertEqual(body['code'], 'PAYMENTS_CREATION_ERROR')
