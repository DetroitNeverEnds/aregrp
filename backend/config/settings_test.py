"""
Настройки Django только для запуска тестов (pytest).

SQLite in-memory: тестовая БД создаётся и удаляется автоматически pytest-django.
Фикстуры создают пользователей с уникальным суффиксом (счётчик), чтобы не было
дубликатов email/phone при общей БД.
"""
from .settings import *  # noqa: F401, F403

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# В тестах включаем валидацию паролей (в основном settings она может быть отключена)
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
