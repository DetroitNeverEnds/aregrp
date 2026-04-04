"""
Админка для моделей настроек сайта.
"""
from django.contrib import admin

from .models import ContactsSettings, InvestorSettings, MainSettings


@admin.register(MainSettings)
class MainSettingsAdmin(admin.ModelAdmin):
    """
    Админка для основных настроек сайта.
    Singleton модель - всегда будет только один экземпляр.
    """
    list_display = ('phone', 'email', 'max_link', 'telegram_link')
    fieldsets = (
        ('Контактная информация', {
            'fields': ('phone', 'display_phone', 'email', 'max_link', 'telegram_link')
        }),
        ('Информация для footer', {
            'fields': ('description', 'org_name', 'inn')
        }),
        ('Кейсы', {
            'fields': ('cases_pdf',),
            'description': 'Один PDF-файл; в API /main-info в поле cases — URL из storage (как у медиа в API объектов).',
        }),
    )
    
    def has_add_permission(self, request):
        """Запрещаем создание новых экземпляров (Singleton)."""
        return not MainSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        """Запрещаем удаление единственного экземпляра."""
        return False
    
    def changelist_view(self, request, extra_context=None):
        """
        Переопределяем changelist_view для перенаправления на форму редактирования,
        так как у нас только один экземпляр (Singleton).
        """
        from django.shortcuts import redirect
        obj = MainSettings.load()
        return redirect(f'/admin/site_settings/mainsettings/{obj.pk}/change/')


@admin.register(ContactsSettings)
class ContactsSettingsAdmin(admin.ModelAdmin):
    """
    Админка для настроек контактов.
    Singleton модель - всегда будет только один экземпляр.
    """
    list_display = ('ogrn', 'legal_address', 'sales_center_address')
    fieldsets = (
        ('Реквизиты компании', {
            'fields': ('ogrn', 'legal_address')
        }),
        ('Офис продаж', {
            'fields': ('latitude', 'longitude', 'sales_center_address')
        }),
    )
    
    def has_add_permission(self, request):
        """Запрещаем создание новых экземпляров (Singleton)."""
        return not ContactsSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        """Запрещаем удаление единственного экземпляра."""
        return False
    
    def changelist_view(self, request, extra_context=None):
        """
        Переопределяем changelist_view для перенаправления на форму редактирования,
        так как у нас только один экземпляр (Singleton).
        """
        from django.shortcuts import redirect
        obj = ContactsSettings.load()
        return redirect(f'/admin/site_settings/contactssettings/{obj.pk}/change/')


@admin.register(InvestorSettings)
class InvestorSettingsAdmin(admin.ModelAdmin):
    """
    Админка для настроек инвесторов.
    Singleton модель — один экземпляр, как MainSettings и ContactsSettings.
    """

    list_display = ('__str__',)
    fieldsets = (
        (
            'Документы для инвесторов',
            {
                'fields': ('document_1', 'document_2', 'document_3'),
                'description': (
                    'Три PDF-файла. В API GET /api/v1/site-settings/investors — поля '
                    'document_1, document_2, document_3: URL из storage или null.'
                ),
            },
        ),
    )

    def has_add_permission(self, request):
        """Запрещаем создание второго экземпляра (Singleton)."""
        return not InvestorSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        """Запрещаем удаление единственного экземпляра."""
        return False

    def changelist_view(self, request, extra_context=None):
        """Сразу открываем форму редактирования единственной записи."""
        from django.shortcuts import redirect

        obj = InvestorSettings.load()
        return redirect(f'/admin/site_settings/investorsettings/{obj.pk}/change/')
