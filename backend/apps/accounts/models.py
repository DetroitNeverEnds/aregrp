from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Расширенная модель пользователя с поддержкой физических лиц и агентов.
    """
    USER_TYPE_CHOICES = [
        ('individual', 'Физическое лицо'),
        ('agent', 'Агент'),
    ]

    id = models.AutoField(primary_key=True)  # Обычный int ID для пользователя
    
    # Email должен быть уникальным (переопределяем из AbstractUser для явности)
    email = models.EmailField(
        verbose_name="Email",
        unique=True,
        help_text="Email адрес (уникальный, используется для входа)"
    )
    
    # Тип пользователя
    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPE_CHOICES,
        default='individual',
        verbose_name="Тип пользователя",
        help_text="Физическое лицо или агент"
    )
    
    # Общие поля
    full_name = models.CharField(
        max_length=200,
        verbose_name="Полное имя",
        help_text="Имя пользователя",
        blank=True
    )
    phone = models.CharField(
        max_length=20,
        verbose_name="Номер телефона",
        help_text="Контактный телефон",
        blank=True,
        unique=True,
        null=True
    )
    
    # Поля для агентов
    organization_name = models.CharField(
        max_length=300,
        verbose_name="Название организации",
        help_text="Название организации агента",
        blank=True
    )
    inn = models.CharField(
        max_length=50,
        verbose_name="ИНН",
        help_text="Идентификационный номер налогоплательщика",
        blank=True
    )

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

    def __str__(self):
        if self.user_type == 'agent' and self.organization_name:
            return f"{self.organization_name} ({self.email})"
        return f"{self.full_name or self.username} ({self.email})"