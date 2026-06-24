"""Производные медиа: размеры WebP и поля API url / full_url."""
from io import BytesIO

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from apps.re_objects.models import Building, Floor, Premise, PremiseImage, PremiseVideo
from apps.re_objects.services.media_processing import CARD_SIZE, process_raster_bytes
from apps.re_objects.services.premise_service import (
    _build_premise_media,
    _photo_api_urls,
    premise_to_detail_out,
)


def test_process_raster_bytes_card_and_detail_dimensions():
    buf = BytesIO()
    Image.new('RGB', (2000, 1200), color=(10, 20, 30)).save(buf, format='PNG')
    card_cf, detail_cf = process_raster_bytes(buf.getvalue())
    card_im = Image.open(BytesIO(card_cf.read()))
    detail_im = Image.open(BytesIO(detail_cf.read()))
    assert card_im.width <= CARD_SIZE[0] and card_im.height <= CARD_SIZE[1]
    assert card_im.width == CARD_SIZE[0] or card_im.height == CARD_SIZE[1]
    assert detail_im.width <= 1920 and detail_im.height <= 1080


@pytest.mark.django_db
def test_premise_image_save_writes_card_and_detail(city):
    buf = BytesIO()
    Image.new('RGB', (900, 600), color='red').save(buf, format='JPEG', quality=90)
    buf.seek(0)
    upload = SimpleUploadedFile('x.jpg', buf.read(), content_type='image/jpeg')
    building = Building.objects.create(
        name='Медиа-тест',
        address='ул. Медиа, 1',
        city=city,
        description='',
    )
    floor = Floor.objects.create(building=building, number=1, title='Этаж 1')
    premise = Premise.objects.create(
        building=building,
        city=city,
        floor=floor,
        area=40,
        price_per_month=1000,
        available_for_rent=True,
        room_number='M1',
    )
    img = PremiseImage.objects.create(premise=premise, original=upload, order=1)
    assert img.original
    assert img.card and img.detail
    card_im = Image.open(img.card.open('rb'))
    assert card_im.width <= CARD_SIZE[0] and card_im.height <= CARD_SIZE[1]
    assert card_im.width == CARD_SIZE[0] or card_im.height == CARD_SIZE[1]


@pytest.mark.django_db
def test_photo_api_urls_prefers_card_and_detail(city):
    buf = BytesIO()
    Image.new('RGB', (400, 400), color='green').save(buf, format='PNG')
    buf.seek(0)
    upload = SimpleUploadedFile('y.png', buf.read(), content_type='image/png')
    building = Building.objects.create(
        name='API-тест',
        address='ул. API, 2',
        city=city,
        description='',
    )
    floor = Floor.objects.create(building=building, number=1, title='Этаж 1')
    premise = Premise.objects.create(
        building=building,
        city=city,
        floor=floor,
        area=30,
        price_per_month=2000,
        available_for_rent=True,
        room_number='A1',
    )
    img = PremiseImage.objects.create(premise=premise, original=upload, order=1)
    u, fu = _photo_api_urls(img)
    assert u == img.card.url
    assert fu == img.detail.url
    media = _build_premise_media(premise)
    assert len(media) == 1
    assert media[0].url == img.card.url
    assert media[0].full_url == img.detail.url


@pytest.mark.django_db
def test_build_premise_media_includes_video_primary_photo_first(city):
    building = Building.objects.create(
        name='Видео-тест',
        address='ул. Видео, 1',
        city=city,
        description='',
    )
    floor = Floor.objects.create(building=building, number=1, title='Этаж 1')
    premise = Premise.objects.create(
        building=building,
        city=city,
        floor=floor,
        area=40,
        price_per_month=1000,
        available_for_rent=True,
        room_number='V1',
    )
    PremiseImage.objects.bulk_create(
        [
            PremiseImage(
                premise=premise,
                original='premises/1/images/1/secondary.jpg',
                card='premises/1/images/1/card.webp',
                detail='premises/1/images/1/detail.webp',
                order=2,
                is_primary=False,
            ),
            PremiseImage(
                premise=premise,
                original='premises/1/images/2/primary.jpg',
                card='premises/1/images/2/card.webp',
                detail='premises/1/images/2/detail.webp',
                order=1,
                is_primary=True,
            ),
        ]
    )
    PremiseVideo.objects.bulk_create(
        [
            PremiseVideo(
                premise=premise,
                file='premises/1/videos/1/tour.mp4',
                card='premises/1/videos/1/card.webp',
                order=1,
            ),
        ]
    )
    media = _build_premise_media(premise)
    assert [m.type for m in media] == ['photo', 'video', 'photo']
    assert media[0].url.endswith('images/2/card.webp')
    assert media[1].type == 'video'
    assert media[1].full_url.endswith('tour.mp4')


@pytest.mark.django_db
def test_premise_detail_presentation_url(city):
    building = Building.objects.create(
        name='Презентация-тест',
        address='ул. През, 1',
        city=city,
        description='',
    )
    floor = Floor.objects.create(building=building, number=1, title='Этаж 1')
    premise = Premise.objects.create(
        building=building,
        city=city,
        floor=floor,
        area=40,
        price_per_month=1000,
        available_for_rent=True,
        room_number='P1',
    )
    pdf = SimpleUploadedFile('deck.pdf', b'%PDF-1.4\n', content_type='application/pdf')
    premise.presentation.save('deck.pdf', pdf, save=True)

    detail = premise_to_detail_out(premise)
    assert detail.presentation_url == premise.presentation.url

    premise.presentation.delete(save=True)
    detail_empty = premise_to_detail_out(premise)
    assert detail_empty.presentation_url is None
