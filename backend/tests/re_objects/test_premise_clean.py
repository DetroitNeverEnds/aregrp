"""Валидация Premise.clean() / save(): галочки аренды и продажи только с ценой."""
import pytest
from django.core.exceptions import ValidationError

from apps.re_objects.models import Building, Floor, Premise


@pytest.mark.django_db
class TestPremisePriceValidation:
    def test_rent_without_monthly_price_raises(self, city):
        building = Building.objects.create(
            name='БЦ Clean',
            address='ул. Чистая, 1',
            city=city,
            description='',
        )
        floor = Floor.objects.create(building=building, number=1)
        p = Premise(
            building=building,
            city=city,
            floor=floor,
            area=40,
            price_per_month=None,
            available_for_rent=True,
            available_for_sale=False,
            room_number='1',
        )
        with pytest.raises(ValidationError) as exc:
            p.save()
        assert 'price_per_month' in exc.value.error_dict

    def test_rent_with_zero_monthly_price_raises(self, city):
        building = Building.objects.create(
            name='БЦ Clean2',
            address='ул. Чистая, 2',
            city=city,
            description='',
        )
        floor = Floor.objects.create(building=building, number=1)
        p = Premise(
            building=building,
            city=city,
            floor=floor,
            area=40,
            price_per_month=0,
            available_for_rent=True,
            available_for_sale=False,
            room_number='2',
        )
        with pytest.raises(ValidationError) as exc:
            p.save()
        assert 'price_per_month' in exc.value.error_dict

    def test_rent_with_monthly_price_ok(self, city):
        building = Building.objects.create(
            name='БЦ Clean3',
            address='ул. Чистая, 3',
            city=city,
            description='',
        )
        floor = Floor.objects.create(building=building, number=1)
        p = Premise.objects.create(
            building=building,
            city=city,
            floor=floor,
            area=40,
            price_per_month=80000,
            available_for_rent=True,
            available_for_sale=False,
            room_number='3',
        )
        assert p.pk is not None
        assert p.price_per_month == 80000

    def test_rent_off_allows_no_monthly_price(self, city):
        building = Building.objects.create(
            name='БЦ Clean4',
            address='ул. Чистая, 4',
            city=city,
            description='',
        )
        floor = Floor.objects.create(building=building, number=1)
        p = Premise.objects.create(
            building=building,
            city=city,
            floor=floor,
            area=40,
            price_per_month=None,
            available_for_rent=False,
            available_for_sale=True,
            price_per_sqm=200000,
            room_number='4',
        )
        assert p.pk is not None

    def test_sale_without_sqm_raises(self, city):
        building = Building.objects.create(
            name='БЦ Clean5',
            address='ул. Чистая, 5',
            city=city,
            description='',
        )
        floor = Floor.objects.create(building=building, number=1)
        p = Premise(
            building=building,
            city=city,
            floor=floor,
            area=40,
            price_per_month=None,
            available_for_rent=False,
            available_for_sale=True,
            price_per_sqm=None,
            room_number='5',
        )
        with pytest.raises(ValidationError) as exc:
            p.save()
        assert 'price_per_sqm' in exc.value.error_dict

    def test_sale_with_sqm_ok(self, city):
        building = Building.objects.create(
            name='БЦ Clean6',
            address='ул. Чистая, 6',
            city=city,
            description='',
        )
        floor = Floor.objects.create(building=building, number=1)
        p = Premise.objects.create(
            building=building,
            city=city,
            floor=floor,
            area=40,
            price_per_month=None,
            available_for_rent=False,
            available_for_sale=True,
            price_per_sqm=150000,
            room_number='6',
        )
        assert p.pk is not None
        assert p.full_sell_price is not None
