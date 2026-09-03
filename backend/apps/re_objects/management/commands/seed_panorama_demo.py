"""Демо-данные: здание с этажами и помещениями + JPG-панорамы для локальной проверки."""
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.re_objects.models import (
    Building,
    BuildingImage,
    City,
    Floor,
    FloorPanorama,
    Premise,
    PremiseImage,
    PremisePanorama,
    Region,
)

PANORAMA_FILES = ('panorama-1.jpg', 'panorama-2.jpg', 'panorama-3.jpg')
DEMO_PDF = (
    b'%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n'
    b'2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\n'
    b'xref\n0 3\ntrailer<</Root 1 0 R>>\n%%EOF'
)
FIXTURES_DIR = Path(__file__).resolve().parent.parent.parent / 'fixtures' / 'demo'


def _panorama_dir() -> Path:
    return Path(settings.BASE_DIR).parent / 'frontend' / 'public' / 'panoramas'


def _attach_panorama(model_cls, parent_field: str, parent, filename: str, order: int, title: str):
    path = _panorama_dir() / filename
    if not path.is_file():
        raise FileNotFoundError(f'Файл панорамы не найден: {path}')
    with path.open('rb') as fh:
        kwargs = {parent_field: parent, 'order': order, 'title': title}
        obj = model_cls(**kwargs)
        obj.file.save(filename, File(fh), save=True)
        return obj


def _attach_photo_image(model_cls, parent_field: str, parent, filename: str, order: int, is_primary: bool):
    path = _panorama_dir() / filename
    if not path.is_file():
        raise FileNotFoundError(f'Файл не найден: {path}')
    with path.open('rb') as fh:
        kwargs = {parent_field: parent, 'order': order, 'is_primary': is_primary}
        obj = model_cls(**kwargs)
        obj.original.save(filename, File(fh), save=True)
        return obj


def _attach_floor_schema(floor, filename: str):
    path = FIXTURES_DIR / filename
    if not path.is_file():
        raise FileNotFoundError(f'SVG-схема не найдена: {path}')
    with path.open('rb') as fh:
        floor.schema_svg.save(filename, File(fh), save=True)
        return floor


class Command(BaseCommand):
    help = 'Создаёт демо-здание с панорамами на этажах и в помещениях'

    @transaction.atomic
    def handle(self, *args, **options):
        missing = [f for f in PANORAMA_FILES if not (_panorama_dir() / f).is_file()]
        if missing:
            self.stderr.write(f'Не найдены файлы: {", ".join(missing)} в {_panorama_dir()}')
            return

        region, _ = Region.objects.get_or_create(
            name='Татарстан',
            defaults={'code': '16', 'is_default': True},
        )
        city, _ = City.objects.get_or_create(
            name='Казань',
            region=region,
            defaults={'is_default': True},
        )

        building, created = Building.objects.get_or_create(
            name='БЦ Панорама (демо)',
            address='ул. Баумана, 1',
            city=city,
            defaults={
                'description': 'Демо-здание для проверки 3D-туров',
                'total_floors': 2,
            },
        )

        if not created:
            FloorPanorama.objects.filter(floor__building=building).delete()
            PremisePanorama.objects.filter(premise__building=building).delete()
            building.images.all().delete()
            building.floors.all().delete()
            building.premises.all().delete()

        building.presentation_rent.save(
            'presentation-rent.pdf',
            ContentFile(DEMO_PDF),
            save=False,
        )
        building.presentation_sale.save(
            'presentation-sale.pdf',
            ContentFile(DEMO_PDF),
            save=False,
        )
        building.save(update_fields=['presentation_rent', 'presentation_sale'])

        _attach_photo_image(BuildingImage, 'building', building, 'panorama-1.jpg', 1, True)
        _attach_photo_image(BuildingImage, 'building', building, 'panorama-2.jpg', 2, False)

        floor1 = Floor.objects.create(building=building, number=1, title='1 этаж')
        floor2 = Floor.objects.create(building=building, number=2, title='2 этаж')
        _attach_floor_schema(floor1, 'floor1.svg')
        _attach_floor_schema(floor2, 'floor2.svg')

        _attach_panorama(FloorPanorama, 'floor', floor1, 'panorama-1.jpg', 1, 'Холл')
        _attach_panorama(FloorPanorama, 'floor', floor1, 'panorama-2.jpg', 2, 'Коридор')
        _attach_panorama(FloorPanorama, 'floor', floor2, 'panorama-3.jpg', 1, 'Офисный этаж')

        premise1 = Premise.objects.create(
            building=building,
            city=city,
            floor=floor1,
            area=45,
            price_per_month=85000,
            available_for_rent=True,
            available_for_sale=True,
            price_per_sqm=120000,
            room_number='101',
            title='Офис 101',
            description='Светлый офис на первом этаже с панорамой и фото.',
        )
        premise1b = Premise.objects.create(
            building=building,
            city=city,
            floor=floor1,
            area=32,
            price_per_month=62000,
            available_for_rent=True,
            available_for_sale=False,
            room_number='102',
            title='Офис 102',
            description='Компактный офис для небольшой команды.',
        )
        premise2 = Premise.objects.create(
            building=building,
            city=city,
            floor=floor2,
            area=120,
            price_per_month=180000,
            price_per_sqm=150000,
            available_for_rent=True,
            available_for_sale=True,
            room_number='201',
            title='Офис 201',
            description='Большой open space с двумя панорамами.',
        )
        premise2b = Premise.objects.create(
            building=building,
            city=city,
            floor=floor2,
            area=55,
            price_per_month=95000,
            price_per_sqm=130000,
            available_for_rent=True,
            available_for_sale=True,
            room_number='202',
            title='Офис 202',
            description='Офис среднего размера на втором этаже.',
        )

        _attach_panorama(PremisePanorama, 'premise', premise1, 'panorama-1.jpg', 1, 'Комната')
        _attach_panorama(PremisePanorama, 'premise', premise2, 'panorama-2.jpg', 1, 'Переговорная')
        _attach_panorama(PremisePanorama, 'premise', premise2, 'panorama-3.jpg', 2, 'Open space')
        _attach_panorama(PremisePanorama, 'premise', premise2b, 'panorama-3.jpg', 1, 'Кабинет')

        _attach_panorama(PremisePanorama, 'premise', premise1b, 'panorama-2.jpg', 1, 'Кабинет')

        _attach_photo_image(PremiseImage, 'premise', premise1, 'panorama-2.jpg', 1, True)
        _attach_photo_image(PremiseImage, 'premise', premise1, 'panorama-3.jpg', 2, False)
        _attach_photo_image(PremiseImage, 'premise', premise1b, 'panorama-1.jpg', 1, True)
        _attach_photo_image(PremiseImage, 'premise', premise2, 'panorama-1.jpg', 1, True)
        _attach_photo_image(PremiseImage, 'premise', premise2b, 'panorama-2.jpg', 1, True)

        self.stdout.write(self.style.SUCCESS('Демо-данные созданы:'))
        self.stdout.write(f'  Здание:  {building.name}')
        self.stdout.write(f'  UUID:    {building.uuid}')
        self.stdout.write(f'  URL:     http://localhost:5173/building/{building.uuid}')
        self.stdout.write(f'  1 этаж: 101 → {premise1.uuid}')
        self.stdout.write(f'          102 → {premise1b.uuid}')
        self.stdout.write(f'  2 этаж: 201 → {premise2.uuid}')
        self.stdout.write(f'          202 → {premise2b.uuid}')
        self.stdout.write('  SVG-схемы этажей загружены, кликайте комнаты на плане')
