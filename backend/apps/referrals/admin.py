from django.contrib import admin

from .models import ReferralLink


@admin.register(ReferralLink)
class ReferralLinkAdmin(admin.ModelAdmin):
    list_display = ('code', 'referrer', 'premise', 'contact_phone', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('code', 'contact_phone', 'referrer__email', 'referrer__username')
    raw_id_fields = ('referrer', 'premise')

