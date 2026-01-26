# Тесты Backend

## Структура

```
tests/
├── __init__.py
├── conftest.py              # Общие фикстуры и конфигурация pytest
├── accounts/
│   ├── __init__.py
│   ├── test_auth.py         # Smoke тесты для эндпоинтов аутентификации
│   └── test_profile.py      # Smoke тесты для эндпоинтов профиля
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

Pytest-django автоматически создает тестовую БД для каждого теста и очищает её после выполнения. 
Используется SQLite в памяти для быстрого выполнения тестов.

## Фикстуры

### `api_client`
Базовый клиент для тестирования Django Ninja API.

### `test_user`
Создает тестового пользователя (физическое лицо):
- email: `test@example.com`
- password: `TestPassword123!`
- user_type: `individual`

### `test_agent_user`
Создает тестового пользователя-агента:
- email: `agent@example.com`
- password: `TestPassword123!`
- user_type: `agent`

### `authenticated_client`
Клиент с уже аутентифицированным пользователем (токен в заголовках).

## Покрытие эндпоинтов

### Аутентификация (`test_auth.py`)
- ✅ POST `/auth/register` - регистрация физического лица
- ✅ POST `/auth/register` - регистрация агента
- ✅ POST `/auth/register` - проверка дубликатов email/телефона
- ✅ POST `/auth/register` - валидация паролей
- ✅ POST `/auth/login` - успешный вход
- ✅ POST `/auth/login` - неверные учетные данные
- ✅ POST `/auth/logout` - выход
- ✅ POST `/auth/refresh-token` - обновление токена
- ⏭️ POST `/auth/password-reset` - сброс пароля (требуется мок email)
- ⏭️ POST `/auth/password-reset/confirm` - подтверждение сброса (требуется мок email)

### Профиль (`test_profile.py`)
- ✅ GET `/profile/user` - получение данных пользователя
- ✅ PUT `/profile/profile` - обновление профиля
- ✅ PUT `/profile/profile` - обновление профиля агента
- ⏭️ POST `/profile/change-password` - смена пароля (требуется мок)

## Примечания

- Все тесты используют декоратор `@pytest.mark.django_db` для доступа к БД
- Тесты для смены пароля и сброса пароля пропущены (`@pytest.mark.skip`), так как требуют мокирования email сервиса
- Каждый тест изолирован и использует свою тестовую БД
- Тесты создают пользователей через фикстуры или напрямую в тестах
