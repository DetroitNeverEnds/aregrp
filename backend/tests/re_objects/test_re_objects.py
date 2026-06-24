"""
Smoke-тесты для API помещений и зданий (re_objects).

Проверяют, что все ручки отвечают 200 (или 404 где ожидаемо) и возвращают ожидаемую структуру.
"""
from datetime import timedelta
from decimal import Decimal
from uuid import UUID, uuid4

import pytest
from asgiref.sync import sync_to_async
from django.utils import timezone

from apps.bookings.models import Booking
from apps.deals.models import Deal
from apps.payments.models import Payment
from apps.re_objects.models import Building, BuildingImage, BuildingVideo, Floor, Premise
from apps.re_objects.services.premise_service import _build_building_detail_media


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

    async def test_buildings_list_sale_type_rent_filters_and_price_field(self, client, city):
        """sale_type=rent: только здания с арендой и только min_rent_price."""

        @sync_to_async
        def setup():
            rent_building = Building.objects.create(
                name='БЦ Только аренда',
                address='ул. Арендная, 1',
                city=city,
                description='',
            )
            rent_floor = Floor.objects.create(building=rent_building, number=1, title='Аренда')
            Premise.objects.create(
                building=rent_building,
                city=city,
                floor=rent_floor,
                area=Decimal('40'),
                price_per_month=80_000,
                available_for_rent=True,
                available_for_sale=False,
                room_number='101',
            )

            sale_building = Building.objects.create(
                name='БЦ Только продажа',
                address='ул. Продажная, 2',
                city=city,
                description='',
            )
            sale_floor = Floor.objects.create(building=sale_building, number=1, title='Продажа')
            Premise.objects.create(
                building=sale_building,
                city=city,
                floor=sale_floor,
                area=Decimal('50'),
                price_per_sqm=200_000,
                available_for_rent=False,
                available_for_sale=True,
                room_number='201',
            )
            return str(rent_building.uuid), str(sale_building.uuid)

        rent_uuid, sale_uuid = await setup()
        response = await client.get("/buildings/?sale_type=rent")

        assert response.status_code == 200
        data = response.json()
        ids = {item["uuid"] for item in data["items"]}
        assert rent_uuid in ids
        assert sale_uuid not in ids
        for item in data["items"]:
            assert "min_rent_price" in item
            assert "min_sale_price" not in item

    async def test_buildings_list_sale_type_sale_filters_and_price_field(self, client, city):
        """sale_type=sale: только здания с продажей и только min_sale_price."""

        @sync_to_async
        def setup():
            rent_building = Building.objects.create(
                name='БЦ Аренда only',
                address='ул. Rent, 1',
                city=city,
                description='',
            )
            rent_floor = Floor.objects.create(building=rent_building, number=1, title='Аренда')
            Premise.objects.create(
                building=rent_building,
                city=city,
                floor=rent_floor,
                area=Decimal('35'),
                price_per_month=70_000,
                available_for_rent=True,
                available_for_sale=False,
                room_number='R-01',
            )

            sale_building = Building.objects.create(
                name='БЦ Sale only',
                address='ул. Sale, 2',
                city=city,
                description='',
            )
            sale_floor = Floor.objects.create(building=sale_building, number=1, title='Продажа')
            Premise.objects.create(
                building=sale_building,
                city=city,
                floor=sale_floor,
                area=Decimal('45'),
                price_per_sqm=210_000,
                available_for_rent=False,
                available_for_sale=True,
                room_number='S-01',
            )
            return str(rent_building.uuid), str(sale_building.uuid)

        rent_uuid, sale_uuid = await setup()
        response = await client.get("/buildings/?sale_type=sale")

        assert response.status_code == 200
        data = response.json()
        ids = {item["uuid"] for item in data["items"]}
        assert sale_uuid in ids
        assert rent_uuid not in ids
        for item in data["items"]:
            assert "min_sale_price" in item
            assert "min_rent_price" not in item

    async def test_buildings_list_without_sale_type_returns_both_prices(self, client, city):
        """Без sale_type в каждом item присутствуют оба поля min_*_price."""

        @sync_to_async
        def setup():
            building = Building.objects.create(
                name='БЦ Без фильтра',
                address='ул. Общая, 1',
                city=city,
                description='',
            )
            floor = Floor.objects.create(building=building, number=1, title='Этаж')
            Premise.objects.create(
                building=building,
                city=city,
                floor=floor,
                area=Decimal('60'),
                price_per_month=90_000,
                price_per_sqm=220_000,
                available_for_rent=True,
                available_for_sale=True,
                room_number='301',
            )

        await setup()
        response = await client.get("/buildings/")

        assert response.status_code == 200
        data = response.json()
        assert data["items"]
        for item in data["items"]:
            assert "min_sale_price" in item
            assert "min_rent_price" in item

    async def test_buildings_list_invalid_sale_type_returns_422(self, client):
        """Невалидный sale_type -> 422."""
        response = await client.get("/buildings/?sale_type=invalid")

        assert response.status_code == 422

    async def test_buildings_list_filters_by_building_uuids(self, client, city):
        """building_uuids ограничивает выдачу только указанными зданиями."""

        @sync_to_async
        def setup():
            b1 = Building.objects.create(
                name='БЦ UUID 1',
                address='ул. UUID, 1',
                city=city,
                description='',
            )
            f1 = Floor.objects.create(building=b1, number=1, title='Этаж 1')
            Premise.objects.create(
                building=b1,
                city=city,
                floor=f1,
                area=Decimal('40'),
                price_per_month=70_000,
                available_for_rent=True,
                available_for_sale=False,
                room_number='U1',
            )

            b2 = Building.objects.create(
                name='БЦ UUID 2',
                address='ул. UUID, 2',
                city=city,
                description='',
            )
            f2 = Floor.objects.create(building=b2, number=1, title='Этаж 1')
            Premise.objects.create(
                building=b2,
                city=city,
                floor=f2,
                area=Decimal('45'),
                price_per_month=75_000,
                available_for_rent=True,
                available_for_sale=False,
                room_number='U2',
            )
            return str(b1.uuid), str(b2.uuid)

        b1_uuid, b2_uuid = await setup()
        response = await client.get(f"/buildings/?building_uuids={b1_uuid}")

        assert response.status_code == 200
        data = response.json()
        ids = {item["uuid"] for item in data["items"]}
        assert b1_uuid in ids
        assert b2_uuid not in ids

    async def test_buildings_list_building_uuids_video_media_uses_preview_url(self, client, city):
        """Для /buildings/?building_uuids=... у видео: url=card.webp, full_url=mp4."""

        @sync_to_async
        def setup():
            b1 = Building.objects.create(
                name='БЦ UUID VIDEO 1',
                address='ул. UUID Video, 1',
                city=city,
                description='',
            )
            f1 = Floor.objects.create(building=b1, number=1, title='Этаж 1')
            Premise.objects.create(
                building=b1,
                city=city,
                floor=f1,
                area=Decimal('44'),
                price_per_month=72_000,
                available_for_rent=True,
                available_for_sale=False,
                room_number='UV1',
            )

            b2 = Building.objects.create(
                name='БЦ UUID VIDEO 2',
                address='ул. UUID Video, 2',
                city=city,
                description='',
            )
            f2 = Floor.objects.create(building=b2, number=1, title='Этаж 1')
            Premise.objects.create(
                building=b2,
                city=city,
                floor=f2,
                area=Decimal('46'),
                price_per_month=74_000,
                available_for_rent=True,
                available_for_sale=False,
                room_number='UV2',
            )

            BuildingVideo.objects.bulk_create(
                [
                    BuildingVideo(
                        building=b1,
                        file='buildings/35/videos/slot1/1.mp4',
                        card='buildings/35/videos/slot1/card.webp',
                        order=1,
                    ),
                ]
            )
            return str(b1.uuid), str(b2.uuid)

        b1_uuid, b2_uuid = await setup()
        response = await client.get(f"/buildings/?building_uuids={b1_uuid}")

        assert response.status_code == 200
        data = response.json()
        ids = {item["uuid"] for item in data["items"]}
        assert b1_uuid in ids
        assert b2_uuid not in ids

        item = next(i for i in data["items"] if i["uuid"] == b1_uuid)
        video = next(m for m in item["media"] if m["type"] == "video")
        assert video["url"].endswith("card.webp")
        assert video["full_url"].endswith("1.mp4")

    async def test_buildings_list_filters_by_rent_price_range(self, client, city):
        """sale_type=rent + min_price/max_price фильтруют здания по цене аренды помещений."""

        @sync_to_async
        def setup():
            low = Building.objects.create(
                name='БЦ Дешевле',
                address='ул. Price, 1',
                city=city,
                description='',
            )
            low_floor = Floor.objects.create(building=low, number=1, title='Этаж 1')
            Premise.objects.create(
                building=low,
                city=city,
                floor=low_floor,
                area=Decimal('45'),
                price_per_month=60_000,
                available_for_rent=True,
                available_for_sale=False,
                room_number='P-LOW',
            )

            high = Building.objects.create(
                name='БЦ Дороже',
                address='ул. Price, 2',
                city=city,
                description='',
            )
            high_floor = Floor.objects.create(building=high, number=1, title='Этаж 1')
            Premise.objects.create(
                building=high,
                city=city,
                floor=high_floor,
                area=Decimal('50'),
                price_per_month=130_000,
                available_for_rent=True,
                available_for_sale=False,
                room_number='P-HIGH',
            )
            return str(low.uuid), str(high.uuid)

        low_uuid, high_uuid = await setup()
        response = await client.get("/buildings/?sale_type=rent&min_price=100000&max_price=150000")

        assert response.status_code == 200
        ids = {item["uuid"] for item in response.json()["items"]}
        assert high_uuid in ids
        assert low_uuid not in ids

    async def test_buildings_list_filters_by_area_range(self, client, city):
        """min_area/max_area фильтруют здания по площади связанных помещений."""

        @sync_to_async
        def setup():
            small = Building.objects.create(
                name='БЦ Малый',
                address='ул. Area, 1',
                city=city,
                description='',
            )
            small_floor = Floor.objects.create(building=small, number=1, title='Этаж 1')
            Premise.objects.create(
                building=small,
                city=city,
                floor=small_floor,
                area=Decimal('35'),
                price_per_month=80_000,
                available_for_rent=True,
                available_for_sale=False,
                room_number='A-S',
            )

            large = Building.objects.create(
                name='БЦ Большой',
                address='ул. Area, 2',
                city=city,
                description='',
            )
            large_floor = Floor.objects.create(building=large, number=1, title='Этаж 1')
            Premise.objects.create(
                building=large,
                city=city,
                floor=large_floor,
                area=Decimal('90'),
                price_per_month=120_000,
                available_for_rent=True,
                available_for_sale=False,
                room_number='A-L',
            )
            return str(small.uuid), str(large.uuid)

        small_uuid, large_uuid = await setup()
        response = await client.get("/buildings/?min_area=80&max_area=100")

        assert response.status_code == 200
        ids = {item["uuid"] for item in response.json()["items"]}
        assert large_uuid in ids
        assert small_uuid not in ids

    async def test_buildings_list_combined_sale_type_price_area_filters(self, client, city):
        """Комбинация sale_type=sale + price + area применяет фильтры к одному помещению здания."""

        @sync_to_async
        def setup():
            matched = Building.objects.create(
                name='БЦ Комбо подходит',
                address='ул. Combo, 1',
                city=city,
                description='',
            )
            matched_floor = Floor.objects.create(building=matched, number=1, title='Этаж 1')
            Premise.objects.create(
                building=matched,
                city=city,
                floor=matched_floor,
                area=Decimal('70'),
                price_per_sqm=200_000,
                available_for_rent=False,
                available_for_sale=True,
                room_number='C-OK',
            )

            no_match = Building.objects.create(
                name='БЦ Комбо не подходит',
                address='ул. Combo, 2',
                city=city,
                description='',
            )
            no_match_floor = Floor.objects.create(building=no_match, number=1, title='Этаж 1')
            Premise.objects.create(
                building=no_match,
                city=city,
                floor=no_match_floor,
                area=Decimal('45'),
                price_per_sqm=120_000,
                available_for_rent=False,
                available_for_sale=True,
                room_number='C-NO',
            )
            return str(matched.uuid), str(no_match.uuid)

        matched_uuid, no_match_uuid = await setup()
        response = await client.get("/buildings/?sale_type=sale&min_price=13000000&min_area=60")

        assert response.status_code == 200
        ids = {item["uuid"] for item in response.json()["items"]}
        assert matched_uuid in ids
        assert no_match_uuid not in ids


