from types import SimpleNamespace
from unittest.mock import patch
from datetime import timedelta
from decimal import Decimal
import uuid

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone

from apps.accounts.services.auth_service import generate_jwt_tokens
from apps.bookings.models import Booking
from apps.payments.models import Payment
from apps.payments.services import handle_yookassa_webhook
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

    @patch('apps.payments.services.YooKassaPayment.create')
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
            data={'premise_uuid': str(self.premise.uuid)},
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
        self.assertEqual(Payment.objects.count(), 1)
        local_payment = Payment.objects.get(provider_payment_id='23d93cac-000f-5000-8000-126628f15141')
        self.assertEqual(local_payment.premise_id, self.premise.id)

        payload = payment_create_mock.call_args.args[0]
        self.assertIn('metadata', payload)
        self.assertEqual(
            payload['description'],
            f'Бронирование: {self.premise.building.address} — {self.premise.title}',
        )
        self.assertEqual(payload['metadata']['user_id'], str(self.user.id))
        self.assertEqual(payload['metadata']['premise_id'], str(self.premise.id))
        self.assertEqual(payload['metadata']['premise_uuid'], str(self.premise.uuid))
        self.assertIn('payment_token', payload['metadata'])
        self.assertIn('receipt', payload)
        self.assertEqual(payload['receipt']['customer']['email'], self.user.email)
        self.assertEqual(payload['receipt']['tax_system_code'], 2)
        item = payload['receipt']['items'][0]
        self.assertEqual(item['description'], 'Оплата за бронирование помещения')
        self.assertEqual(item['amount']['value'], '10000.00')
        self.assertEqual(item['vat_code'], 7)
        self.assertEqual(item['payment_subject'], 'service')
        self.assertEqual(item['payment_mode'], 'full_prepayment')

    @patch('apps.payments.services.YooKassaPayment.create')
    def test_create_payment_yookassa_error(self, payment_create_mock):
        payment_create_mock.side_effect = Exception('gateway error')

        response = self.client.post(
            self.url,
            data={'premise_uuid': str(self.premise.uuid)},
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header,
        )

        self.assertEqual(response.status_code, 502)
        body = response.json()
        self.assertEqual(body['code'], 'PAYMENTS_CREATION_ERROR')

    def test_create_payment_premise_not_found(self):
        response = self.client.post(
            self.url,
            data={'premise_uuid': str(uuid.uuid4())},
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
            data={'premise_uuid': str(self.premise.uuid)},
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
            data={'premise_uuid': str(self.premise.uuid)},
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header,
        )
        self.assertEqual(response.status_code, 409)
        body = response.json()
        self.assertEqual(body['code'], 'PAYMENTS_ACTIVE_BOOKING_EXISTS')

    def test_create_payment_active_unfinished_payment_exists(self):
        Payment.objects.create(
            premise=self.premise,
            provider_payment_id='active-payment-id',
            idempotence_key=uuid.uuid4(),
            status=Payment.Status.PENDING,
            paid=False,
            amount_value=Decimal('10000.00'),
            amount_currency='RUB',
            description='Pending payment',
            metadata={'user_id': str(self.user.id)},
        )

        response = self.client.post(
            self.url,
            data={'premise_uuid': str(self.premise.uuid)},
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header,
        )

        self.assertEqual(response.status_code, 409)
        body = response.json()
        self.assertEqual(body['code'], 'PAYMENTS_PREMISE_UNAVAILABLE')


class PaymentsWebhookHandlerServiceTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='webhook-user',
            email='webhook@example.com',
            password='secret',
        )
        region = Region.objects.create(name='Webhook регион', code='17')
        city = City.objects.create(name='Webhook city', region=region, is_default=True)
        building = Building.objects.create(name='Webhook building', address='Webhook addr, 1', city=city)
        self.premise = Premise.objects.create(
            city=city,
            building=building,
            area=Decimal('40.00'),
            price_per_sqm=90000,
            available_for_sale=True,
            available_for_rent=False,
            premise_type=Premise.PremiseType.OFFICE,
            room_number='201',
            title='Webhook Office',
        )

    @patch('apps.payments.services.WebhookNotification')
    def test_handle_webhook_payment_succeeded_returns_200(self, webhook_notification_mock):
        webhook_notification_mock.return_value = SimpleNamespace(
            event='payment.succeeded',
            object=SimpleNamespace(
                id='payment-id',
                status='succeeded',
                paid=True,
                amount=SimpleNamespace(value='10000.00', currency='RUB'),
                description='Webhook payment',
            ),
        )
        payload = (
            f'{{"event":"payment.succeeded","object":{{"id":"payment-id","metadata":{{"payment_token":"3fa85f64-5717-4562-b3fc-2c963f66afa6",'
            f'"user_id":"{self.user.id}","premise_id":"{self.premise.id}"}}}}}}'
        ).encode()

        status, body = handle_yookassa_webhook(payload)

        self.assertEqual(status, 200)
        self.assertIsNone(body)
        self.assertEqual(Payment.objects.count(), 1)
        self.assertEqual(Payment.objects.first().provider_payment_id, 'payment-id')
        self.assertEqual(Booking.objects.filter(premise=self.premise, user=self.user).count(), 1)
        payment = Payment.objects.get(provider_payment_id='payment-id')
        booking = Booking.objects.get(premise=self.premise, user=self.user)
        self.assertEqual(booking.source_payment_id, payment.pk)

    def test_handle_webhook_invalid_json_returns_400(self):
        status, body = handle_yookassa_webhook(b'{')

        self.assertEqual(status, 400)
        self.assertEqual(body['detail'], 'Invalid JSON payload')

    @patch('apps.payments.services.WebhookNotification')
    def test_handle_webhook_duplicate_event_updates_idempotently(self, webhook_notification_mock):
        payment = Payment.objects.create(
            premise=self.premise,
            provider_payment_id='payment-id',
            idempotence_key='3fa85f64-5717-4562-b3fc-2c963f66afa6',
            status='succeeded',
            paid=True,
            amount_value=Decimal('10000.00'),
            amount_currency='RUB',
            description='Webhook payment',
            metadata={
                'payment_token': '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                'user_id': str(self.user.id),
                'premise_id': str(self.premise.id),
            },
        )
        webhook_notification_mock.return_value = SimpleNamespace(
            event='payment.succeeded',
            object=SimpleNamespace(
                id='payment-id',
                status='succeeded',
                paid=True,
                amount=SimpleNamespace(value='10000.00', currency='RUB'),
                description='Webhook payment',
            ),
        )
        payload = (
            f'{{"event":"payment.succeeded","object":{{"id":"payment-id","metadata":{{"payment_token":"3fa85f64-5717-4562-b3fc-2c963f66afa6",'
            f'"user_id":"{self.user.id}","premise_id":"{self.premise.id}"}}}}}}'
        ).encode()

        first_status, first_body = handle_yookassa_webhook(payload)
        second_status, second_body = handle_yookassa_webhook(payload)

        self.assertEqual(first_status, 200)
        self.assertIsNone(first_body)
        self.assertEqual(second_status, 200)
        self.assertIsNone(second_body)
        self.assertEqual(Payment.objects.count(), 1)
        payment.refresh_from_db()
        self.assertEqual(payment.status, 'succeeded')
        self.assertEqual(Booking.objects.filter(premise=self.premise, user=self.user).count(), 1)
        booking = Booking.objects.get(premise=self.premise, user=self.user)
        self.assertEqual(booking.source_payment_id, payment.pk)

    @patch('apps.payments.services.WebhookNotification')
    def test_handle_webhook_payment_canceled_does_not_create_booking(self, webhook_notification_mock):
        webhook_notification_mock.return_value = SimpleNamespace(
            event='payment.canceled',
            object=SimpleNamespace(
                id='payment-cancel-id',
                status='canceled',
                paid=False,
                amount=SimpleNamespace(value='10000.00', currency='RUB'),
                description='Canceled payment',
            ),
        )
        payload = (
            f'{{"event":"payment.canceled","object":{{"id":"payment-cancel-id","metadata":{{"payment_token":"3fa85f64-5717-4562-b3fc-2c963f66afa6",'
            f'"user_id":"{self.user.id}","premise_id":"{self.premise.id}"}}}}}}'
        ).encode()

        status, body = handle_yookassa_webhook(payload)

        self.assertEqual(status, 200)
        self.assertIsNone(body)
        self.assertEqual(Booking.objects.filter(premise=self.premise, user=self.user).count(), 0)

    @patch('apps.payments.services.WebhookNotification')
    def test_handle_webhook_unknown_status_falls_back_to_pending(self, webhook_notification_mock):
        webhook_notification_mock.return_value = SimpleNamespace(
            event='payment.waiting_for_capture',
            object=SimpleNamespace(
                id='payment-unknown-status-id',
                status='refunded',
                paid=False,
                amount=SimpleNamespace(value='10000.00', currency='RUB'),
                description='Unknown status payment',
            ),
        )
        payload = (
            f'{{"event":"payment.waiting_for_capture","object":{{"id":"payment-unknown-status-id","metadata":'
            f'{{"payment_token":"3fa85f64-5717-4562-b3fc-2c963f66afa6","user_id":"{self.user.id}","premise_id":"{self.premise.id}"}}}}}}'
        ).encode()

        status, body = handle_yookassa_webhook(payload)

        self.assertEqual(status, 200)
        self.assertIsNone(body)
        payment = Payment.objects.get(provider_payment_id='payment-unknown-status-id')
        self.assertEqual(payment.status, Payment.Status.PENDING)


class PaymentsWebhookEndpointTests(TestCase):
    def setUp(self):
        self.url = '/api/v1/payments/webhook'

    @patch('apps.payments.routers.handle_yookassa_webhook')
    def test_webhook_endpoint_success_returns_200(self, handle_webhook_mock):
        handle_webhook_mock.return_value = (200, None)

        response = self.client.post(
            self.url,
            data='{"event":"payment.succeeded"}',
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)

    @patch('apps.payments.routers.handle_yookassa_webhook')
    def test_webhook_endpoint_invalid_payload_returns_400(self, handle_webhook_mock):
        handle_webhook_mock.return_value = (400, {'detail': 'Invalid YooKassa notification payload'})

        response = self.client.post(
            self.url,
            data='{"event":"broken"}',
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['detail'], 'Invalid YooKassa notification payload')
