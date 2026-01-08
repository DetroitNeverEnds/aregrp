"""
Модели для обратной связи (feedback).
"""
from django.db import models
from django.core.validators import EmailValidator


class Feedback(models.Model):
    """
    Модель обратной связи от пользователей.
    """
    STATUS_CHOICES = [
        ('new', 'Новая'),
        ('in_progress', 'В обработке'),
        ('resolved', 'Решена'),
        ('closed', 'Закрыта'),
    ]

    name = models.CharField(
        max_length=200,
        verbose_name="Имя",
        help_text="Имя отправителя"
    )
    email = models.EmailField(
        max_length=100,
        verbose_name="Email",
        help_text="Email адрес для связи",
        validators=[EmailValidator()]
    )
    phone = models.CharField(
        max_length=20,
        verbose_name="Телефон",
        help_text="Номер телефона",
        blank=True
    )
    subject = models.CharField(
        max_length=200,
        verbose_name="Тема",
        help_text="Тема обращения"
    )
    message = models.TextField(
        verbose_name="Сообщение",
        help_text="Текст сообщения"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='new',
        verbose_name="Статус",
        help_text="Статус обработки обращения"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата создания"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Дата обновления"
    )

    class Meta:
        verbose_name = "Обратная связь"
        verbose_name_plural = "Обратная связь"
        ordering = ['-created_at']
        db_table = 'feedback'

    def __str__(self):
        return f"{self.subject} - {self.name} ({self.created_at.strftime('%d.%m.%Y %H:%M')})"

