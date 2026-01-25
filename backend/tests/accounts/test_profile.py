"""
Smoke тесты для эндпоинтов профиля.
"""
import pytest
from ninja.testing import TestClient

from api.router import api
from apps.accounts.models import CustomUser


@pytest.mark.django_db
class TestProfileEndpoints:
    """Тесты для эндпоинтов профиля."""
    
    def get_authenticated_client(self, email, password):
        """Создает аутентифицированный клиент."""
        client = TestClient(api)
        
        # Логинимся
        login_response = client.post(
            "/auth/login",
            json={
                "email": email,
                "password": password,
                "use_cookies": False
            }
        )
        
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Устанавливаем токен
        client.headers = {"Authorization": f"Bearer {token}"}
        return client
    
    def test_get_user(self, test_user):
        """Тест получения данных пользователя."""
        client = self.get_authenticated_client("test@example.com", "TestPassword123!")
        
        response = client.get("/profile/user")
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["user_type"] == "individual"
        assert data["full_name"] == "Тестовый Пользователь"
        assert data["phone"] == "+79991234567"
    
    def test_get_user_unauthorized(self):
        """Тест получения данных без авторизации."""
        client = TestClient(api)
        response = client.get("/profile/user")
        
        assert response.status_code == 401
    
    def test_update_profile(self, test_user):
        """Тест обновления профиля."""
        client = self.get_authenticated_client("test@example.com", "TestPassword123!")
        
        response = client.put(
            "/profile/profile",
            json={
                "full_name": "Обновленное Имя",
                "phone": "+79991234599"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Обновленное Имя"
        assert data["phone"] == "+79991234599"
        
        # Проверяем в БД
        user = CustomUser.objects.get(email="test@example.com")
        assert user.full_name == "Обновленное Имя"
        assert user.phone == "+79991234599"
    
    def test_update_profile_agent(self, test_agent_user):
        """Тест обновления профиля агента."""
        client = self.get_authenticated_client("agent@example.com", "TestPassword123!")
        
        response = client.put(
            "/profile/profile",
            json={
                "organization_name": "Новое Название ООО",
                "inn": "9876543210"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["organization_name"] == "Новое Название ООО"
        assert data["inn"] == "9876543210"
        
        # Проверяем в БД
        user = CustomUser.objects.get(email="agent@example.com")
        assert user.organization_name == "Новое Название ООО"
        assert user.inn == "9876543210"
    
    def test_update_profile_unauthorized(self):
        """Тест обновления профиля без авторизации."""
        client = TestClient(api)
        response = client.put(
            "/profile/profile",
            json={
                "full_name": "Новое Имя"
            }
        )
        
        assert response.status_code == 401
    
    @pytest.mark.skip(reason="Требуется мок - не тестируем смену пароля")
    def test_change_password(self, test_user):
        """Тест смены пароля - пропускаем, требуется мок."""
        pass
