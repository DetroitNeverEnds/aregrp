"""
Модели для настроек сайта с паттерном Singleton.
Каждая модель может иметь только один экземпляр в базе данных.
"""
import uuid

from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.db import models


class SingletonModel(models.Model):
    """
    Абстрактная модель Singleton.
    Гарантирует, что в базе данных будет только один экземпляр модели.
    """
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        """
        Переопределяем save, чтобы гарантировать только один экземпляр.
        """
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """
        Запрещаем удаление единственного экземпляра.
        """
        pass

    @classmethod
    def load(cls):
        """
        Получить единственный экземпляр модели.
        Если его нет, создает новый.
        """
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def clean(self):
        """
        Валидация: проверяем, что не создается второй экземпляр.
        """
        if self.pk != 1 and self.__class__.objects.exists():
            raise ValidationError("Может существовать только один экземпляр этой модели.")


def main_settings_cases_pdf_upload_path(_instance, filename):
    """Путь загрузки PDF с кейсами (singleton — один файл, уникальное имя при замене)."""
    return f"site_settings/cases/{uuid.uuid4().hex}.pdf"


def investor_settings_pdf_upload_path(_instance, filename):
    """Путь загрузки PDF для раздела «Инвесторам»."""
    return f"site_settings/investors/{uuid.uuid4().hex}.pdf"


class MainSettings(SingletonModel):
    """
    Основные настройки сайта.
    Содержит информацию для header и footer.
    Singleton - только один экземпляр в базе данных.
    """
    # Контактная информация (для header и footer)
    phone = models.CharField(
        max_length=20,
        verbose_name="Номер телефона",
        help_text="Номер телефона для связи"
    )
    display_phone = models.CharField(
        max_length=50,
        verbose_name="Отображаемый номер телефона",
        help_text="Номер телефона для отображения на сайте",
        blank=True
    )
    email = models.EmailField(
        max_length=50,
        verbose_name="Почта",
        help_text="Email адрес для связи"
    )
    max_link = models.CharField(
        max_length=200,
        verbose_name="Ссылка на Макс",
        help_text="Ссылка на мессенджер Макс",
        blank=True,
    )
    telegram_link = models.CharField(
        max_length=200,
        verbose_name="Ссылка на Telegram",
        help_text="Ссылка на Telegram",
        blank=True
    )

    description = models.TextField(
        verbose_name="Описание",
        help_text="Описание организации"
    )
    org_name = models.TextField(
        verbose_name="Info name",
        help_text="Название организации",
        blank=True
    )
    inn = models.CharField(
        max_length=50,
        verbose_name="ИНН",
        help_text="ИНН для отображения",
        blank=True
    )
    cases_pdf = models.FileField(
        upload_to=main_settings_cases_pdf_upload_path,
        verbose_name="Кейсы (PDF)",
        help_text="PDF-файл с кейсами для раздела «Кейсы»",
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=["pdf"])],
    )

    class Meta:
        verbose_name = "Основные настройки"
        verbose_name_plural = "Основные настройки"
        db_table = 'main_settings'

    def __str__(self):
        return f"Основные настройки ({self.phone})"


class ContactsSettings(SingletonModel):
    """
    Настройки контактов сайта.
    Содержит только реквизиты: ОГРН, Юридический адрес.
    Контактная информация берется из MainSettings.
    Singleton - только один экземпляр в базе данных.
    """
    ogrn = models.CharField(
        max_length=20,
        verbose_name="ОГРН",
        help_text="Основной государственный регистрационный номер",
        blank=True
    )
    legal_address = models.CharField(
        max_length=500,
        verbose_name="Юридический адрес",
        help_text="Юридический адрес организации",
        blank=True
    )
    latitude = models.FloatField(
        null=True,
        blank=True,
        verbose_name="Широта",
        help_text="Широта (latitude) для карты"
    )
    longitude = models.FloatField(
        null=True,
        blank=True,
        verbose_name="Долгота",
        help_text="Долгота (longitude) для карты"
    )
    sales_center_address = models.CharField(
        max_length=500,
        verbose_name="Адрес офиса продаж",
        help_text="Адрес центра продаж",
        blank=True
    )

    class Meta:
        verbose_name = "Настройки контактов"
        verbose_name_plural = "Настройки контактов"
        db_table = 'contacts_settings'

    def __str__(self):
        return "Настройки контактов (реквизиты)"


class InvestorSettings(SingletonModel):
    """
    Документы для раздела «Инвесторам».
    Три PDF, загружаемые в админке; API отдаёт URL из storage.
    """

    document_1 = models.FileField(
        upload_to=investor_settings_pdf_upload_path,
        verbose_name="Документ 1 (PDF)",
        help_text="Первый PDF для страницы инвесторов",
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=["pdf"])],
    )
    document_2 = models.FileField(
        upload_to=investor_settings_pdf_upload_path,
        verbose_name="Документ 2 (PDF)",
        help_text="Второй PDF для страницы инвесторов",
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=["pdf"])],
    )
    document_3 = models.FileField(
        upload_to=investor_settings_pdf_upload_path,
        verbose_name="Документ 3 (PDF)",
        help_text="Третий PDF для страницы инвесторов",
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=["pdf"])],
    )

    class Meta:
        verbose_name = "Настройки для инвесторов"
        verbose_name_plural = "Настройки для инвесторов"
        db_table = "investor_settings"

    def __str__(self):
        return "Настройки для инвесторов (PDF)"
