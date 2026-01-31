"""
Модели для объектов недвижимости (здания, помещения).
"""
from django.db import models
from django.core.exceptions import ValidationError


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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Здание"
        verbose_name_plural = "Здания"
        ordering = ['name']
        db_table = 're_buildings'

    def __str__(self):
        return f"{self.name} ({self.city.name})"


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
    class Status(models.TextChoices):
        """Статусы доступности помещения."""
        AVAILABLE = 'available', 'Доступно'
        RESERVED = 'reserved', 'Зарезервировано'
        RENTED = 'rented', 'Сдано'
        UNAVAILABLE = 'unavailable', 'Недоступно'

    class PremiseType(models.TextChoices):
        """Типы помещений."""
        OFFICE = 'office', 'Офис'
        OTHER = 'other', 'Другое'

    # Основные параметры для поиска
    city = models.ForeignKey(
        City,
        on_delete=models.CASCADE,
        related_name='premises',
        verbose_name="Город",
        help_text="Город, в котором находится помещение (для быстрого поиска)"
    )
    
    # Связь с этажом (опционально, для детальной информации)
    floor = models.ForeignKey(
        Floor,
        on_delete=models.SET_NULL,
        related_name='premises',
        null=True,
        blank=True,
        verbose_name="Этаж",
        help_text="Этаж, на котором находится помещение"
    )
    
    # Параметры помещения (основные для поиска)
    area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Площадь, м²",
        help_text="Площадь помещения в квадратных метрах"
    )
    price_per_month = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Цена аренды в месяц, ₽",
        help_text="Стоимость аренды за месяц в рублях",
        null=True,
        blank=True
    )
    price_per_sqm = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Цена за м², ₽",
        help_text="Стоимость аренды за квадратный метр",
        null=True,
        blank=True
    )
    premise_type = models.CharField(
        max_length=50,
        choices=PremiseType.choices,
        default=PremiseType.OFFICE,
        verbose_name="Тип помещения",
        help_text="Тип помещения (офис, торговое и т.д.)"
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE,
        verbose_name="Статус",
        help_text="Статус доступности помещения"
    )
    
    # Описание и детали
    number = models.CharField(
        max_length=50,
        verbose_name="Номер помещения",
        help_text="Номер или название помещения",
        blank=True
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
        ordering = ['city', 'floor__building', 'floor', 'number']
        indexes = [
            models.Index(fields=['city', 'status']),  # Для быстрого поиска по городу и статусу
            models.Index(fields=['city', 'premise_type']),  # Для поиска по типу
            models.Index(fields=['area']),  # Для фильтрации по площади
            models.Index(fields=['price_per_month']),  # Для фильтрации по цене
        ]
        db_table = 're_premises'

    def __str__(self):
        building_info = f", {self.floor.building.name}" if self.floor else ""
        floor_info = f", этаж {self.floor.number}" if self.floor else ""
        return f"{self.number or 'Помещение'} ({self.city.name}{building_info}{floor_info})"

    @property
    def building(self):
        """Возвращает здание через этаж (для удобства доступа)."""
        return self.floor.building if self.floor else None

    def save(self, *args, **kwargs):
        # Автоматически вычисляем цену за м², если не указана
        if self.price_per_month and self.area and not self.price_per_sqm:
            self.price_per_sqm = self.price_per_month / self.area
        super().save(*args, **kwargs)
