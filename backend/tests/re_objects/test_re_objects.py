"""
Smoke-тесты для API помещений и зданий (re_objects).

Проверяют, что все ручки отвечают 200 (или 404 где ожидаемо) и возвращают ожидаемую структуру.
"""
import pytest
from uuid import uuid4


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
        """Структура ответа: items, total, media в каждом item."""
        response = await client.get("/buildings/")

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert isinstance(data["items"], list)
        assert data["total"] >= 0
        for item in data["items"]:
            assert "uuid" in item
            assert "media" in item


@pytest.mark.django_db
class TestBuildingDetail:
    """GET /buildings/catalogue/{uuid} — информация о здании."""

    async def test_building_detail_success(self, client, building_with_premise):
        """Успешное получение здания по UUID."""
        building, _ = building_with_premise
        response = await client.get(f"/buildings/catalogue/{building.uuid}")

        assert response.status_code == 200
        data = response.json()
        assert data["uuid"] == str(building.uuid)
        assert data["title"] == building.name
        assert data["address"] == building.address
        assert "media" in data

    async def test_building_detail_not_found(self, client):
        """404 для несуществующего UUID."""
        fake_uuid = uuid4()
        response = await client.get(f"/buildings/catalogue/{fake_uuid}")

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
            assert "name" in item
            assert "price" in item
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
        assert "name" in data
        assert "price" in data
        assert "address" in data
        assert "area" in data
        assert "description" in data
        assert "media" in data

    async def test_premise_detail_not_found(self, client):
        """404 для несуществующего UUID."""
        fake_uuid = uuid4()
        response = await client.get(f"/premises/{fake_uuid}")

        assert response.status_code == 404
        data = response.json()
        assert "detail" in data or "title" in data
