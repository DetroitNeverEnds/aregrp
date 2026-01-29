"""
Админка для моделей accounts.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    """
    Админка для пользователей с расширенными полями.
    """
    list_display = ('email', 'username', 'full_name', 'user_type', 'phone', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('user_type', 'is_staff', 'is_active', 'is_superuser', 'date_joined')
    search_fields = ('email', 'username', 'full_name', 'phone', 'organization_name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Персональная информация', {
            'fields': ('full_name', 'phone', 'user_type')
        }),
        ('Информация об агенте', {
            'fields': ('organization_name', 'inn'),
            'classes': ('collapse',)
        }),
        ('Права доступа', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Важные даты', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'user_type'),
        }),
    )
    
    def get_fieldsets(self, request, obj=None):
        """
        Показываем поля агента только если user_type = 'agent'.
        """
        fieldsets = super().get_fieldsets(request, obj)
        if obj and obj.user_type != 'agent':
            # Убираем поля агента для физических лиц
            fieldsets = tuple(
                (name, fieldset) for name, fieldset in fieldsets
                if name != 'Информация об агенте'
            )
        return fieldsets
