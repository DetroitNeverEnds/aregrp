"""
Модели для настроек сайта с паттерном Singleton.
Каждая модель может иметь только один экземпляр в базе данных.
"""
from django.db import models
from django.core.exceptions import ValidationError


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
    whatsapp_link = models.CharField(
        max_length=200,
        verbose_name="Ссылка на WhatsApp",
        help_text="Ссылка на WhatsApp",
        blank=True
    )
    telegram_link = models.CharField(
        max_length=200,
        verbose_name="Ссылка на Telegram",
        help_text="Ссылка на Telegram",
        blank=True
    )
    
    # Информация для footer
    footer_description = models.TextField(
        verbose_name="Футер описание",
        help_text="Описание в подвале сайта",
        blank=True
    )
    footer_org_info = models.TextField(
        verbose_name="Футер орг инфо",
        help_text="Организационная информация в подвале сайта",
        blank=True
    )
    footer_inn = models.CharField(
        max_length=50,
        verbose_name="ИНН в футере",
        help_text="ИНН для отображения в подвале сайта",
        blank=True
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
    Singleton - только один экземпляр в базе данных.
    """
    phone = models.CharField(
        max_length=20,
        verbose_name="Телефон",
        help_text="Номер телефона для связи"
    )
    email = models.EmailField(
        max_length=50,
        verbose_name="Email",
        help_text="Email адрес для связи"
    )
    whats_app = models.CharField(
        max_length=100,
        verbose_name="WhatsApp",
        help_text="Ссылка или номер WhatsApp",
        blank=True
    )
    telegram = models.CharField(
        max_length=100,
        verbose_name="Telegram",
        help_text="Ссылка или username Telegram",
        blank=True
    )
    ruk_fio = models.CharField(
        max_length=300,
        verbose_name="ФИО руководителя",
        help_text="Полное имя руководителя"
    )
    inn = models.CharField(
        max_length=50,
        verbose_name="ИНН",
        help_text="Идентификационный номер налогоплательщика"
    )

    class Meta:
        verbose_name = "Настройки контактов"
        verbose_name_plural = "Настройки контактов"
        db_table = 'contacts_settings'

    def __str__(self):
        return f"Настройки контактов ({self.phone})"
