from django.contrib import admin

from .models import Deal


@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'premise',
        'deal_type',
        'rent_expires_at',
        'contract_type',
        'contract_expires_at',
        'commission_amount',
        'created_at',
    )
    list_filter = ('deal_type',)
    search_fields = ('user__email', 'premise__number', 'premise__building__name')
    autocomplete_fields = ('user', 'premise')
    raw_id_fields = ()
