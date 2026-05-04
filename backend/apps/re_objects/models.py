"""
Модели для объектов недвижимости (здания, помещения).
"""
import uuid
from decimal import Decimal, ROUND_HALF_UP

from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator, MaxValueValidator, MinValueValidator


class Region(models.Model):
    """
    Регион (область, республика).
    По умолчанию создается Татарстан.
    """
    name = models.CharField(
        max_length=200,
        verbose_name="Название региона",
        unique=True,
        help_text="Название региона (например, Татарстан)"
    )
    code = models.CharField(
        max_length=20,
        verbose_name="Код региона",
        unique=True,
        blank=True,
        null=True,
        help_text="Код региона (опционально)"
    )
    is_default = models.BooleanField(
        default=False,
        verbose_name="Регион по умолчанию",
        help_text="Использовать как регион по умолчанию"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Регион"
        verbose_name_plural = "Регионы"
        ordering = ['name']
        db_table = 're_regions'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Если это регион по умолчанию, снимаем флаг с других
        if self.is_default:
            Region.objects.filter(is_default=True).update(is_default=False)
        super().save(*args, **kwargs)


class City(models.Model):
    """
    Город.
    По умолчанию создается Казань в регионе Татарстан.
    """
    name = models.CharField(
        max_length=200,
        verbose_name="Название города",
        help_text="Название города (например, Казань)"
    )
    region = models.ForeignKey(
        Region,
        on_delete=models.CASCADE,
        related_name='cities',
        verbose_name="Регион",
        help_text="Регион, к которому относится город"
    )
    is_default = models.BooleanField(
        default=False,
        verbose_name="Город по умолчанию",
        help_text="Использовать как город по умолчанию"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Город"
        verbose_name_plural = "Города"
        ordering = ['name']
        unique_together = [['name', 'region']]
        db_table = 're_cities'

    def __str__(self):
        return f"{self.name} ({self.region.name})"

    def save(self, *args, **kwargs):
        # Если это город по умолчанию, снимаем флаг с других в том же регионе
        if self.is_default:
            City.objects.filter(region=self.region, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)


class Building(models.Model):
    """
    Здание.
    Связано с городом. Содержит этажи с помещениями.
    """
    uuid = models.UUIDField(
        verbose_name="UUID",
        help_text="Публичный идентификатор здания для API",
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )
    name = models.CharField(
        max_length=300,
        verbose_name="Название здания",
        help_text="Название или адрес здания"
    )
    address = models.CharField(
        max_length=500,
        verbose_name="Адрес",
        help_text="Полный адрес здания"
    )
    city = models.ForeignKey(
        City,
        on_delete=models.CASCADE,
        related_name='buildings',
        verbose_name="Город",
        help_text="Город, в котором находится здание"
    )
    description = models.TextField(
        verbose_name="Описание",
        blank=True,
        help_text="Описание здания, особенности"
    )
    # Дополнительные поля для здания (опционально)
    total_floors = models.PositiveIntegerField(
        verbose_name="Количество этажей",
        null=True,
        blank=True,
        help_text="Общее количество этажей в здании"
    )
    year_built = models.PositiveIntegerField(
        verbose_name="Год постройки",
        null=True,
        blank=True,
        help_text="Год постройки здания"
    )
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        verbose_name="Широта",
        help_text="Географическая широта (WGS-84), от −90 до 90",
        validators=[MinValueValidator(Decimal("-90")), MaxValueValidator(Decimal("90"))],
    )
    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=6,
        null=True,
        blank=True,
        verbose_name="Долгота",
        help_text="Географическая долгота (WGS-84), от −180 до 180",
        validators=[MinValueValidator(Decimal("-180")), MaxValueValidator(Decimal("180"))],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Здание"
        verbose_name_plural = "Здания"
        ordering = ['name']
        db_table = 're_buildings'

    def __str__(self):
        return f"{self.name} ({self.city.name})"


def floor_schema_svg_upload_path(instance, filename):
    """Генерирует путь для SVG-схемы этажа."""
    safe_name = filename or "schema.svg"
    return f"floors/{instance.building_id}/floor_{instance.number}/{safe_name}"


class Floor(models.Model):
    """
    Этаж в здании.
    """
    building = models.ForeignKey(
        Building,
        on_delete=models.CASCADE,
        related_name='floors',
        verbose_name="Здание",
        help_text="Здание, к которому относится этаж"
    )
    number = models.IntegerField(
        verbose_name="Номер этажа",
        help_text="Номер этажа (может быть отрицательным для подвалов)"
    )
    description = models.CharField(
        max_length=500,
        verbose_name="Описание",
        blank=True,
        help_text="Описание этажа (например, 'Офисный этаж')"
    )
    schema_svg = models.FileField(
        upload_to=floor_schema_svg_upload_path,
        verbose_name="SVG-схема этажа",
        help_text="Файл схемы этажа в формате SVG",
        blank=True,
        null=True,
        validators=[
            FileExtensionValidator(allowed_extensions=["svg"]),
        ],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Этаж"
        verbose_name_plural = "Этажи"
        ordering = ['building', 'number']
        unique_together = [['building', 'number']]
        db_table = 're_floors'

    def __str__(self):
        return f"{self.building.name}, этаж {self.number}"


class Premise(models.Model):
    """
    Помещение (основная единица для поиска и аренды).
    
    Основные параметры для поиска хранятся здесь:
    - Город (денормализовано для быстрого поиска)
    - Площадь
    - Цена аренды
    - Тип помещения
    и т.д.
    """
    class PremiseType(models.TextChoices):
        """Типы помещений."""
        OFFICE = 'office', 'Офис'
        OTHER = 'other', 'Другое'

    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
        verbose_name="UUID",
        help_text="Публичный идентификатор помещения для API и URL",
    )
    # Основные параметры для поиска
    city = models.ForeignKey(
        City,
        on_delete=models.CASCADE,
        related_name='premises',
        verbose_name="Город",
        help_text="Город, в котором находится помещение (для быстрого поиска). Если не указан, будет использован город по умолчанию.",
        null=True,
        blank=True
    )
    # Здание, в котором находится помещение (обязательное поле)
    building = models.ForeignKey(
        Building,
        on_delete=models.CASCADE,
        related_name='premises',
        verbose_name="Здание",
        help_text="Здание, в котором находится помещение"
    )
    # Этаж внутри здания (опционально; в админке список этажей ограничивается выбранным зданием через autocomplete)
    floor = models.ForeignKey(
        Floor,
        on_delete=models.SET_NULL,
        related_name='premises',
        null=True,
        blank=True,
        verbose_name="Этаж",
        help_text="Этаж, на котором находится помещение (должен относиться к выбранному зданию)",
    )
    
    # Параметры помещения (основные для поиска)
    area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Площадь, м²",
        help_text="Площадь помещения в квадратных метрах"
    )
    price_per_month = models.PositiveBigIntegerField(
        null=True,
        blank=True,
        verbose_name="Цена аренды в месяц, ₽",
        help_text="Стоимость аренды за месяц в целых рублях (необязательно)",
    )
    price_per_sqm = models.PositiveBigIntegerField(
        null=True,
        blank=True,
        verbose_name="Цена продажи за м², ₽",
        help_text="Стоимость продажи за м² в целых рублях. Обязательна, если помещение доступно для продажи.",
    )
    full_sell_price = models.PositiveBigIntegerField(
        null=True,
        blank=True,
        verbose_name="Итоговая стоимость продажи, ₽",
        help_text="Площадь × цена продажи за м² в целых рублях. Пересчитывается при каждом сохранении.",
    )
    premise_type = models.CharField(
        max_length=50,
        choices=PremiseType.choices,
        default=PremiseType.OFFICE,
        verbose_name="Тип помещения",
        help_text="Тип помещения (офис, торговое и т.д.)"
    )
    available_for_rent = models.BooleanField(
        default=True,
        verbose_name="Доступно для аренды",
        help_text="Помещение предлагается в аренду"
    )
    available_for_sale = models.BooleanField(
        default=False,
        verbose_name="Доступно для продажи",
        help_text="Помещение предлагается к продаже"
    )

    # Описание и детали
    room_number = models.CharField(
        max_length=50,
        verbose_name="Номер помещения",
        help_text="Номер помещения (для схемы этажа и идентификации)",
        blank=True,
    )
    title = models.CharField(
        max_length=50,
        verbose_name="Название помещения",
        help_text="Понятное название помещения (по желанию)",
        blank=True,
    )
    description = models.TextField(
        verbose_name="Описание",
        blank=True,
        help_text="Подробное описание помещения"
    )
    
    # Дополнительные параметры (для расширенного поиска)
    ceiling_height = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name="Высота потолков, м",
        null=True,
        blank=True,
        help_text="Высота потолков в метрах"
    )
    has_windows = models.BooleanField(
        default=True,
        verbose_name="Есть окна",
        help_text="Наличие окон в помещении"
    )
    has_parking = models.BooleanField(
        default=False,
        verbose_name="Есть парковка",
        help_text="Наличие парковки"
    )
    is_furnished = models.BooleanField(
        default=False,
        verbose_name="С мебелью",
        help_text="Помещение с мебелью"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Помещение"
        verbose_name_plural = "Помещения"
        ordering = ['city', 'building', 'floor', 'room_number', 'title']
        indexes = [
            models.Index(fields=['city', 'premise_type']),
            models.Index(fields=['building']),
            models.Index(fields=['area']),
            models.Index(fields=['price_per_month']),
        ]
        db_table = 're_premises'

    def __str__(self):
        building_info = f", {self.building.name}" if self.building else (f", {self.floor.building.name}" if self.floor else "")
        floor_info = f", этаж {self.floor.number}" if self.floor else ""
        city_name = self.city.name if self.city else "—"
        return f"{self.room_number or self.title or 'Помещение'} ({city_name}{building_info}{floor_info})"

    def clean(self):
        super().clean()
        errors = {}
        if self.available_for_sale:
            if self.price_per_sqm is None or self.price_per_sqm <= 0:
                errors['price_per_sqm'] = 'Укажите цену продажи за м² больше 0.'
        if self.available_for_rent:
            if self.price_per_month is None or self.price_per_month <= 0:
                errors['price_per_month'] = 'Укажите цену аренды за месяц больше 0.'
        if errors:
            raise ValidationError(errors)

    def _compute_full_sell_price(self) -> int | None:
        """Полная стоимость продажи: площадь × цена за м², округление до целых рубля. Иначе None."""
        if not self.available_for_sale:
            return None
        if self.price_per_sqm is not None and self.area is not None:
            raw = self.area * Decimal(self.price_per_sqm)
            return int(raw.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        return None

    def save(self, *args, **kwargs):
        self.full_sell_price = self._compute_full_sell_price()
        # Синхронизация здания и этажа: при выборе этажа подставляем здание; при смене здания обнуляем этаж, если он из другого здания
        if self.floor_id:
            if not self.building_id:
                self.building_id = Floor.objects.filter(pk=self.floor_id).values_list('building_id', flat=True).first()
            elif Floor.objects.filter(pk=self.floor_id, building_id=self.building_id).exists() is False:
                self.floor_id = None
        # Город из здания, если не указан
        if self.building_id and not self.city_id:
            self.city_id = Building.objects.filter(pk=self.building_id).values_list('city_id', flat=True).first()
        # Если город всё ещё не указан, используем город по умолчанию
        if not self.city_id:
            try:
                default_city = City.objects.filter(is_default=True).first()
                if default_city:
                    self.city = default_city
                else:
                    # Если нет города по умолчанию, берем первый город
                    first_city = City.objects.first()
                    if first_city:
                        self.city = first_city
            except City.DoesNotExist:
                pass

        self.full_clean()
        super().save(*args, **kwargs)


# Функции для генерации путей загрузки медиафайлов
def _media_slot_subdir(instance) -> str:
    """Подпапка для original/card/detail одной записи (до первого save — временный токен)."""
    if instance.pk:
        return str(instance.pk)
    key = '_media_slot_subdir_token'
    token = getattr(instance, key, None)
    if not token:
        token = uuid.uuid4().hex[:16]
        setattr(instance, key, token)
    return token


def premise_image_upload_path(instance, filename):
    """Генерирует путь для файлов изображения помещения (original / card / detail)."""
    return f'premises/{instance.premise_id}/images/{_media_slot_subdir(instance)}/{filename}'


def building_image_upload_path(instance, filename):
    """Генерирует путь для файлов изображения здания (original / card / detail)."""
    return f'buildings/{instance.building_id}/images/{_media_slot_subdir(instance)}/{filename}'


def building_video_upload_path(instance, filename):
    """Оригинальное видео в слоте вместе с card.webp."""
    return f'buildings/{instance.building_id}/videos/{_media_slot_subdir(instance)}/{filename}'


def building_video_card_upload_path(instance, filename):
    """Превью видео в том же слоте, что и файл ролика."""
    return f'buildings/{instance.building_id}/videos/{_media_slot_subdir(instance)}/{filename}'


class MediaFilesMixin(models.Model):
    """
    Миксин с общими полями для медиафайлов.

    PremiseImage / BuildingImage: original, card, detail.
    BuildingVideo: file (оригинал ролика), card.
    """
    title = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Название",
        help_text="Название медиафайла"
    )
    order = models.PositiveIntegerField(
        default=1,
        verbose_name="Порядок",
        help_text="Порядок отображения (1 - первый)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class PremiseImage(MediaFilesMixin, models.Model):
    """
    Изображение помещения: оригинал загрузки + производные card/detail (WebP).
    """
    premise = models.ForeignKey(
        Premise,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name="Помещение",
        help_text="Помещение, к которому относится изображение"
    )
    original = models.ImageField(
        upload_to=premise_image_upload_path,
        verbose_name="Оригинал",
        help_text="Исходный файл (jpg/png/webp/gif); card и detail генерируются автоматически",
        storage=None,
        validators=[
            FileExtensionValidator(
                allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'gif']
            )
        ],
    )
    card = models.ImageField(
        upload_to=premise_image_upload_path,
        verbose_name="Превью карточки",
        help_text="WebP, вписано в 560×300 без обрезки (пропорции сохраняются)",
        storage=None,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['webp'])],
    )
    detail = models.ImageField(
        upload_to=premise_image_upload_path,
        verbose_name="Детальное изображение",
        help_text="WebP до Full HD, генерируется из оригинала",
        storage=None,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['webp'])],
    )
    is_primary = models.BooleanField(
        default=False,
        verbose_name="Основное изображение",
        help_text="Использовать как основное изображение помещения"
    )

    class Meta:
        verbose_name = "Изображение помещения"
        verbose_name_plural = "Изображения помещений"
        ordering = ['premise', '-is_primary', 'order', 'created_at']
        indexes = [
            models.Index(fields=['premise', 'is_primary']),
        ]
        db_table = 're_premise_images'

    def __str__(self):
        return f"Изображение для {self.premise} ({self.order})"

    def _derivatives_stale(self) -> bool:
        if not self.original:
            return False
        if not self.card or not self.detail:
            return True
        if not self.pk:
            return True
        old = PremiseImage.objects.only('original').get(pk=self.pk)
        if not old.original:
            return True
        return old.original.name != self.original.name

    def _maybe_build_image_derivatives(self) -> None:
        if not self.original or not self._derivatives_stale():
            return
        if hasattr(self.original, 'read'):
            self.original.seek(0)
            raw = self.original.read()
            self.original.seek(0)
        else:
            with self.original.open('rb') as src:
                raw = src.read()
        from .services.media_processing import process_raster_bytes

        try:
            card_cf, detail_cf = process_raster_bytes(raw)
        except Exception as exc:
            raise ValidationError(
                {'original': f'Не удалось обработать изображение: {exc}'}
            ) from exc
        if self.pk:
            if self.card:
                self.card.delete(save=False)
            if self.detail:
                self.detail.delete(save=False)
        self.card = card_cf
        self.detail = detail_cf

    def clean(self):
        """Валидация на уровне модели."""
        if not self.premise_id:
            return

        if self.is_primary:
            PremiseImage.objects.filter(
                premise=self.premise,
                is_primary=True
            ).exclude(pk=self.pk if self.pk else None).update(is_primary=False)

    def save(self, *args, **kwargs):
        update_fields = kwargs.get('update_fields')
        skip_derivatives = (
            update_fields is not None
            and 'original' not in update_fields
            and self.card
            and self.detail
        )
        if not skip_derivatives:
            self._maybe_build_image_derivatives()
        self.full_clean()
        super().save(*args, **kwargs)


