from django.conf import settings
from django.db import models

from apps.payments.models import Payment
from apps.re_objects.models import Premise


class Booking(models.Model):
    """Бронь помещения пользователем (MVP: срок по умолчанию 3 суток задаётся при создании в сервисе)."""

    class DealType(models.TextChoices):
        RENT = "rent", "Аренда"
        SALE = "sale", "Продажа"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
        verbose_name="Пользователь",
    )
    premise = models.ForeignKey(
        Premise,
        on_delete=models.CASCADE,
        related_name="bookings",
        verbose_name="Помещение",
    )
    deal_type = models.CharField(
        max_length=10,
        choices=DealType.choices,
        verbose_name="Тип сделки",
    )
    expires_at = models.DateTimeField(verbose_name="Истекает")
    source_payment = models.ForeignKey(
        Payment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_bookings',
        verbose_name='Платёж, создавший бронь',
        help_text='Заполняется при автоматическом создании брони после успешной оплаты (продажа)',
    )
    referrer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='referred_bookings',
        verbose_name='Реферер',
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создано")

    class Meta:
        verbose_name = "Бронь"
        verbose_name_plural = "Брони"
        ordering = ["-created_at"]
        db_table = "bookings_booking"

    def __str__(self):
        return f"Booking {self.pk} user={self.user_id} premise={self.premise_id}"
