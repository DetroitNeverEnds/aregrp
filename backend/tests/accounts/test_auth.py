"""
Smoke тесты для эндпоинтов аутентификации.
"""
import pytest
from ninja.testing import TestClient

from api.router import api
from apps.accounts.models import CustomUser


@pytest.mark.django_db
class TestAuthEndpoints:
    """Тесты для эндпоинтов аутентификации."""
    
    @pytest.fixture
    def client(self):
        """Клиент для API."""
        return TestClient(api)
    
    def test_register_individual(self, client):
        """Тест регистрации физического лица."""
        response = client.post(
            "/auth/register",
            json={
                "user_type": "individual",
                "full_name": "Иван Иванов",
                "email": "ivan@example.com",
                "phone": "+79991234567",
                "password1": "TestPassword123!",
                "password2": "TestPassword123!",
                "use_cookies": False
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == "ivan@example.com"
        assert data["user"]["user_type"] == "individual"
        assert data["user"]["full_name"] == "Иван Иванов"
        
        # Проверяем, что пользователь создан в БД
        user = CustomUser.objects.get(email="ivan@example.com")
        assert user.user_type == "individual"
        assert user.full_name == "Иван Иванов"
    
    def test_register_agent(self, client):
        """Тест регистрации агента."""
        response = client.post(
            "/auth/register",
            json={
                "user_type": "agent",
                "full_name": "Петр Петров",
                "email": "agent@example.com",
                "phone": "+79991234568",
                "password1": "TestPassword123!",
                "password2": "TestPassword123!",
                "organization_name": "ООО Рога и Копыта",
                "inn": "1234567890",
                "use_cookies": False
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["user_type"] == "agent"
        assert data["user"]["organization_name"] == "ООО Рога и Копыта"
        assert data["user"]["inn"] == "1234567890"
        
        # Проверяем, что пользователь создан в БД
        user = CustomUser.objects.get(email="agent@example.com")
        assert user.user_type == "agent"
        assert user.organization_name == "ООО Рога и Копыта"
    
    def test_register_duplicate_email(self, client, test_user):
        """Тест регистрации с существующим email."""
        response = client.post(
            "/auth/register",
            json={
                "user_type": "individual",
                "full_name": "Другой Пользователь",
                "email": "test@example.com",  # Уже существует
                "phone": "+79991234569",
                "password1": "TestPassword123!",
                "password2": "TestPassword123!",
                "use_cookies": False
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "user_exists" in data["error"]
    
    def test_register_duplicate_phone(self, client, test_user):
        """Тест регистрации с существующим телефоном."""
        response = client.post(
            "/auth/register",
            json={
                "user_type": "individual",
                "full_name": "Другой Пользователь",
                "email": "new@example.com",
                "phone": "+79991234567",  # Уже существует
                "password1": "TestPassword123!",
                "password2": "TestPassword123!",
                "use_cookies": False
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "user_exists" in data["error"]
    
    def test_register_password_mismatch(self, client):
        """Тест регистрации с несовпадающими паролями."""
        response = client.post(
            "/auth/register",
            json={
                "user_type": "individual",
                "full_name": "Иван Иванов",
                "email": "ivan2@example.com",
                "phone": "+79991234570",
                "password1": "TestPassword123!",
                "password2": "DifferentPassword123!",
                "use_cookies": False
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "password_mismatch" in data["error"]
    
    def test_register_agent_missing_fields(self, client):
        """Тест регистрации агента без обязательных полей."""
        response = client.post(
            "/auth/register",
            json={
                "user_type": "agent",
                "full_name": "Петр Петров",
                "email": "agent2@example.com",
                "phone": "+79991234571",
                "password1": "TestPassword123!",
                "password2": "TestPassword123!",
                # organization_name и inn отсутствуют
                "use_cookies": False
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "missing" in data["error"]
    
    def test_login_success(self, client, test_user):
        """Тест успешного входа."""
        response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "TestPassword123!",
                "use_cookies": False
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == "test@example.com"
        assert data["message"] == "Login successful"
    
    def test_login_invalid_email(self, client):
        """Тест входа с несуществующим email."""
        response = client.post(
            "/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "TestPassword123!",
                "use_cookies": False
            }
        )
        
        assert response.status_code == 401
        data = response.json()
        assert "invalid_credentials" in data["error"]
    
    def test_login_invalid_password(self, client, test_user):
        """Тест входа с неверным паролем."""
        response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "WrongPassword123!",
                "use_cookies": False
            }
        )
        
        assert response.status_code == 401
        data = response.json()
        assert "invalid_credentials" in data["error"]
    
    def test_logout(self, client, test_user):
        """Тест выхода из системы."""
        # Сначала логинимся
        login_response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "TestPassword123!",
                "use_cookies": False
            }
        )
        token = login_response.json()["access_token"]
        
        # Выходим
        logout_client = TestClient(api)
        logout_client.headers = {"Authorization": f"Bearer {token}"}
        response = logout_client.post("/auth/logout")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
    
    def test_logout_unauthorized(self, client):
        """Тест выхода без авторизации."""
        response = client.post("/auth/logout")
        
        assert response.status_code == 401
    
    def test_refresh_token(self, client, test_user):
        """Тест обновления токена."""
        # Логинимся
        login_response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "TestPassword123!",
                "use_cookies": True  # Используем cookies
            }
        )
        
        # Получаем refresh_token из ответа
        refresh_token = login_response.json()["refresh_token"]
        
        # Устанавливаем refresh_token в cookies
        refresh_client = TestClient(api)
        refresh_client.cookies = {"refresh_token": refresh_token}
        
        # Обновляем токен
        response = refresh_client.post("/auth/refresh-token")
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
    
    def test_refresh_token_missing(self, client):
        """Тест обновления токена без refresh_token."""
        response = client.post("/auth/refresh-token")
        
        assert response.status_code == 401
        data = response.json()
        assert "no_refresh_token" in data["error"]
    
    @pytest.mark.skip(reason="Требуется мок email сервиса")
    def test_password_reset(self, client, test_user):
        """Тест запроса сброса пароля."""
        response = client.post(
            "/auth/password-reset",
            json={
                "email": "test@example.com"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
    
    @pytest.mark.skip(reason="Требуется мок email сервиса")
    def test_password_reset_confirm(self, client, db, test_user):
        """Тест подтверждения сброса пароля."""
        # Этот тест требует токен сброса пароля, который генерируется в email
        # Пока пропускаем
        pass
