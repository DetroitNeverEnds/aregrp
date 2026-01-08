"""
Админка для моделей настроек сайта.
"""
from django.contrib import admin
from .models import SiteSettings


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    """
    Админка для настроек сайта.
    Singleton модель - всегда будет только один экземпляр.
    """
    fieldsets = (
        ('Контакты', {
            'fields': ('phone', 'email', 'whats_app', 'telegram')
        }),
        ('Реквизиты', {
            'fields': ('ruk_fio', 'inn')
        }),
    )
    
    def has_add_permission(self, request):
        """
        Запрещаем создание новых экземпляров (Singleton).
        """
        return not SiteSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        """
        Запрещаем удаление единственного экземпляра.
        """
        return False

