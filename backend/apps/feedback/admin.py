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
    list_display = ('id', 'created_at', 'subject', 'name', 'email', 'phone', 'status')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Информация о пользователе', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Сообщение', {
            'fields': ('subject', 'message')
        }),
        ('Статус', {
            'fields': ('status',)
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        ('Источник', {
            'fields': ('origin_key', 'origin_url'),
            'classes': ('collapse',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        """Делаем даты только для чтения"""
        return self.readonly_fields

