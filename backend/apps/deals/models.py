from django.conf import settings
from django.core.exceptions import ValidationError
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
    rent_expires_at = models.DateField(
        null=True,
        blank=True,
        verbose_name='Окончание срока аренды',
        help_text='Для сделок типа «аренда» (только дата)',
    )
    contract_type = models.CharField(
        max_length=10,
        choices=ContractType.choices,
        null=True,
        blank=True,
        verbose_name='Тип договора',
        help_text='Для сделок типа «продажа» (ПДКП / ДКП)',
    )
    contract_signed_on = models.DateField(
        null=True,
        blank=True,
        verbose_name='Дата заключения договора',
        help_text='Для сделок типа «продажа», только дата',
    )
    commission_amount = models.PositiveBigIntegerField(
        verbose_name='Комиссия, ₽',
        help_text='Обязательно. В ЛК отображается только для агентов.',
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')

    class Meta:
        verbose_name = 'Сделка'
        verbose_name_plural = 'Сделки'
        ordering = ['-created_at']
        db_table = 'deals_deal'

    def clean(self):
        super().clean()
        errors = {}
        if self.commission_amount is None:
            errors['commission_amount'] = 'Укажите комиссию.'
        if self.deal_type == self.DealType.RENT and not self.rent_expires_at:
            errors['rent_expires_at'] = 'Для аренды укажите дату окончания срока.'
        if self.deal_type == self.DealType.SALE and not self.contract_type:
            errors['contract_type'] = 'Для продажи укажите тип договора.'
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Deal {self.pk} user={self.user_id} premise={self.premise_id} {self.deal_type}'
