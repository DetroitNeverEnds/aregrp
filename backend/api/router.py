"""
Главный API router для проекта.
Подключает все роутеры из приложений.
"""
from ninja import NinjaAPI

from apps.accounts.routers.auth import auth_router
from apps.accounts.routers.profile import profile_router

# Создаем главный API объект
api = NinjaAPI(
    title="API",
    version="1.0.0",
    description="Main API for the project"
)

# Подключаем роутеры из приложений
api.add_router("/auth", auth_router, tags=["Authentication"])
api.add_router("/profile", profile_router, tags=["Profile"])

