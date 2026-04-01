"""
Smoke-тесты для API помещений и зданий (re_objects).

Проверяют, что все ручки отвечают 200 (или 404 где ожидаемо) и возвращают ожидаемую структуру.
"""
from decimal import Decimal

import pytest
from asgiref.sync import sync_to_async
from uuid import UUID, uuid4

from apps.re_objects.models import Building, Floor, Premise


@pytest.fixture
def client(api_client):
    return api_client


@pytest.mark.django_db
class TestPremisesBuildings:
    """GET /premises/buildings — список зданий для фильтра."""

    async def test_premises_buildings_success(self, client, building_with_premise):
        """Успешный ответ — массив [{ uuid, name, address }, ...]."""
        response = await client.get("/premises/buildings")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if data:
            item = data[0]
            assert "uuid" in item
            assert "name" in item
            assert "address" in item

    async def test_premises_buildings_structure(self, client):
        """Ответ — массив, без items/total/page."""
        response = await client.get("/premises/buildings")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_premises_buildings_available_filter(self, client, building_with_premise):
        """Фильтр available=true и available=false."""
        r1 = await client.get("/premises/buildings?available=true")
        r2 = await client.get("/premises/buildings?available=false")
        assert r1.status_code == 200
        assert r2.status_code == 200


@pytest.mark.django_db
class TestBuildingsList:
    """GET /buildings/ — список зданий."""

    async def test_buildings_list_success(self, client, building_with_premise):
        """Успешный ответ, структура items."""
        response = await client.get("/buildings/")

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert isinstance(data["items"], list)
        if data["items"]:
            item = data["items"][0]
            assert "uuid" in item
            assert "title" in item
            assert "address" in item
            assert "description" in item
            assert "media" in item

    async def test_buildings_list_structure(self, client):
        """Структура ответа: items, total, page, page_size, total_pages."""
        response = await client.get("/buildings/")

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "page_size" in data
        assert "total_pages" in data
        assert isinstance(data["items"], list)
        assert data["total"] >= 0
        for item in data["items"]:
            assert "uuid" in item
            assert "media" in item

    async def test_buildings_list_pagination(self, client, building_with_premise):
        """Пагинация page, page_size."""
        response = await client.get("/buildings/?page=1&page_size=6")

        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["page_size"] == 6



@pytest.mark.django_db
class TestBuildingDetail:
    """GET /buildings/{uuid} — здание по UUID."""

    async def test_building_detail_success(self, client, building_with_premise):
        """Успешное получение здания по UUID — media_categories, media."""
        building, _ = building_with_premise
        response = await client.get(f"/buildings/{building.uuid}")

        assert response.status_code == 200
        data = response.json()
        assert data["uuid"] == str(building.uuid)
        assert data["title"] == building.name
        assert data["address"] == building.address
        assert "media_categories" in data
        assert "media" in data
        assert isinstance(data["media_categories"], list)
        assert isinstance(data["media"], list)

    async def test_building_detail_not_found(self, client):
        """404 для несуществующего UUID."""
        fake_uuid = uuid4()
        response = await client.get(f"/buildings/{fake_uuid}")

        assert response.status_code == 404
        data = response.json()
        assert "detail" in data or "title" in data


@pytest.mark.django_db
class TestPremisesList:
    """GET /premises — каталог помещений."""

    async def test_premises_list_success(self, client, building_with_premise):
        """Успешный ответ, структура items, total, page."""
        response = await client.get("/premises")

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "page_size" in data
        assert "total_pages" in data
        assert isinstance(data["items"], list)
        if data["items"]:
            item = data["items"][0]
            assert "uuid" in item
            assert "building_uuid" in item
            UUID(item["building_uuid"])
            assert "name" in item
            assert "price" in item
            assert "sale_price" in item
            assert "rent_price" in item
            assert "address" in item
            assert "area" in item
            assert "has_tenant" in item
            assert "media" in item

    async def test_premises_list_structure(self, client):
        """Структура ответа: items, total, total_pages."""
        response = await client.get("/premises")

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "total_pages" in data
        assert isinstance(data["items"], list)
        assert data["total"] >= 0

    async def test_premises_list_pagination(self, client, building_with_premise):
        """Пагинация page, page_size."""
        response = await client.get("/premises?page=1&page_size=5")

        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["page_size"] == 5

    async def test_premises_list_sale_price_is_full_sell(self, client, city):
        """При sale_type=sale поле price совпадает с full_sell_price."""

        @sync_to_async
        def _create():
            building = Building.objects.create(
                name="БЦ Продажа",
                address="ул. Продажная, 1",
                city=city,
                description="",
            )
            floor = Floor.objects.create(building=building, number=1)
            p = Premise.objects.create(
                building=building,
                city=city,
                floor=floor,
                area=Decimal("50"),
                price_per_month=Decimal("0"),
                price_per_sqm=Decimal("200000"),
                status=Premise.Status.AVAILABLE,
                available_for_rent=False,
                available_for_sale=True,
                number="S1",
            )
            return p

        premise = await _create()
        response = await client.get("/premises?sale_type=sale")

        assert response.status_code == 200
        data = response.json()
        item = next(i for i in data["items"] if i["uuid"] == str(premise.uuid))
        assert Decimal(str(item["price"])) == premise.full_sell_price
        assert Decimal(str(item["price"])) == Decimal("10000000.00")
        assert Decimal(str(item["sale_price"])) == premise.full_sell_price
        assert item["rent_price"] is None


