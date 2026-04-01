"""
Модели для обратной связи (feedback).
"""
from django.core.validators import EmailValidator
from django.db import models


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
        help_text="Email (не используется в заявке с сайта, зарезервировано)",
        validators=[EmailValidator()],
        blank=True,
        default='',
    )
    phone = models.CharField(
        max_length=20,
        verbose_name="Телефон",
        help_text="Номер телефона",
        blank=True,
    )
    subject = models.CharField(
        max_length=255,
        verbose_name="Тема",
        help_text="Источник заявки: страница, кампания, UTM и т.п.",
        blank=True,
        default='',
    )
    message = models.TextField(
        verbose_name="Сообщение",
        help_text="Текст сообщения (необязательно)",
        blank=True,
        default='',
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
        head = self.subject or self.phone or self.name
        return f"{head} — {self.name} ({self.created_at.strftime('%d.%m.%Y %H:%M')})"
