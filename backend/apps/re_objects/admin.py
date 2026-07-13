"""
Админка для моделей объектов недвижимости.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from .models import (
    Building,
    BuildingImage,
    BuildingVideo,
    City,
    Floor,
    FloorPanorama,
    Premise,
    PremiseImage,
    PremisePanorama,
    Region,
)


# Inline админки для медиафайлов помещений
class PremiseImageInline(admin.TabularInline):
    """Inline для изображений помещений."""
    model = PremiseImage
    extra = 1
    fields = (
        'original', 'card', 'detail', 'title', 'order', 'is_primary', 'file_preview',
    )
    readonly_fields = ('card', 'detail', 'file_preview')
    verbose_name = 'Изображение'
    verbose_name_plural = 'Изображения'

    def file_preview(self, obj):
        """Превью card и ссылки на original/detail."""
        if not obj.pk:
            return '-'
        parts = []
        if obj.card:
            parts.append(
                format_html(
                    '<img src="{}" style="max-width: 100px; max-height: 56px; border-radius: 4px; object-fit: contain; background: #f0f0f0;" />',
                    obj.card.url,
                )
            )
        if obj.original:
            parts.append(
                format_html('<a href="{}" target="_blank">оригинал</a>', obj.original.url)
            )
        if obj.detail:
            parts.append(
                format_html('<a href="{}" target="_blank">detail</a>', obj.detail.url)
            )
        if not parts:
            return '-'
        if len(parts) == 1:
            return parts[0]
        return mark_safe('&nbsp;'.join(str(p) for p in parts))

    file_preview.short_description = 'Превью / ссылки'


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    """Админка для регионов."""
    list_display = ('name', 'code', 'is_default', 'created_at')
    list_filter = ('is_default', 'created_at')
    search_fields = ('name', 'code')
    ordering = ('name',)


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    """Админка для городов."""
    list_display = ('name', 'region', 'is_default', 'created_at')
    list_filter = ('region', 'is_default', 'created_at')
    search_fields = ('name', 'region__name')
    ordering = ('region', 'name')
    autocomplete_fields = ['region']


# Inline админки для медиафайлов зданий
class BuildingImageInline(admin.TabularInline):
    """Inline для изображений зданий."""
    model = BuildingImage
    extra = 1
    fields = (
        'original', 'card', 'detail', 'title', 'category', 'order', 'is_primary', 'file_preview',
    )
    readonly_fields = ('card', 'detail', 'file_preview')
    verbose_name = 'Изображение'
    verbose_name_plural = 'Изображения'

    def file_preview(self, obj):
        """Превью card и ссылки на original/detail."""
        if not obj.pk:
            return '-'
        parts = []
        if obj.card:
            parts.append(
                format_html(
                    '<img src="{}" style="max-width: 100px; max-height: 56px; border-radius: 4px; object-fit: contain; background: #f0f0f0;" />',
                    obj.card.url,
                )
            )
        if obj.original:
            parts.append(
                format_html('<a href="{}" target="_blank">оригинал</a>', obj.original.url)
            )
        if obj.detail:
            parts.append(
                format_html('<a href="{}" target="_blank">detail</a>', obj.detail.url)
            )
        if not parts:
            return '-'
        if len(parts) == 1:
            return parts[0]
        return mark_safe('&nbsp;'.join(str(p) for p in parts))

    file_preview.short_description = 'Превью / ссылки'


class BuildingVideoInline(admin.TabularInline):
    """Inline для видео зданий."""
    model = BuildingVideo
    extra = 1
    fields = ('file', 'card', 'title', 'category', 'order', 'file_preview')
    readonly_fields = ('card', 'file_preview')
    verbose_name = 'Видео'
    verbose_name_plural = 'Видео'

    def file_preview(self, obj):
        """Превью кадра и ссылка на ролик."""
        if not obj.pk:
            return '-'
        parts = []
        if obj.card:
            parts.append(
                format_html(
                    '<img src="{}" style="max-width: 100px; max-height: 56px; border-radius: 4px; object-fit: contain; background: #f0f0f0;" />',
                    obj.card.url,
                )
            )
        if obj.file:
            parts.append(
                format_html(
                    '<a href="{}" target="_blank" style="display: inline-block; padding: 4px 8px; '
                    'background: #007cba; color: white; text-decoration: none; border-radius: 3px;">видео</a>',
                    obj.file.url,
                )
            )
        if not parts:
            return '-'
        if len(parts) == 1:
            return parts[0]
        return mark_safe('&nbsp;'.join(str(p) for p in parts))

    file_preview.short_description = 'Превью / ссылка'


class FloorPanoramaInline(admin.TabularInline):
    """Inline для панорам этажа."""
    model = FloorPanorama
    extra = 1
    fields = ('file', 'title', 'order', 'file_preview')
    readonly_fields = ('file_preview',)
    verbose_name = 'Панорама'
    verbose_name_plural = 'Панорамы'

    def file_preview(self, obj):
        if not obj.pk or not obj.file:
            return '-'
        return format_html('<a href="{}" target="_blank">панорама</a>', obj.file.url)

    file_preview.short_description = 'Ссылка'


class PremisePanoramaInline(admin.TabularInline):
    """Inline для панорам помещения."""
    model = PremisePanorama
    extra = 1
    fields = ('file', 'title', 'order', 'file_preview')
    readonly_fields = ('file_preview',)
    verbose_name = 'Панорама'
    verbose_name_plural = 'Панорамы'

    def file_preview(self, obj):
        if not obj.pk or not obj.file:
            return '-'
        return format_html('<a href="{}" target="_blank">панорама</a>', obj.file.url)

    file_preview.short_description = 'Ссылка'


@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    """Админка для зданий."""
    list_display = ('name', 'address', 'city', 'latitude', 'longitude', 'total_floors', 'year_built', 'created_at')
    list_filter = ('city', 'city__region', 'year_built', 'created_at')
    search_fields = ('name', 'address', 'city__name')
    ordering = ('city', 'name')
    autocomplete_fields = ['city']
    readonly_fields = ('created_at', 'updated_at', 'presentation_rent_link', 'presentation_sale_link')
    inlines = [BuildingImageInline, BuildingVideoInline]
    fieldsets = (
        (None, {
            'fields': ('name', 'address', 'city', 'description', 'total_floors', 'year_built', 'latitude', 'longitude'),
        }),
        ('Презентации', {
            'fields': (
                'presentation_rent',
                'presentation_rent_link',
                'presentation_sale',
                'presentation_sale_link',
            ),
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def _presentation_link(self, presentation):
        if not presentation:
            return '-'
        return format_html('<a href="{}" target="_blank">Открыть презентацию</a>', presentation.url)

    def presentation_rent_link(self, obj):
        return self._presentation_link(obj.presentation_rent)

    presentation_rent_link.short_description = 'Презентация (аренда)'

    def presentation_sale_link(self, obj):
        return self._presentation_link(obj.presentation_sale)

    presentation_sale_link.short_description = 'Презентация (продажа)'


@admin.register(Floor)
class FloorAdmin(admin.ModelAdmin):
    """Админка для этажей."""
    list_display = ('building', 'number', 'title', 'created_at')
    list_filter = ('building__city', 'created_at')
    search_fields = ('building__name', 'title', 'number')
    ordering = ('building', 'number')
    autocomplete_fields = ['building']
    readonly_fields = ('created_at', 'updated_at')
    inlines = [FloorPanoramaInline]


@admin.register(Premise)
class PremiseAdmin(admin.ModelAdmin):
    """Админка для помещений. Помещение привязано к зданию, этаж — из списка этажей этого здания."""
    list_display = (
        'room_number', 'title', 'city', 'building', 'floor_info',
        'area', 'price_per_month', 'premise_type',
        'available_for_rent', 'available_for_sale', 'show_rented_button', 'created_at'
    )
    list_filter = (
        'city', 'city__region', 'building', 'premise_type',
        'available_for_rent', 'available_for_sale', 'show_rented_button',
        'has_windows', 'has_parking', 'is_furnished', 'created_at'
    )
    search_fields = (
        'room_number', 'title', 'city__name', 'building__name',
        'description', 'building__address'
    )
    ordering = ('city', 'building', 'floor__number', 'room_number', 'title')
    readonly_fields = ('created_at', 'updated_at', 'full_sell_price')
    inlines = [PremiseImageInline, PremisePanoramaInline]

    fieldsets = (
        ('Основная информация', {
            'fields': (
                'city', 'building', 'floor', 'room_number', 'title', 'premise_type',
                'available_for_rent', 'available_for_sale', 'show_rented_button',
            )
        }),
        ('Параметры для поиска', {
            'fields': ('area', 'price_per_month', 'price_per_sqm', 'full_sell_price')
        }),
        ('Дополнительные параметры', {
            'fields': (
                'ceiling_height', 'has_windows', 'has_parking', 'is_furnished'
            ),
            'classes': ('collapse',)
        }),
        ('Описание', {
            'fields': ('description',)
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def floor_info(self, obj):
        """Информация об этаже."""
        if obj.floor:
            return f"Этаж {obj.floor.number}"
        return '-'
    floor_info.short_description = 'Этаж'
