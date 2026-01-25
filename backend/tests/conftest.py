"""
Конфигурация pytest и общие фикстуры для тестов.
"""
import pytest
from ninja.testing import TestClient

from api.router import api
from apps.accounts.models import CustomUser


@pytest.fixture
def api_client():
    """
    Клиент для тестирования Django Ninja API.
    """
    return TestClient(api)


@pytest.fixture
def test_user(db):
    """
    Создает тестового пользователя (физическое лицо).
    """
    user = CustomUser.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="TestPassword123!",
        user_type="individual",
        full_name="Тестовый Пользователь",
        phone="+79991234567"
    )
    return user


@pytest.fixture
def test_agent_user(db):
    """
    Создает тестового пользователя-агента.
    """
    user = CustomUser.objects.create_user(
        username="agentuser",
        email="agent@example.com",
        password="TestPassword123!",
        user_type="agent",
        full_name="Тестовый Агент",
        phone="+79991234568",
        organization_name="ООО Тест",
        inn="1234567890"
    )
    return user


@pytest.fixture
def authenticated_client(api_client, test_user):
    """
    Клиент с аутентифицированным пользователем.
    """
    # Логинимся для получения токена
    login_response = api_client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "TestPassword123!",
            "use_cookies": False
        }
    )
    
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    
    # Создаем клиент с токеном
    client = TestClient(api)
    client.headers = {"Authorization": f"Bearer {token}"}
    
    return client
