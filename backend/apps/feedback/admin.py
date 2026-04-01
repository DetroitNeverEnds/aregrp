"""
Админка для моделей обратной связи.
"""
from django.contrib import admin

from .models import Feedback


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    """
    Админка для обратной связи.
    """
    list_display = ('subject', 'name', 'phone', 'email', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Заявка', {
            'fields': ('subject', 'name', 'phone', 'message')
        }),
        ('Служебное', {
            'fields': ('email',),
            'classes': ('collapse',),
        }),
        ('Статус', {
            'fields': ('status',)
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        """Делаем даты только для чтения"""
        return self.readonly_fields
