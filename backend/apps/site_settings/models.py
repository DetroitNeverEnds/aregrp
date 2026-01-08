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


class SiteSettings(SingletonModel):
    """
    Основные настройки сайта (контакты, реквизиты).
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
        verbose_name = "Настройки сайта"
        verbose_name_plural = "Настройки сайта"
        db_table = 'site_settings'

    def __str__(self):
        return f"Настройки сайта ({self.phone})"


# Пример: Singleton модель для главной страницы
# class HomePageSettings(SingletonModel):
#     """
#     Настройки главной страницы.
#     Singleton - только один экземпляр в базе данных.
#     """
#     title = models.CharField(max_length=200, verbose_name="Заголовок")
#     description = models.TextField(verbose_name="Описание")
#     hero_image = models.ImageField(upload_to='home/', verbose_name="Главное изображение", blank=True)
#     
#     class Meta:
#         verbose_name = "Настройки главной страницы"
#         verbose_name_plural = "Настройки главной страницы"
#     
#     def __str__(self):
#         return "Настройки главной страницы"
