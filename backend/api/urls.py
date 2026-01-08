"""
URL configuration for API.
Подключает главный API router к Django URLs.
"""
from django.urls import path
from .router import api

urlpatterns = [
    path("api/v1/", api.urls),
]

