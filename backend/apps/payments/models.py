from django.db import models

from apps.re_objects.models import Premise
from apps.referrals.models import ReferralLink


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        WAITING_FOR_CAPTURE = 'waiting_for_capture', 'Waiting for capture'
        SUCCEEDED = 'succeeded', 'Succeeded'
        CANCELED = 'canceled', 'Canceled'

    premise = models.ForeignKey(
        Premise,
        on_delete=models.SET_NULL,
        related_name='payments',
        null=True,
        blank=True,
    )
    referral_link = models.ForeignKey(
        ReferralLink,
        on_delete=models.SET_NULL,
        related_name='payments',
        null=True,
        blank=True,
    )
    provider_payment_id = models.CharField(max_length=128, unique=True)
    idempotence_key = models.UUIDField(unique=True)
    status = models.CharField(
        max_length=32,
        choices=Status.choices,
        default=Status.PENDING,
    )
    paid = models.BooleanField(default=False)
    amount_value = models.DecimalField(max_digits=12, decimal_places=2)
    amount_currency = models.CharField(max_length=3)
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'
        verbose_name = 'Платёж'
        verbose_name_plural = 'Платежи'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'{self.provider_payment_id} ({self.status})'