class BuildingImage(MediaFilesMixin, models.Model):
    """
    Изображение здания: оригинал + card/detail (WebP).
    """
    building = models.ForeignKey(
        Building,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name="Здание",
        help_text="Здание, к которому относится изображение"
    )
    original = models.ImageField(
        upload_to=building_image_upload_path,
        verbose_name="Оригинал",
        help_text="Исходный файл; card и detail генерируются автоматически",
        storage=None,
        validators=[
            FileExtensionValidator(
                allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'gif']
            )
        ],
    )
    card = models.ImageField(
        upload_to=building_image_upload_path,
        verbose_name="Превью карточки",
        help_text="WebP, вписано в 560×300 без обрезки",
        storage=None,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['webp'])],
    )
    detail = models.ImageField(
        upload_to=building_image_upload_path,
        verbose_name="Детальное изображение",
        help_text="WebP до Full HD",
        storage=None,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['webp'])],
    )
    category = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Категория",
        help_text="Категория изображения (например, 'фасад', 'интерьер', 'планировка')"
    )
    is_primary = models.BooleanField(
        default=False,
        verbose_name="Основное изображение",
        help_text="Использовать как основное изображение здания"
    )

    class Meta:
        verbose_name = "Изображение здания"
        verbose_name_plural = "Изображения зданий"
        ordering = ['building', '-is_primary', 'order', 'created_at']
        indexes = [
            models.Index(fields=['building', 'is_primary']),
            models.Index(fields=['building', 'category']),
        ]
        db_table = 're_building_images'

    def __str__(self):
        return f"Изображение для {self.building} ({self.order})"

    def _derivatives_stale(self) -> bool:
        if not self.original:
            return False
        if not self.card or not self.detail:
            return True
        if not self.pk:
            return True
        old = BuildingImage.objects.only('original').get(pk=self.pk)
        if not old.original:
            return True
        return old.original.name != self.original.name

    def _maybe_build_image_derivatives(self) -> None:
        if not self.original or not self._derivatives_stale():
            return
        if hasattr(self.original, 'read'):
            self.original.seek(0)
            raw = self.original.read()
            self.original.seek(0)
        else:
            with self.original.open('rb') as src:
                raw = src.read()
        from .services.media_processing import process_raster_bytes

        try:
            card_cf, detail_cf = process_raster_bytes(raw)
        except Exception as exc:
            raise ValidationError(
                {'original': f'Не удалось обработать изображение: {exc}'}
            ) from exc
        if self.pk:
            if self.card:
                self.card.delete(save=False)
            if self.detail:
                self.detail.delete(save=False)
        self.card = card_cf
        self.detail = detail_cf

    def clean(self):
        """Валидация на уровне модели."""
        if not self.building_id:
            return

        if self.is_primary:
            BuildingImage.objects.filter(
                building=self.building,
                is_primary=True
            ).exclude(pk=self.pk if self.pk else None).update(is_primary=False)

    def save(self, *args, **kwargs):
        update_fields = kwargs.get('update_fields')
        skip_derivatives = (
            update_fields is not None
            and 'original' not in update_fields
            and self.card
            and self.detail
        )
        if not skip_derivatives:
            self._maybe_build_image_derivatives()
        self.full_clean()
        super().save(*args, **kwargs)


