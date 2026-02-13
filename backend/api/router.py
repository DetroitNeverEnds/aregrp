"""
Главный API router для проекта.
Подключает все роутеры из приложений.
"""
from ninja import NinjaAPI

from apps.accounts.routers.auth import auth_router
from apps.accounts.routers.profile import profile_router
from apps.re_objects.routers import re_objects_router
from apps.site_settings.routers import site_settings_router

# Создаем главный API объект
api = NinjaAPI(
    title="API",
    version="1.0.0",
    description="Main API for the project"
)

# Подключаем роутеры из приложений
api.add_router("/auth", auth_router, tags=["Authentication"])
api.add_router("/profile", profile_router, tags=["Profile"])
api.add_router("/site-settings", site_settings_router, tags=["Site Settings"])
api.add_router("", re_objects_router, tags=["Premises"])