@pytest.mark.django_db
class TestBuildingDetail:
    """GET /buildings/{uuid} — здание по UUID."""

    async def test_building_detail_success(self, client, building_with_premise):
        """Успешное получение здания по UUID — media_categories, media."""
        building, premise = building_with_premise
        response = await client.get(f"/buildings/{building.uuid}")

        assert response.status_code == 200
        data = response.json()
        assert data["uuid"] == str(building.uuid)
        assert data["title"] == building.name
        assert data["address"] == building.address
        assert "total_floors" not in data
        assert "floors" in data
        assert isinstance(data["floors"], list)
        assert len(data["floors"]) == 1
        assert data["floors"][0] == {
            "key": str(premise.floor_id),
            "title": "Этаж 1",
            "has_sale": False,
            "has_rent": True,
        }
        assert "media_categories" in data
        assert "media" in data
        assert "presentation" in data
        assert data["presentation"] is None
        assert isinstance(data["media_categories"], list)
        assert isinstance(data["media"], list)

    async def test_building_detail_returns_presentation_url(self, client, city):
        """Если у здания есть презентация, API отдает её URL в поле presentation."""

        @sync_to_async
        def setup():
            building = Building.objects.create(
                name='БЦ С презентацией',
                address='ул. Презентационная, 1',
                city=city,
                description='',
                presentation='buildings/test/presentation/demo.pdf',
            )
            floor = Floor.objects.create(building=building, number=1, title='Этаж 1')
            Premise.objects.create(
                building=building,
                city=city,
                floor=floor,
                area=Decimal('50'),
                price_per_month=60_000,
                available_for_rent=True,
                available_for_sale=False,
                room_number='P-01',
            )
            return building

        building = await setup()
        response = await client.get(f'/buildings/{building.uuid}')

        assert response.status_code == 200
        data = response.json()
        assert data['presentation'] is not None
        assert data['presentation'].endswith('demo.pdf')

    async def test_building_detail_floors_availability_flags(self, client, city):
        """floors: has_sale/has_rent считаются только по флагам помещений на каждом этаже."""

        @sync_to_async
        def setup():
            building = Building.objects.create(
                name='БЦ Этажи деталь',
                address='ул. Этажная, 1',
                city=city,
                description='',
            )
            floor1 = Floor.objects.create(building=building, number=1, title='Офисы')
            floor2 = Floor.objects.create(building=building, number=2, title='Продажа')
            floor3 = Floor.objects.create(building=building, number=3, title='Микс')
            Premise.objects.create(
                building=building,
                city=city,
                floor=floor1,
                area=Decimal('20'),
                price_per_month=50_000,
                available_for_rent=True,
                available_for_sale=False,
                room_number='101',
            )
            Premise.objects.create(
                building=building,
                city=city,
                floor=floor2,
                area=Decimal('25'),
                price_per_month=0,
                price_per_sqm=200_000,
                available_for_rent=False,
                available_for_sale=True,
                room_number='201',
            )
            Premise.objects.create(
                building=building,
                city=city,
                floor=floor3,
                area=Decimal('30'),
                price_per_month=80_000,
                price_per_sqm=220_000,
                available_for_rent=True,
                available_for_sale=True,
                room_number='301',
            )
            return building, floor1, floor2, floor3

        building, floor1, floor2, floor3 = await setup()
        response = await client.get(f"/buildings/{building.uuid}")

        assert response.status_code == 200
        data = response.json()
        assert data["floors"] == [
            {"key": str(floor1.id), "title": "Офисы", "has_sale": False, "has_rent": True},
            {"key": str(floor2.id), "title": "Продажа", "has_sale": True, "has_rent": False},
            {"key": str(floor3.id), "title": "Микс", "has_sale": True, "has_rent": True},
        ]

    async def test_building_detail_media_uses_preview_in_url(self, client, city):
        """Деталь здания: в media url — превью, full_url — детальный URL."""
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
            fl = Floor.objects.create(building=b, number=1, title='Этаж 1')
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
        assert m0['url'] != m0['full_url']
        assert m0['url'].endswith('card.webp')
        assert m0['full_url'].endswith('detail.webp')

    def test_building_detail_media_video_uses_card_preview(self):
        """Для видео в деталке url — card.webp, full_url — исходный файл ролика."""

        class _FileLike:
            def __init__(self, url: str):
                self.url = url

        class _Image:
            def __init__(self):
                self.card = _FileLike('/media/buildings/35/images/img1/card.webp')
                self.detail = _FileLike('/media/buildings/35/images/img1/detail.webp')
                self.category = ''
                self.title = None
                self.is_primary = True
                self.order = 1
                self.pk = 101

        class _Video:
            def __init__(self):
                self.card = _FileLike('/media/buildings/35/videos/vid1/card.webp')
                self.file = _FileLike('/media/buildings/35/videos/vid1/1.mp4')
                self.category = ''
                self.title = None
                self.order = 2
                self.pk = 202

        class _Rel:
            def __init__(self, rows):
                self._rows = rows

            def all(self):
                return self._rows

        class _BuildingStub:
            def __init__(self):
                self.images = _Rel([_Image()])
                self.videos = _Rel([_Video()])

        _, media = _build_building_detail_media(_BuildingStub())
        video_item = next(item for item in media if item.type == 'video')

        assert video_item.url.endswith('card.webp')
        assert video_item.full_url.endswith('1.mp4')

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
            fl = Floor.objects.create(building=b, number=1, title='Этаж 1')
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
        def primary_card_url():
            img = BuildingImage.objects.get(pk=primary_pk)
            return img.card.url if img.card else img.original.url

        want_card = await primary_card_url()

        response = await client.get(f"/buildings/{building.uuid}")
        assert response.status_code == 200
        detail = response.json()
        assert len(detail['media']) >= 2
        assert detail['media'][0]['type'] == 'photo'
        assert detail['media'][0]['url'] == want_card

        list_response = await client.get('/buildings/')
        assert list_response.status_code == 200
        payload = list_response.json()
        item = next((i for i in payload['items'] if i['uuid'] == str(building.uuid)), None)
        assert item is not None
        assert len(item['media']) >= 2
        assert item['media'][0]['type'] == 'photo'
        assert item['media'][0]['url'] == want_card

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
            assert "floor" in item
            if item["floor"] is not None:
                assert "id" in item["floor"]
                assert "title" in item["floor"]
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
        """Сделка аренды (Deal) не скрывает помещение в каталоге; available учитывает брони и незавершённые оплаты."""
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

    async def test_premises_list_sale_hides_premise_with_pending_payment(
        self, client, building_with_premise,
    ):
        """Незавершённая оплата скрывает помещение из доступных в каталоге продажи."""
        building, premise = building_with_premise

        @sync_to_async
        def _payment():
            premise.available_for_sale = True
            premise.price_per_sqm = 200_000
            premise.save(update_fields=['available_for_sale', 'price_per_sqm', 'full_sell_price'])
            Payment.objects.create(
                premise=premise,
                provider_payment_id='pending-sale-catalog',
                idempotence_key=uuid4(),
                status=Payment.Status.PENDING,
                paid=False,
                amount_value=Decimal('10000.00'),
                amount_currency='RUB',
                description='Pending payment',
                metadata={},
            )

        await _payment()
        response = await client.get(
            f"/premises?sale_type=sale&building_uuids={building.uuid}"
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
            floor = Floor.objects.create(building=building, number=1, title='Этаж 1')
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
        assert data["floor"] == {
            "id": str(premise.floor_id),
            "title": premise.floor.title,
        }
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
            floor = Floor.objects.create(building=building, number=1, title='Этаж 1')
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
    """GET /floors/{building_uuid}/{floor_id} — помещения на этаже."""

    async def test_floor_premises_success(self, client, building_with_premise):
        """Успешный ответ — объект этажа с premises."""
        building, premise = building_with_premise
        floor_id = premise.floor.id if premise.floor else 1
        response = await client.get(
            f"/floors/{building.uuid}/{floor_id}?sale_type=rent"
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert data["building_uuid"] == str(building.uuid)
        assert data["floor_id"] == str(premise.floor.id)
        assert data["title"] == premise.floor.title
        assert data["floor_number"] == premise.floor.number
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
        assert data["floor_id"] == "999"
        assert data["floor_number"] == 999
        assert data["title"] == ""
        assert data["schema_svg"] is None
        assert data["premises"] == []

    async def test_floor_premises_label_price_depends_on_sale_type(self, client, city):
        """label_price должен соответствовать sale_type запроса."""

        @sync_to_async
        def _setup():
            building = Building.objects.create(
                name='БЦ Цена по типу сделки',
                address='ул. Ценовая, 1',
                city=city,
                description='',
            )
            floor = Floor.objects.create(building=building, number=1, title='Этаж 1')
            premise = Premise.objects.create(
                building=building,
                city=city,
                floor=floor,
                area=Decimal('40'),
                price_per_month=80_000,
                price_per_sqm=200_000,
                available_for_rent=True,
                available_for_sale=True,
                room_number='P1',
            )
            return building, premise

        building, premise = await _setup()
        floor_id = premise.floor.id

        rent_response = await client.get(
            f"/floors/{building.uuid}/{floor_id}?sale_type=rent"
        )
        sale_response = await client.get(
            f"/floors/{building.uuid}/{floor_id}?sale_type=sale"
        )

        assert rent_response.status_code == 200
        assert sale_response.status_code == 200

        rent_item = next(i for i in rent_response.json()["premises"] if i["uuid"] == str(premise.uuid))
        sale_item = next(i for i in sale_response.json()["premises"] if i["uuid"] == str(premise.uuid))

        assert rent_item["label_price"] == "80 000 ₽"
        assert sale_item["label_price"] == "8 000 000 ₽"

    async def test_floor_premises_rent_is_occupied_always_false(
        self, client, building_with_premise, test_user,
    ):
        """sale_type=rent: is_occupied всегда false; сделки аренды не влияют на is_available."""
        building, premise = building_with_premise
        floor_id = premise.floor.id
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
            f"/floors/{building.uuid}/{floor_id}?sale_type=rent"
        )
        assert response.status_code == 200
        item = next(i for i in response.json()["premises"] if i["uuid"] == str(premise.uuid))
        assert item["is_occupied"] is False
        assert item["is_available"] is True

    async def test_floor_premises_rent_is_unavailable_when_pending_payment_exists(
        self, client, building_with_premise,
    ):
        """sale_type=rent: незавершённая оплата делает помещение недоступным."""
        building, premise = building_with_premise
        floor_number = premise.floor.number

        @sync_to_async
        def _payment():
            Payment.objects.create(
                premise=premise,
                provider_payment_id='pending-floor-rent',
                idempotence_key=uuid4(),
                status=Payment.Status.PENDING,
                paid=False,
                amount_value=Decimal('10000.00'),
                amount_currency='RUB',
                description='Pending payment',
                metadata={},
            )

        await _payment()
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
        """sale_type=sale: при выключенном show_rented_button is_occupied=false; сделки не влияют."""

        @sync_to_async
        def _setup():
            building = Building.objects.create(
                name='БЦ Этаж продажа',
                address='ул. Схемная, 3',
                city=city,
                description='',
            )
            floor = Floor.objects.create(building=building, number=2, title='Этаж 2')
            premise = Premise.objects.create(
                building=building,
                city=city,
                floor=floor,
                area=Decimal('40'),
                price_per_month=80_000,
                price_per_sqm=200_000,
                available_for_rent=True,
                available_for_sale=True,
                show_rented_button=False,
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
            f"/floors/{building.uuid}/{premise.floor.id}?sale_type=sale"
        )
        assert response.status_code == 200
        item = next(i for i in response.json()["premises"] if i["uuid"] == str(premise.uuid))
        assert item["is_occupied"] is False

    async def test_floor_premises_sale_is_occupied_true_when_show_rented_button_enabled(
        self, client, city,
    ):
        """sale_type=sale: при включенном show_rented_button is_occupied=true."""

        @sync_to_async
        def _setup():
            building = Building.objects.create(
                name='БЦ Только продажа',
                address='ул. Продажная, 9',
                city=city,
                description='',
            )
            floor = Floor.objects.create(building=building, number=1, title='Этаж 1')
            premise = Premise.objects.create(
                building=building,
                city=city,
                floor=floor,
                area=Decimal('30'),
                price_per_month=0,
                price_per_sqm=250_000,
                available_for_rent=False,
                available_for_sale=True,
                show_rented_button=True,
                room_number='S9',
            )
            return building, premise

        building, premise = await _setup()
        response = await client.get(
            f"/floors/{building.uuid}/{premise.floor.id}?sale_type=sale"
        )
        assert response.status_code == 200
        item = next(i for i in response.json()["premises"] if i["uuid"] == str(premise.uuid))
        assert item["is_occupied"] is True
