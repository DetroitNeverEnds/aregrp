from django.db import models

from apps.re_objects.models import Premise


class Payment(models.Model):
    premise = models.ForeignKey(
        Premise,
        on_delete=models.SET_NULL,
        related_name='payments',
        null=True,
        blank=True,
    )
    provider_payment_id = models.CharField(max_length=128, unique=True)
    idempotence_key = models.UUIDField(unique=True)
    status = models.CharField(max_length=64)
    paid = models.BooleanField(default=False)
    amount_value = models.DecimalField(max_digits=12, decimal_places=2)
    amount_currency = models.CharField(max_length=3)
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'

    def __str__(self) -> str:
        return f'{self.provider_payment_id} ({self.status})'
