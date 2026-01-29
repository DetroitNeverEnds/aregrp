"""
URL configuration for API.
Подключает главный API router к Django URLs.
"""
from django.urls import path
from .router import api

urlpatterns = [
    # Django видит полный путь /api/v1/... от nginx
    path("api/v1/", api.urls),
]