class BuildingVideo(MediaFilesMixin, models.Model):
    """
    Видео здания: оригинал ролика + card.webp (первый кадр).
    """
    building = models.ForeignKey(
        Building,
        on_delete=models.CASCADE,
        related_name='videos',
        verbose_name="Здание",
        help_text="Здание, к которому относится видео"
    )
    file = models.FileField(
        upload_to=building_video_upload_path,
        verbose_name="Видео",
        help_text="Оригинальный видеофайл",
        storage=None,
        validators=[
            FileExtensionValidator(
                allowed_extensions=['mp4', 'mov', 'avi', 'webm']
            )
        ],
    )
    card = models.ImageField(
        upload_to=building_video_card_upload_path,
        verbose_name="Превью карточки",
        help_text="WebP с первого кадра (ffmpeg), вписано в 560×300 без обрезки",
        storage=None,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['webp'])],
    )
    category = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Категория",
        help_text="Категория видео (например, 'тур', 'обзор', 'презентация')"
    )

    class Meta:
        verbose_name = "Видео здания"
        verbose_name_plural = "Видео зданий"
        ordering = ['building', 'order', 'created_at']
        indexes = [
            models.Index(fields=['building', 'category']),
        ]
        db_table = 're_building_videos'

    def __str__(self):
        return f"Видео для {self.building} ({self.order})"

    def clean(self):
        """Валидация на уровне модели."""
        if not self.building_id:
            return

    def _needs_video_card(self, prev_file_name: str | None) -> bool:
        if not self.file:
            return False
        if not self.card:
            return True
        if prev_file_name is None:
            return True
        return prev_file_name != self.file.name

    def save(self, *args, **kwargs):
        uf = kwargs.get('update_fields')
        if uf is not None and set(uf) == {'card'}:
            return super().save(*args, **kwargs)

        update_fields = kwargs.get('update_fields')
        skip_card = (
            update_fields is not None
            and 'file' not in update_fields
            and self.card
        )

        prev_file_name = None
        if self.pk:
            prev_file_name = (
                BuildingVideo.objects.filter(pk=self.pk).values_list('file', flat=True).first()
            )

        self.full_clean()
        super().save(*args, **kwargs)

        if skip_card:
            return

        if not self._needs_video_card(prev_file_name):
            return

        from .services.media_processing import FFmpegNotFoundError, video_file_to_card_webp

        try:
            card_cf = video_file_to_card_webp(self.file)
        except FFmpegNotFoundError as exc:
            raise ValidationError(
                {'file': 'Для загрузки видео нужен ffmpeg в PATH сервера.'}
            ) from exc
        except Exception as exc:
            raise ValidationError(
                {'file': f'Не удалось сделать превью видео: {exc}'}
            ) from exc

        if self.card:
            self.card.delete(save=False)
        self.card = card_cf
        super().save(update_fields=['card'])
