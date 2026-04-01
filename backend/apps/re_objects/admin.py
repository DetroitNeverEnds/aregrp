"""
Админка для моделей объектов недвижимости.
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Region, City, Building, Floor, Premise,
    PremiseImage, BuildingImage, BuildingVideo
)


# Inline админки для медиафайлов помещений
class PremiseImageInline(admin.TabularInline):
    """Inline для изображений помещений."""
    model = PremiseImage
    extra = 1
    fields = ('file', 'title', 'order', 'is_primary', 'file_preview')
    readonly_fields = ('file_preview',)
    verbose_name = 'Изображение'
    verbose_name_plural = 'Изображения'
    
    def file_preview(self, obj):
        """Предпросмотр изображения."""
        if obj.pk and obj.file:
            return format_html(
                '<img src="{}" style="max-width: 100px; max-height: 100px; border-radius: 4px; object-fit: cover;" />',
                obj.file.url
            )
        return '-'
    file_preview.short_description = 'Предпросмотр'


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
    fields = ('file', 'title', 'category', 'order', 'is_primary', 'file_preview')
    readonly_fields = ('file_preview',)
    verbose_name = 'Изображение'
    verbose_name_plural = 'Изображения'
    
    def file_preview(self, obj):
        """Предпросмотр изображения."""
        if obj.pk and obj.file:
            return format_html(
                '<img src="{}" style="max-width: 100px; max-height: 100px; border-radius: 4px; object-fit: cover;" />',
                obj.file.url
            )
        return '-'
    file_preview.short_description = 'Предпросмотр'


class BuildingVideoInline(admin.TabularInline):
    """Inline для видео зданий."""
    model = BuildingVideo
    extra = 1
    fields = ('file', 'title', 'category', 'order', 'file_preview')
    readonly_fields = ('file_preview',)
    verbose_name = 'Видео'
    verbose_name_plural = 'Видео'
    
    def file_preview(self, obj):
        """Предпросмотр видео."""
        if obj.pk and obj.file:
            return format_html(
                '<a href="{}" target="_blank" style="display: inline-block; padding: 4px 8px; background: #007cba; color: white; text-decoration: none; border-radius: 3px;">📹 Видео</a>',
                obj.file.url
            )
        return '-'
    file_preview.short_description = 'Предпросмотр'


@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    """Админка для зданий."""
    list_display = ('name', 'address', 'city', 'total_floors', 'year_built', 'created_at')
    list_filter = ('city', 'city__region', 'year_built', 'created_at')
    search_fields = ('name', 'address', 'city__name')
    ordering = ('city', 'name')
    autocomplete_fields = ['city']
    readonly_fields = ('created_at', 'updated_at')
    inlines = [BuildingImageInline, BuildingVideoInline]


@admin.register(Floor)
class FloorAdmin(admin.ModelAdmin):
    """Админка для этажей."""
    list_display = ('building', 'number', 'description', 'created_at')
    list_filter = ('building__city', 'created_at')
    search_fields = ('building__name', 'description')
    ordering = ('building', 'number')
    autocomplete_fields = ['building']
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Premise)
class PremiseAdmin(admin.ModelAdmin):
    """Админка для помещений. Помещение привязано к зданию, этаж — из списка этажей этого здания."""
    list_display = (
        'number', 'city', 'building', 'floor_info',
        'area', 'price_per_month', 'premise_type', 'status',
        'available_for_rent', 'available_for_sale', 'created_at'
    )
    list_filter = (
        'city', 'city__region', 'building', 'premise_type', 'status',
        'available_for_rent', 'available_for_sale',
        'has_windows', 'has_parking', 'is_furnished', 'created_at'
    )
    search_fields = (
        'number', 'city__name', 'building__name',
        'description', 'building__address'
    )
    ordering = ('city', 'building', 'floor__number', 'number')
    autocomplete_fields = ['city', 'building']
    readonly_fields = ('created_at', 'updated_at', 'human_price')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'floor':
            match = getattr(request, 'resolver_match', None)
            object_id = match.kwargs.get('object_id') if match else None
            if object_id:
                building_id = (
                    Premise.objects.filter(pk=object_id)
                    .values_list('building_id', flat=True)
                    .first()
                )
                if building_id:
                    kwargs['queryset'] = Floor.objects.filter(building_id=building_id).order_by('number')
                else:
                    kwargs['queryset'] = Floor.objects.none()
            else:
                kwargs['queryset'] = Floor.objects.select_related('building').order_by(
                    'building__name', 'number'
                )
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    inlines = [PremiseImageInline]

    fieldsets = (
        ('Основная информация', {
            'fields': (
                'city', 'building', 'floor', 'number', 'premise_type', 'status',
                'available_for_rent', 'available_for_sale',
            )
        }),
        ('Параметры для поиска', {
            'fields': ('area', 'price_per_month', 'price_per_sqm', 'human_price')
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
