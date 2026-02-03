# Тесты Backend

## Запуск всех тестов перед пушем

Из корня backend:

```bash
cd backend
uv run pytest
```

Или из корня проекта:

```bash
uv run pytest backend/tests/
```

Рекомендуется перед каждым пушем прогнать тесты:

```bash
uv run pytest -v
```

## Структура

```
tests/
├── __init__.py
├── conftest.py                 # Общие фикстуры и конфигурация pytest
├── accounts/
│   ├── __init__.py
│   ├── test_auth.py             # Эндпоинты аутентификации
│   └── test_profile.py          # Эндпоинты профиля
├── site_settings/
│   ├── __init__.py
│   └── test_site_settings.py    # Эндпоинты настроек сайта
└── README.md
```

## Установка зависимостей

Зависимости для тестирования уже добавлены в `pyproject.toml`:
- `pytest>=8.0.0`
- `pytest-django>=4.8.0`
- `pytest-asyncio>=0.23.0`

Установите их командой:
```bash
uv sync
```

## Запуск тестов

### Все тесты
```bash
cd backend
pytest
```

### Конкретный файл
```bash
pytest tests/accounts/test_auth.py
```

### Конкретный тест
```bash
pytest tests/accounts/test_auth.py::TestAuthEndpoints::test_register_individual
```

### С подробным выводом
```bash
pytest -v
```

### С покрытием кода
```bash
pytest --cov=apps --cov-report=html
```

## Тестовая база данных

Для тестов используется отдельный модуль настроек **`config.settings_test`** (указан в `pytest.ini`). В нём БД задаётся как **SQLite in-memory** (`:memory:`), а не Postgres из `.env`.

Как это работает:

1. **pytest-django** при запуске тестов подхватывает `DJANGO_SETTINGS_MODULE=config.settings_test`.
2. Django создаёт **тестовую БД** (в случае SQLite — в памяти), применяет миграции.
3. Тесты выполняются; каждый тест с `@pytest.mark.django_db` получает доступ к этой БД (по умолчанию — в транзакции, которая откатывается после теста).
4. После завершения прогона тестовая БД **удаляется**.

Внешний сервер (Postgres, хост `db`) для тестов **не нужен** — всё идёт в SQLite в памяти, локально.

## Фикстуры

### `api_client`
Базовый клиент для тестирования Django Ninja API.

### `test_user`
Тестовый пользователь (физлицо). На каждый вызов — уникальные email и phone (счётчик), чтобы не было дубликатов в общей БД. Пароль: `TestPassword123!`. В тестах используйте `test_user.email`, `test_user.phone`.

### `test_agent_user`
Тестовый агент. Аналогично — уникальные email/phone на вызов. В тестах используйте `test_agent_user.email`.

### `authenticated_client`
Клиент с уже аутентифицированным пользователем (токен в заголовках).

## Покрытие эндпоинтов

### Аутентификация (`test_auth.py`)
- ✅ POST `/auth/register` — регистрация физлица и агента, дубликаты, валидация
- ✅ POST `/auth/login` — успешный вход, неверные учётные данные
- ✅ POST `/auth/logout` — выход (с токеном и без)
- ✅ POST `/auth/refresh-token` — обновление токена по cookie
- ✅ POST `/auth/password-reset` — запрос сброса пароля (email мокается)
- ✅ POST `/auth/password-reset/confirm` — смена пароля по токену, неверный токен, несовпадение паролей

### Профиль (`test_profile.py`)
- ✅ GET `/profile/user` — получение данных пользователя, 401 без токена
- ✅ PUT `/profile/profile` — обновление профиля (физлицо и агент), 401 без токена
- ✅ POST `/profile/change-password` — смена пароля, неверный текущий пароль, несовпадение новых, 401 без токена

### Настройки сайта (`test_site_settings.py`)
- ✅ GET `/site-settings/main-info` — основные настройки, fallback display_phone
- ✅ GET `/site-settings/contacts` — реквизиты и офис, координаты и null

## Примечания

- Все тесты используют `@pytest.mark.django_db` для доступа к БД.
- Отправка email в `password-reset` мокается через `patch("apps.accounts.routers.auth.send_password_reset_email")`.
- Каждый тест изолирован; используется тестовая БД (SQLite in-memory по умолчанию).
