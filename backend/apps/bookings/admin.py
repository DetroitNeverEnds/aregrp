from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("user", "premise", "deal_type", "expires_at", "created_at")
    list_filter = ("deal_type",)
    raw_id_fields = ("user", "premise")
