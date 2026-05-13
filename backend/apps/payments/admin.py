from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        'provider_payment_id',
        'premise',
        'status',
        'paid',
        'amount_value',
        'amount_currency',
        'created_at',
    )
    list_filter = ('paid', 'status', 'amount_currency')
    search_fields = ('provider_payment_id', 'description')
    raw_id_fields = ('premise',)
    readonly_fields = ('created_at', 'updated_at')
