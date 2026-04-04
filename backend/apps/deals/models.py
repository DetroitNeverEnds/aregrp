from django.conf import settings
from django.db import models

from apps.re_objects.models import Premise


class Deal(models.Model):
    """Сделка пользователя с помещением (аренда или продажа), не путать с бронью на просмотр."""

    class DealType(models.TextChoices):
        RENT = 'rent', 'Аренда'
        SALE = 'sale', 'Продажа'

    class ContractType(models.TextChoices):
        PDKP = 'pdkp', 'ПДКП'
        DKP = 'dkp', 'ДКП'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='deals',
        verbose_name='Пользователь',
    )
    premise = models.ForeignKey(
        Premise,
        on_delete=models.CASCADE,
        related_name='deals',
        verbose_name='Помещение',
    )
    deal_type = models.CharField(
        max_length=10,
        choices=DealType.choices,
        verbose_name='Тип сделки',
    )
    rent_expires_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Окончание срока аренды',
        help_text='Для сделок типа «аренда»',
    )
    contract_type = models.CharField(
        max_length=10,
        choices=ContractType.choices,
        null=True,
        blank=True,
        verbose_name='Тип договора',
        help_text='Для сделок типа «продажа» (ПДКП / ДКП)',
    )
    contract_expires_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Окончание договора (продажа)',
    )
    commission_amount = models.PositiveBigIntegerField(
        null=True,
        blank=True,
        verbose_name='Комиссия, ₽',
        help_text='Учитывается в ЛК для агентов',
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')

    class Meta:
        verbose_name = 'Сделка'
        verbose_name_plural = 'Сделки'
        ordering = ['-created_at']
        db_table = 'deals_deal'

    def __str__(self):
        return f'Deal {self.pk} user={self.user_id} premise={self.premise_id} {self.deal_type}'
