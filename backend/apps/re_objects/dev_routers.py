"""
Тестовые эндпоинты для загрузки данных (здания, помещения, медиа).

Использование:
1) POST /api/v1/dev/buildings — создание здания + базовый этаж + загрузка фото/видео
2) POST /api/v1/dev/premises/{building_uuid} — создание помещения в здании + загрузка фото
"""
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from django.db import transaction
from ninja import File, Form, Router, UploadedFile

from .models import (
    Building,
    BuildingImage,
    BuildingVideo,
    City,
    Floor,
    Premise,
    PremiseImage,
)

dev_router = Router(tags=["Dev / Test"])

# Расширения для определения типа файла
IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif"}
VIDEO_EXTENSIONS = {"mp4", "mov", "avi", "webm"}


def _split_files_by_type(files: List[UploadedFile]) -> tuple[List[UploadedFile], List[UploadedFile]]:
    """Разделяет файлы на изображения и видео по расширению."""
    images = []
    videos = []
    for f in files or []:
        if not f or not f.name:
            continue
        ext = f.name.rsplit(".", 1)[-1].lower() if "." in f.name else ""
        if ext in IMAGE_EXTENSIONS:
            images.append(f)
        elif ext in VIDEO_EXTENSIONS:
            videos.append(f)
    return images, videos


@dev_router.post(
    "/dev/buildings",
    summary="Создание здания с этажом и медиа",
    description=(
        "Создаёт здание, сразу добавляет базовый этаж (номер 1). "
        "Загружает фото и видео. Файлы: multipart/form-data. "
        "Варианты: images + videos отдельно, или files — все файлы (разделяются по расширению)."
    ),
)
def create_building_with_floor(
    request,
    name: str = Form(..., description="Название здания"),
    address: str = Form(..., description="Адрес"),
    city_id: Optional[int] = Form(None, description="ID города (если не указан — город по умолчанию)"),
    description: str = Form("", description="Описание здания"),
    total_floors: Optional[int] = Form(None, description="Количество этажей"),
    year_built: Optional[int] = Form(None, description="Год постройки"),
    images: Optional[List[UploadedFile]] = File(None, description="Фото здания (jpg, png, webp, gif)"),
    videos: Optional[List[UploadedFile]] = File(None, description="Видео здания (mp4, mov, avi, webm)"),
    files: Optional[List[UploadedFile]] = File(None, description="Все медиа (фото+видео) — разделяются по расширению"),
):
    """Создаёт здание, этаж 1 и привязывает медиафайлы."""
    city = None
    if city_id:
        try:
            city = City.objects.get(pk=city_id)
        except City.DoesNotExist:
            return 400, {"detail": f"Город с id={city_id} не найден"}
    else:
        city = City.objects.filter(is_default=True).first()
        if not city:
            city = City.objects.first()
        if not city:
            return 400, {"detail": "Нет городов в БД. Создайте город или укажите city_id."}

    all_files = list(images or []) + list(videos or []) + list(files or [])
    img_files, vid_files = _split_files_by_type(all_files)
    if not img_files and images:
        img_files = list(images)
    if not vid_files and videos:
        vid_files = list(videos)

    with transaction.atomic():
        building = Building.objects.create(
            name=name,
            address=address,
            city=city,
            description=description or "",
            total_floors=total_floors,
            year_built=year_built,
        )
        Floor.objects.create(building=building, number=1, description="Этаж 1")

        for i, f in enumerate(img_files, start=1):
            BuildingImage.objects.create(
                building=building,
                file=f,
                order=i,
                is_primary=(i == 1),
            )
        for i, f in enumerate(vid_files, start=1):
            BuildingVideo.objects.create(
                building=building,
                file=f,
                order=i,
            )

    return 200, {
        "uuid": str(building.uuid),
        "name": building.name,
        "address": building.address,
        "city_id": building.city_id,
        "floor_created": 1,
        "images_count": len(img_files),
        "videos_count": len(vid_files),
    }


@dev_router.post(
    "/dev/premises/{building_uuid}",
    summary="Создание помещения в здании с фото",
    description=(
        "Создаёт помещение в здании по UUID. "
        "Этаж берётся по floor_number (по умолчанию 1). "
        "Файлы: multipart/form-data, поле images или files — множественная загрузка фото."
    ),
)
def create_premise_in_building(
    request,
    building_uuid: UUID,
    area: Decimal = Form(..., description="Площадь, м²"),
    price_per_month: Decimal = Form(..., description="Цена аренды в месяц, ₽"),
    number: str = Form("", description="Номер помещения"),
    description: str = Form("", description="Описание"),
    floor_number: int = Form(1, description="Номер этажа (должен существовать в здании)"),
    available_for_rent: bool = Form(True, description="Доступно для аренды"),
    available_for_sale: bool = Form(False, description="Доступно для продажи"),
    images: Optional[List[UploadedFile]] = File(None, description="Фото помещения"),
    files: Optional[List[UploadedFile]] = File(None, description="Фото помещения (альтернатива images)"),
):
    """Создаёт помещение в здании и привязывает фото."""
    try:
        building = Building.objects.get(uuid=building_uuid)
    except Building.DoesNotExist:
        return 404, {"detail": f"Здание с uuid={building_uuid} не найдено"}

    floor = Floor.objects.filter(building=building, number=floor_number).first()
    if not floor:
        return 400, {
            "detail": f"Этаж {floor_number} не найден в здании. Создайте этаж или укажите существующий номер."
        }

    city = building.city

    all_imgs = list(images or []) + list(files or [])
    img_files, _ = _split_files_by_type(all_imgs)
    if not img_files and all_imgs:
        img_files = all_imgs

    with transaction.atomic():
        premise = Premise.objects.create(
            building=building,
            city=city,
            floor=floor,
            area=area,
            price_per_month=price_per_month,
            number=number or "",
            description=description or "",
            available_for_rent=available_for_rent,
            available_for_sale=available_for_sale,
        )
        for i, f in enumerate(img_files, start=1):
            PremiseImage.objects.create(
                premise=premise,
                file=f,
                order=i,
                is_primary=(i == 1),
            )

    return 200, {
        "uuid": str(premise.uuid),
        "number": premise.number,
        "building_uuid": str(building.uuid),
        "floor": floor_number,
        "area": float(premise.area),
        "price_per_month": float(premise.price_per_month),
        "images_count": len(img_files),
    }
