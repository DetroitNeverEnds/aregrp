"""
Конфигурация pytest и общие фикстуры для тестов.

Ручки API — async, тесты используют TestAsyncClient и await client.get/post(...).
Фикстуры, создающие данные в БД, выполняют ORM через sync_to_async, чтобы не вызывать
sync-код из async-контекста (Django запрещает это по умолчанию).
"""
import pytest
from asgiref.sync import sync_to_async
from ninja.testing import TestAsyncClient

from api.router import api
from apps.accounts.models import CustomUser


@pytest.fixture(scope="session")
def api_client():
    """Один общий async-клиент для API (Ninja не допускает несколько TestClients на один api)."""
    return TestAsyncClient(api)


_counter = 0


def _next_suffix():
    """Уникальный суффикс на каждый вызов — чтобы не было дубликатов email/phone в общей БД."""
    global _counter
    _counter += 1
    return _counter


@pytest.fixture
async def test_user(db):
    """Тестовый пользователь (физлицо). Уникальные email и phone на каждый вызов."""
    suffix = _next_suffix()
    email = f"test_{suffix}@example.com"
    phone = f"+79991234{suffix:04d}"

    def create():
        return CustomUser.objects.create_user(
            username=f"testuser_{suffix}",
            email=email,
            password="TestPassword123!",
            user_type="individual",
            full_name="Тестовый Пользователь",
            phone=phone,
        )
    return await sync_to_async(create)()


@pytest.fixture
async def test_agent_user(db):
    """Тестовый пользователь-агент. Уникальные email и phone на каждый вызов."""
    suffix = _next_suffix()
    email = f"agent_{suffix}@example.com"
    phone = f"+79991235{suffix:04d}"

    def create():
        return CustomUser.objects.create_user(
            username=f"agentuser_{suffix}",
            email=email,
            password="TestPassword123!",
            user_type="agent",
            full_name="Тестовый Агент",
            phone=phone,
            organization_name="ООО Тест",
            inn="1234567890",
        )
    return await sync_to_async(create)()


@pytest.fixture
async def authenticated_client(api_client, test_user):
    """Клиент с аутентифицированным пользователем."""
    login_response = await api_client.post(
        "/auth/login",
        json={
            "email": test_user.email,
            "password": "TestPassword123!",
            "use_cookies": False
        }
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    client = TestAsyncClient(api)
    client.headers = {"Authorization": f"Bearer {token}"}
    return client
