"""
Админка для моделей настроек сайта.
"""
from django.contrib import admin
from django.utils.html import format_html

from .models import AgentPartner, AgentSettings, ContactsSettings, InvestorSettings, MainSettings


class AgentPartnerInline(admin.TabularInline):
    """Карточки партнёров внутри настроек для агентов (не более 10)."""

    model = AgentPartner
    extra = 1
    max_num = 10
    fields = ('full_name', 'photo', 'deals_count', 'order', 'photo_preview')
    readonly_fields = ('photo_preview',)
    ordering = ('order', 'id')
    verbose_name = 'Партнёр'
    verbose_name_plural = 'Партнёры (максимум 10)'

    def photo_preview(self, obj):
        """Превью загруженного фото."""
        if not obj.pk or not obj.photo:
            return '-'
        return format_html(
            '<img src="{}" style="max-width:80px; max-height:80px; object-fit:cover;" />',
            obj.photo.url,
        )
    photo_preview.short_description = 'Превью'


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
            'description': (
                'Один PDF; сохранение в media/documents/cases/. '
                'В ответе /main-info поле cases — URL из storage.'
            ),
        }),
        (
            'Публичные PDF (политика и оплата)',
            {
                'fields': ('privacy_pdf', 'oplata_pdf'),
                'description': (
                    'Файлы пишутся в media/documents/privacy.pdf и media/documents/oplata.pdf. '
                    'В API /main-info — пути «/privacy.pdf» и «/oplata.pdf» (настроить nginx alias на эти файлы).'
                ),
            },
        ),
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
                    'Три PDF в media/documents/investors/. '
                    'API GET /api/v1/site-settings/investors — document_1, document_2, document_3: URL или null.'
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


@admin.register(AgentSettings)
class AgentSettingsAdmin(admin.ModelAdmin):
    """
    Админка для настроек агентов.
    Singleton модель — один экземпляр, как MainSettings и ContactsSettings.
    """

    list_display = ('__str__',)
    inlines = [AgentPartnerInline]
    fieldsets = (
        (
            'Настройки для агентов',
            {
                'fields': ('table_link',),
                'description': (
                    'Ссылка на таблицу комиссий. '
                    'API GET /api/v1/site-settings/agents — table_link: строка или null.'
                ),
            },
        ),
        (
            'Списки на странице «Агентам»',
            {
                'fields': ('dealer_advantages', 'dealer_duties'),
                'description': (
                    'Один пункт на строку, порядок строк = порядок вывода; пустые строки игнорируются. '
                    'API GET /api/v1/site-settings/agents — dealer_advantages и dealer_duties: '
                    'массивы строк. Заголовки блоков и иконки заданы на фронте.'
                ),
            },
        ),
    )

    def has_add_permission(self, request):
        """Запрещаем создание второго экземпляра (Singleton)."""
        return not AgentSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        """Запрещаем удаление единственного экземпляра."""
        return False

    def changelist_view(self, request, extra_context=None):
        """Сразу открываем форму редактирования единственной записи."""
        from django.shortcuts import redirect

        obj = AgentSettings.load()
        return redirect(f'/admin/site_settings/agentsettings/{obj.pk}/change/')