@pytest.mark.django_db
class TestPremiseDetail:
    """GET /premises/{uuid} — деталь помещения."""

    async def test_premise_detail_success(self, client, building_with_premise):
        """Успешное получение помещения по UUID."""
        _, premise = building_with_premise
        response = await client.get(f"/premises/{premise.uuid}")

        assert response.status_code == 200
        data = response.json()
        assert data["uuid"] == str(premise.uuid)
        assert "building_uuid" in data
        UUID(data["building_uuid"])
        assert "name" in data
        assert "price" in data
        assert "sale_price" in data
        assert "rent_price" in data
        assert data["rent_price"] is not None
        assert data["sale_price"] is None
        assert "address" in data
        assert "area" in data
        assert "description" in data
        assert "media" in data

    async def test_premise_detail_sale_type_uses_full_sell_price(self, client, city):
        """sale_type=sale: price равен full_sell_price."""

        @sync_to_async
        def _create():
            building = Building.objects.create(
                name="БЦ Деталь",
                address="ул. Детальная, 2",
                city=city,
                description="",
            )
            floor = Floor.objects.create(building=building, number=1)
            return Premise.objects.create(
                building=building,
                city=city,
                floor=floor,
                area=Decimal("40"),
                price_per_month=Decimal("0"),
                price_per_sqm=Decimal("250000"),
                status=Premise.Status.AVAILABLE,
                available_for_rent=False,
                available_for_sale=True,
                number="D1",
            )

        premise = await _create()
        response = await client.get(f"/premises/{premise.uuid}?sale_type=sale")

        assert response.status_code == 200
        data = response.json()
        assert Decimal(str(data["price"])) == premise.full_sell_price
        assert Decimal(str(data["sale_price"])) == premise.full_sell_price
        assert data["rent_price"] is None

    async def test_premise_detail_not_found(self, client):
        """404 для несуществующего UUID."""
        fake_uuid = uuid4()
        response = await client.get(f"/premises/{fake_uuid}")

        assert response.status_code == 404
        data = response.json()
        assert "detail" in data or "title" in data


@pytest.mark.django_db
class TestFloorPremises:
    """GET /floors/{building_uuid}/{floor_number} — помещения на этаже."""

    async def test_floor_premises_success(self, client, building_with_premise):
        """Успешный ответ — объект этажа с premises."""
        building, premise = building_with_premise
        floor_number = premise.floor.number if premise.floor else 1
        response = await client.get(f"/floors/{building.uuid}/{floor_number}")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert data["building_uuid"] == str(building.uuid)
        assert data["floor_number"] == floor_number
        assert "schema_svg" in data
        assert "premises" in data
        assert isinstance(data["premises"], list)
        if data["premises"]:
            item = data["premises"][0]
            assert "uuid" in item
            assert "name" in item
            assert "label_area" in item
            assert "label_price" in item
            assert "is_occupied" in item
            assert isinstance(item["is_occupied"], bool)

    async def test_floor_premises_nonexistent_floor(self, client, building_with_premise):
        """Пустой premises-список для несуществующего этажа."""
        building, _ = building_with_premise
        response = await client.get(f"/floors/{building.uuid}/999")

        assert response.status_code == 200
        data = response.json()
        assert data["building_uuid"] == str(building.uuid)
        assert data["floor_number"] == 999
        assert data["schema_svg"] is None
        assert data["premises"] == []
