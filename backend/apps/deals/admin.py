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
        'contract_signed_on',
        'commission_amount',
        'created_at',
    )
    list_filter = ('deal_type',)
    search_fields = ('user__email', 'premise__title', 'premise__room_number', 'premise__building__name')
    autocomplete_fields = ('user', 'premise')
    raw_id_fields = ()
