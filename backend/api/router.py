"""
Главный API router для проекта.
Подключает все роутеры из приложений.
"""
from ninja import NinjaAPI
from ninja.renderers import JSONRenderer

from apps.accounts.routers.auth import auth_router
from apps.accounts.routers.profile import profile_router
from apps.re_objects.dev_routers import dev_router
from apps.re_objects.routers import premises_router, buildings_router, floors_router
from apps.site_settings.routers import site_settings_router
from apps.bookings.routers import bookings_router


class UTF8JSONRenderer(JSONRenderer):
    """Кириллица и прочий Unicode в теле JSON без \\uXXXX (читаемый UTF-8)."""

    json_dumps_params = {'ensure_ascii': False}


# Создаем главный API объект
api = NinjaAPI(
    title='API',
    version='1.0.0',
    description='Main API for the project',
    renderer=UTF8JSONRenderer(),
)

# Подключаем роутеры из приложений
api.add_router("/auth", auth_router, tags=["Authentication"])
api.add_router("/profile", profile_router, tags=["Profile"])
api.add_router("/bookings", bookings_router)
api.add_router("/site-settings", site_settings_router, tags=["Site Settings"])
api.add_router("/premises", premises_router)
api.add_router("/buildings", buildings_router)
api.add_router("/floors", floors_router)
api.add_router("", dev_router, tags=["Dev / Test"])

