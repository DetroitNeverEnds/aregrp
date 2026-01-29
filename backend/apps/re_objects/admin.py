"""
Админка для моделей объектов недвижимости.
"""
from django.contrib import admin
from .models import Region, City, Building, Floor, Premise


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


@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    """Админка для зданий."""
    list_display = ('name', 'address', 'city', 'total_floors', 'year_built', 'created_at')
    list_filter = ('city', 'city__region', 'year_built', 'created_at')
    search_fields = ('name', 'address', 'city__name')
    ordering = ('city', 'name')
    autocomplete_fields = ['city']
    readonly_fields = ('created_at', 'updated_at')


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
    """Админка для помещений."""
    list_display = (
        'number', 'city', 'building_info', 'floor_info', 
        'area', 'price_per_month', 'premise_type', 'status', 'created_at'
    )
    list_filter = (
        'city', 'city__region', 'premise_type', 'status', 
        'has_windows', 'has_parking', 'is_furnished', 'created_at'
    )
    search_fields = (
        'number', 'city__name', 'floor__building__name', 
        'description', 'floor__building__address'
    )
    ordering = ('city', 'floor__building', 'floor__number', 'number')
    autocomplete_fields = ['city', 'floor']
    readonly_fields = ('created_at', 'updated_at', 'price_per_sqm')
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('city', 'floor', 'number', 'premise_type', 'status')
        }),
        ('Параметры для поиска', {
            'fields': ('area', 'price_per_month', 'price_per_sqm')
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
    
    def building_info(self, obj):
        """Информация о здании."""
        if obj.floor and obj.floor.building:
            return obj.floor.building.name
        return '-'
    building_info.short_description = 'Здание'
    
    def floor_info(self, obj):
        """Информация об этаже."""
        if obj.floor:
            return f"Этаж {obj.floor.number}"
        return '-'
    floor_info.short_description = 'Этаж'
