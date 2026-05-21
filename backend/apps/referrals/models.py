import uuid

from django.conf import settings
from django.db import models

from apps.re_objects.models import Premise


class ReferralLink(models.Model):
    code = models.UUIDField(default=uuid.uuid4, unique=True, db_index=True, editable=False, verbose_name='Код ссылки')
    referrer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='referral_links',
        verbose_name='Реферер',
    )
    premise = models.ForeignKey(
        Premise,
        on_delete=models.CASCADE,
        related_name='referral_links',
        verbose_name='Помещение',
    )
    contact_phone = models.CharField(max_length=32, verbose_name='Контактный телефон')
    is_active = models.BooleanField(default=True, verbose_name='Активна')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создана')

    class Meta:
        verbose_name = 'Реферальная ссылка'
        verbose_name_plural = 'Реферальные ссылки'
        ordering = ['-created_at']
        db_table = 'referrals_referral_link'

    def __str__(self) -> str:
        return f'{self.code} ({self.referrer_id} -> {self.premise_id})'

