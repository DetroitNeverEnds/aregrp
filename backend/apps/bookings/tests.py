from decimal import Decimal
import uuid

from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.bookings.models import Booking
from apps.bookings.services import create_booking
from apps.payments.models import Payment
from apps.re_objects.models import Building, City, Premise, Region


class BookingAvailabilityTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='booking-user',
            email='booking@example.com',
            password='secret',
        )
        region = Region.objects.create(name='Тестовый регион', code='18')
        city = City.objects.create(name='Казань', region=region, is_default=True)
        building = Building.objects.create(name='БЦ Бронь', address='ул. Бронь, 1', city=city)
        self.premise = Premise.objects.create(
            city=city,
            building=building,
            area=Decimal('45.00'),
            price_per_sqm=120000,
            available_for_sale=True,
            available_for_rent=True,
            price_per_month=120000,
            premise_type=Premise.PremiseType.OFFICE,
            room_number='301',
            title='Office 301',
        )

    def test_create_booking_sale_fails_when_pending_payment_exists(self):
        Payment.objects.create(
            premise=self.premise,
            provider_payment_id='payment-pending',
            idempotence_key=uuid.uuid4(),
            status=Payment.Status.PENDING,
            paid=False,
            amount_value=Decimal('10000.00'),
            amount_currency='RUB',
            description='Pending payment',
            metadata={},
        )

        out, err = create_booking(self.user, self.premise.uuid, Booking.DealType.SALE)

        self.assertIsNone(out)
        self.assertIsNotNone(err)
        status, body = err
        self.assertEqual(status, 409)
        self.assertEqual(body['code'], 'BOOKINGS_PREMISE_UNAVAILABLE')
        self.assertEqual(Booking.objects.count(), 0)

    def test_create_booking_rent_fails_when_waiting_for_capture_payment_exists(self):
        Payment.objects.create(
            premise=self.premise,
            provider_payment_id='payment-waiting',
            idempotence_key=uuid.uuid4(),
            status=Payment.Status.WAITING_FOR_CAPTURE,
            paid=False,
            amount_value=Decimal('10000.00'),
            amount_currency='RUB',
            description='Waiting payment',
            metadata={},
        )

        out, err = create_booking(self.user, self.premise.uuid, Booking.DealType.RENT)

        self.assertIsNone(out)
        self.assertIsNotNone(err)
        status, body = err
        self.assertEqual(status, 409)
        self.assertEqual(body['code'], 'BOOKINGS_PREMISE_UNAVAILABLE')
        self.assertEqual(Booking.objects.count(), 0)
