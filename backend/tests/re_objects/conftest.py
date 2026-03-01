"""
Фикстуры для тестов re_objects (здания, помещения).
"""
import pytest
from asgiref.sync import sync_to_async

from apps.re_objects.models import Region, City, Building, Floor, Premise


def _create_region():
    region, _ = Region.objects.get_or_create(
        name="Татарстан",
        defaults={"code": "16", "is_default": True},
    )
    return region


def _create_city(region):
    city, _ = City.objects.get_or_create(
        name="Казань",
        region=region,
        defaults={"is_default": True},
    )
    return city


def _create_building_with_premise(city):
    """Создаёт здание с этажом и помещением (для аренды, доступно)."""
    building = Building.objects.create(
        name="БЦ Тестовый",
        address="ул. Тестовая, 1",
        city=city,
        description="Тестовое здание",
    )
    floor = Floor.objects.create(building=building, number=1)
    premise = Premise.objects.create(
        building=building,
        city=city,
        floor=floor,
        area=50,
        price_per_month=100000,
        status=Premise.Status.AVAILABLE,
        available_for_rent=True,
        available_for_sale=False,
        number="101",
    )
    return building, premise


@pytest.fixture
async def region(db):
    """Регион для тестов."""
    return await sync_to_async(_create_region)()


@pytest.fixture
async def city(db, region):
    return await sync_to_async(_create_city)(region)


@pytest.fixture
async def building_with_premise(city, db):
    """Здание с помещением (аренда, доступно)."""
    return await sync_to_async(_create_building_with_premise)(city)
