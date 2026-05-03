"""
Smoke-тесты для API помещений и зданий (re_objects).

Проверяют, что все ручки отвечают 200 (или 404 где ожидаемо) и возвращают ожидаемую структуру.
"""
from datetime import timedelta
from decimal import Decimal

import pytest
from asgiref.sync import sync_to_async
from django.utils import timezone
from uuid import UUID, uuid4

from apps.bookings.models import Booking
from apps.deals.models import Deal
from apps.re_objects.models import Building, BuildingImage, Floor, Premise


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

    async def test_building_detail_media_url_equals_full_url(self, client, city):
        """Деталь здания: в media поля url и full_url совпадают (оба как full_url в списке)."""
        from io import BytesIO

        from django.core.files.uploadedfile import SimpleUploadedFile
        from PIL import Image

        buf = BytesIO()
        Image.new('RGB', (480, 320), color=(90, 90, 90)).save(buf, format='PNG')
        buf.seek(0)
        upload = SimpleUploadedFile('facade.png', buf.read(), content_type='image/png')

        @sync_to_async
        def setup():
            b = Building.objects.create(
                name='БЦ UrlFull',
                address='ул. Url, 1',
                city=city,
                description='',
            )
            fl = Floor.objects.create(building=b, number=1)
            Premise.objects.create(
                building=b,
                city=city,
                floor=fl,
                area=55,
                price_per_month=5000,
                available_for_rent=True,
                room_number='U1',
            )
            BuildingImage.objects.create(building=b, original=upload, order=1, is_primary=True)
            return b

        building = await setup()
        response = await client.get(f"/buildings/{building.uuid}")
        assert response.status_code == 200
        data = response.json()
        assert len(data['media']) >= 1
        m0 = data['media'][0]
        assert m0['url'] == m0['full_url']

    async def test_building_primary_image_first_in_api(self, client, city):
        """Основное фото первое в media при detail и list, даже при order больше других снимков."""
        from io import BytesIO

        from django.core.files.uploadedfile import SimpleUploadedFile
        from PIL import Image

        def _png(name: str, color: tuple[int, int, int]) -> SimpleUploadedFile:
            buf = BytesIO()
            Image.new('RGB', (80, 80), color=color).save(buf, format='PNG')
            buf.seek(0)
            return SimpleUploadedFile(name, buf.read(), content_type='image/png')

        @sync_to_async
        def setup():
            b = Building.objects.create(
                name='БЦ PrimaryOrder',
                address='ул. Primary, 2',
                city=city,
                description='',
            )
            fl = Floor.objects.create(building=b, number=1)
            Premise.objects.create(
                building=b,
                city=city,
                floor=fl,
                area=40,
                price_per_month=4000,
                available_for_rent=True,
                room_number='P1',
            )
            BuildingImage.objects.create(
                building=b,
                original=_png('first.png', (10, 10, 10)),
                order=1,
                is_primary=False,
            )
            primary = BuildingImage.objects.create(
                building=b,
                original=_png('second.png', (200, 200, 200)),
                order=2,
                is_primary=True,
            )
            primary.refresh_from_db()
            return b, primary.pk

        building, primary_pk = await setup()

        @sync_to_async
        def primary_detail_url():
            img = BuildingImage.objects.get(pk=primary_pk)
            return img.detail.url if img.detail else img.original.url

        want_detail = await primary_detail_url()

        response = await client.get(f"/buildings/{building.uuid}")
        assert response.status_code == 200
        detail = response.json()
        assert len(detail['media']) >= 2
        assert detail['media'][0]['type'] == 'photo'
        assert detail['media'][0]['url'] == want_detail

        list_response = await client.get('/buildings/')
        assert list_response.status_code == 200
        payload = list_response.json()
        item = next((i for i in payload['items'] if i['uuid'] == str(building.uuid)), None)
        assert item is not None
        assert len(item['media']) >= 2
        assert item['media'][0]['type'] == 'photo'
        assert item['media'][0]['full_url'] == want_detail

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

    async def test_premises_list_rent_ignores_deal_shows_premise(
        self, client, building_with_premise, test_user,
    ):
        """Сделка аренды не скрывает помещение в каталоге; фильтр available смотрит только брони."""
        building, premise = building_with_premise
        deal_until = timezone.now().date() + timedelta(days=30)

        @sync_to_async
        def _deal():
            Deal.objects.create(
                user_id=test_user.id,
                premise=premise,
                deal_type=Deal.DealType.RENT,
                rent_expires_at=deal_until,
                commission_amount=1,
            )

        await _deal()
        response = await client.get(
            f"/premises?sale_type=rent&building_uuids={building.uuid}"
        )
        assert response.status_code == 200
        uuids = [i["uuid"] for i in response.json()["items"]]
        assert str(premise.uuid) in uuids

    async def test_premises_list_rent_hides_active_booking(
        self, client, building_with_premise, test_user,
    ):
        """Активная бронь скрывает помещение в каталоге аренды (implicit available=true)."""
        building, premise = building_with_premise
        booking_expires = timezone.now() + timedelta(days=2)

        @sync_to_async
        def _booking():
            Booking.objects.create(
                user_id=test_user.id,
                premise=premise,
                deal_type=Booking.DealType.RENT,
                expires_at=booking_expires,
            )

        await _booking()
        response = await client.get(
            f"/premises?sale_type=rent&building_uuids={building.uuid}"
        )
        assert response.status_code == 200
        uuids = [i["uuid"] for i in response.json()["items"]]
        assert str(premise.uuid) not in uuids

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
                price_per_month=0,
                price_per_sqm=200_000,
                available_for_rent=False,
                available_for_sale=True,
                room_number="S1",
            )
            return p

        premise = await _create()
        response = await client.get("/premises?sale_type=sale")

        assert response.status_code == 200
        data = response.json()
        item = next(i for i in data["items"] if i["uuid"] == str(premise.uuid))
        assert item["price"] == premise.full_sell_price
        assert item["price"] == 10_000_000
        assert item["sale_price"] == premise.full_sell_price
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
                price_per_month=0,
                price_per_sqm=250_000,
                available_for_rent=False,
                available_for_sale=True,
                room_number="D1",
            )

        premise = await _create()
        response = await client.get(f"/premises/{premise.uuid}?sale_type=sale")

        assert response.status_code == 200
        data = response.json()
        assert data["price"] == premise.full_sell_price
        assert data["sale_price"] == premise.full_sell_price
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
        response = await client.get(
            f"/floors/{building.uuid}/{floor_number}?sale_type=rent"
        )

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
            assert "is_available" in item
            assert "is_occupied" in item
            assert isinstance(item["is_available"], bool)
            assert isinstance(item["is_occupied"], bool)

    async def test_floor_premises_nonexistent_floor(self, client, building_with_premise):
        """Пустой premises-список для несуществующего этажа."""
        building, _ = building_with_premise
        response = await client.get(
            f"/floors/{building.uuid}/999?sale_type=rent"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["building_uuid"] == str(building.uuid)
        assert data["floor_number"] == 999
        assert data["schema_svg"] is None
        assert data["premises"] == []

    async def test_floor_premises_rent_is_occupied_always_false(
        self, client, building_with_premise, test_user,
    ):
        """sale_type=rent: is_occupied всегда false; is_available по активной аренде."""
        building, premise = building_with_premise
        floor_number = premise.floor.number
        deal_until = timezone.now().date() + timedelta(days=30)

        @sync_to_async
        def _deal():
            Deal.objects.create(
                user_id=test_user.id,
                premise=premise,
                deal_type=Deal.DealType.RENT,
                rent_expires_at=deal_until,
                commission_amount=1,
            )

        await _deal()
        response = await client.get(
            f"/floors/{building.uuid}/{floor_number}?sale_type=rent"
        )
        assert response.status_code == 200
        item = next(i for i in response.json()["premises"] if i["uuid"] == str(premise.uuid))
        assert item["is_occupied"] is False
        assert item["is_available"] is False

    async def test_floor_premises_sale_is_occupied_false_when_also_for_rent(
        self, client, city, test_user,
    ):
        """sale_type=sale: доступно и для аренды — is_occupied false; сделки не влияют."""

        @sync_to_async
        def _setup():
            building = Building.objects.create(
                name='БЦ Этаж продажа',
                address='ул. Схемная, 3',
                city=city,
                description='',
            )
            floor = Floor.objects.create(building=building, number=2)
            premise = Premise.objects.create(
                building=building,
                city=city,
                floor=floor,
                area=Decimal('40'),
                price_per_month=80_000,
                price_per_sqm=200_000,
                available_for_rent=True,
                available_for_sale=True,
                room_number='201',
            )
            Deal.objects.create(
                user_id=test_user.id,
                premise=premise,
                deal_type=Deal.DealType.RENT,
                rent_expires_at=timezone.now().date() + timedelta(days=60),
                commission_amount=1,
            )
            return building, premise

        building, premise = await _setup()
        response = await client.get(
            f"/floors/{building.uuid}/{premise.floor.number}?sale_type=sale"
        )
        assert response.status_code == 200
        item = next(i for i in response.json()["premises"] if i["uuid"] == str(premise.uuid))
        assert item["is_occupied"] is False

    async def test_floor_premises_sale_is_occupied_true_sale_only(
        self, client, city,
    ):
        """sale_type=sale: только продажа (не в аренду) — is_occupied true."""

        @sync_to_async
        def _setup():
            building = Building.objects.create(
                name='БЦ Только продажа',
                address='ул. Продажная, 9',
                city=city,
                description='',
            )
            floor = Floor.objects.create(building=building, number=1)
            premise = Premise.objects.create(
                building=building,
                city=city,
                floor=floor,
                area=Decimal('30'),
                price_per_month=0,
                price_per_sqm=250_000,
                available_for_rent=False,
                available_for_sale=True,
                room_number='S9',
            )
            return building, premise

        building, premise = await _setup()
        response = await client.get(
            f"/floors/{building.uuid}/{premise.floor.number}?sale_type=sale"
        )
        assert response.status_code == 200
        item = next(i for i in response.json()["premises"] if i["uuid"] == str(premise.uuid))
        assert item["is_occupied"] is True
