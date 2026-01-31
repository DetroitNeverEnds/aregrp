"""
Админка для моделей настроек сайта.
"""
from django.contrib import admin
from .models import MainSettings, ContactsSettings


@admin.register(MainSettings)
class MainSettingsAdmin(admin.ModelAdmin):
    """
    Админка для основных настроек сайта.
    Singleton модель - всегда будет только один экземпляр.
    """
    fieldsets = (
        ('Контактная информация', {
            'fields': ('phone', 'email', 'whatsapp_link', 'telegram_link')
        }),
        ('Информация для footer', {
            'fields': ('footer_description', 'footer_org_info')
        }),
    )
    
    def has_add_permission(self, request):
        """Запрещаем создание новых экземпляров (Singleton)."""
        return not MainSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        """Запрещаем удаление единственного экземпляра."""
        return False


@admin.register(ContactsSettings)
class ContactsSettingsAdmin(admin.ModelAdmin):
    """
    Админка для настроек контактов.
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
        """Запрещаем создание новых экземпляров (Singleton)."""
        return not ContactsSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        """Запрещаем удаление единственного экземпляра."""
        return False
