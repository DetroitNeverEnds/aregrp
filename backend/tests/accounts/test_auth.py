"""
Тесты для эндпоинтов аутентификации и регистрации.
"""
import pytest
from ninja.testing import TestClient

from api.router import api
from apps.accounts.models import CustomUser


@pytest.mark.django_db
class TestRegistration:
    """Тесты для эндпоинта регистрации /auth/register."""
    
    @pytest.fixture
    def client(self):
        """Клиент для API."""
        return TestClient(api)
    
    def test_register_individual_success(self, client):
        """Тест успешной регистрации физического лица."""
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
        
        # Проверяем структуру успешного ответа
        assert "user" in data
        assert "access_token" in data
        assert "refresh_token" in data
        assert "message" in data
        assert data["message"] == "User successfully registered"
        assert data["use_cookies"] is False
        
        # Проверяем данные пользователя
        user_data = data["user"]
        assert user_data["email"] == "ivan@example.com"
        assert user_data["user_type"] == "individual"
        assert user_data["full_name"] == "Иван Иванов"
        assert user_data["phone"] == "+79991234567"
        
        # Проверяем, что пользователь создан в БД
        user = CustomUser.objects.get(email="ivan@example.com")
        assert user.user_type == "individual"
        assert user.full_name == "Иван Иванов"
        assert user.phone == "+79991234567"
        assert user.check_password("TestPassword123!")
    
    def test_register_agent_success(self, client):
        """Тест успешной регистрации агента."""
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
        
        assert "user" in data
        assert "access_token" in data
        assert "refresh_token" in data
        
        # Проверяем данные агента
        user_data = data["user"]
        assert user_data["user_type"] == "agent"
        assert user_data["organization_name"] == "ООО Рога и Копыта"
        assert user_data["inn"] == "1234567890"
        
        # Проверяем в БД
        user = CustomUser.objects.get(email="agent@example.com")
        assert user.user_type == "agent"
        assert user.organization_name == "ООО Рога и Копыта"
        assert user.inn == "1234567890"
    
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
        
        # Проверяем структуру ошибки ProblemDetail
        assert "type" in data
        assert "title" in data
        assert "status" in data
        assert "detail" in data
        assert "code" in data
        assert data["status"] == 400
        assert data["code"] == "ACCOUNTS_EMAIL_EXISTS"
        assert "email" in data["detail"].lower() or "exists" in data["detail"].lower()
    
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
        
        assert data["status"] == 400
        assert data["code"] == "ACCOUNTS_PHONE_EXISTS"
        assert "phone" in data["detail"].lower() or "exists" in data["detail"].lower()
    
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
        
        assert data["status"] == 400
        assert data["code"] == "ACCOUNTS_PASSWORD_MISMATCH"
        assert "password" in data["detail"].lower() or "match" in data["detail"].lower()
    
    def test_register_agent_missing_organization_name(self, client):
        """Тест регистрации агента без названия организации."""
        response = client.post(
            "/auth/register",
            json={
                "user_type": "agent",
                "full_name": "Петр Петров",
                "email": "agent2@example.com",
                "phone": "+79991234571",
                "password1": "TestPassword123!",
                "password2": "TestPassword123!",
                "inn": "1234567890",
                # organization_name отсутствует
                "use_cookies": False
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        
        assert data["status"] == 400
        assert data["code"] == "ACCOUNTS_MISSING_ORGANIZATION_NAME"
        assert "organization" in data["detail"].lower()
    
    def test_register_agent_missing_inn(self, client):
        """Тест регистрации агента без ИНН."""
        response = client.post(
            "/auth/register",
            json={
                "user_type": "agent",
                "full_name": "Петр Петров",
                "email": "agent3@example.com",
                "phone": "+79991234572",
                "password1": "TestPassword123!",
                "password2": "TestPassword123!",
                "organization_name": "ООО Тест",
                # inn отсутствует
                "use_cookies": False
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        
        assert data["status"] == 400
        assert data["code"] == "ACCOUNTS_MISSING_INN"
        assert "inn" in data["detail"].lower()
    
    def test_register_invalid_user_type(self, client):
        """Тест регистрации с неверным типом пользователя."""
        response = client.post(
            "/auth/register",
            json={
                "user_type": "invalid_type",
                "full_name": "Иван Иванов",
                "email": "ivan3@example.com",
                "phone": "+79991234573",
                "password1": "TestPassword123!",
                "password2": "TestPassword123!",
                "use_cookies": False
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        
        assert data["status"] == 400
        assert data["code"] == "ACCOUNTS_INVALID_USER_TYPE"
    
    def test_register_weak_password(self, client):
        """Тест регистрации со слабым паролем."""
        response = client.post(
            "/auth/register",
            json={
                "user_type": "individual",
                "full_name": "Иван Иванов",
                "email": "ivan4@example.com",
                "phone": "+79991234574",
                "password1": "123",  # Слишком короткий
                "password2": "123",
                "use_cookies": False
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        
        assert data["status"] == 400
        assert data["code"] == "ACCOUNTS_PASSWORD_VALIDATION_FAILED"
    
    def test_register_with_cookies(self, client):
        """Тест регистрации с установкой cookies."""
        response = client.post(
            "/auth/register",
            json={
                "user_type": "individual",
                "full_name": "Иван Иванов",
                "email": "ivan5@example.com",
                "phone": "+79991234575",
                "password1": "TestPassword123!",
                "password2": "TestPassword123!",
                "use_cookies": True
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["use_cookies"] is True
        # Проверяем, что cookies установлены (если TestClient поддерживает)
        # В реальном тесте можно проверить response.cookies


@pytest.mark.django_db
class TestLogin:
    """Тесты для эндпоинта входа /auth/login."""
    
    @pytest.fixture
    def client(self):
        """Клиент для API."""
        return TestClient(api)
    
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
        
        # Проверяем структуру успешного ответа
        assert "user" in data
        assert "access_token" in data
        assert "refresh_token" in data
        assert "message" in data
        assert data["message"] == "Login successful"
        assert data["use_cookies"] is False
        
        # Проверяем данные пользователя
        user_data = data["user"]
        assert user_data["email"] == "test@example.com"
        assert user_data["user_type"] == "individual"
        
        # Проверяем, что токены не пустые
        assert len(data["access_token"]) > 0
        assert len(data["refresh_token"]) > 0
    
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
        
        # Проверяем структуру ошибки
        assert "type" in data
        assert "title" in data
        assert "status" in data
        assert "detail" in data
        assert "code" in data
        assert data["status"] == 401
        assert data["code"] == "ACCOUNTS_INVALID_CREDENTIALS"
        assert "invalid" in data["detail"].lower() or "credentials" in data["detail"].lower()
    
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
        
        assert data["status"] == 401
        assert data["code"] == "ACCOUNTS_INVALID_CREDENTIALS"
    
    def test_login_with_cookies(self, client, test_user):
        """Тест входа с установкой cookies."""
        response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "TestPassword123!",
                "use_cookies": True
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["use_cookies"] is True
        assert "access_token" in data
        assert "refresh_token" in data


@pytest.mark.django_db
class TestLogout:
    """Тесты для эндпоинта выхода /auth/logout."""
    
    @pytest.fixture
    def client(self):
        """Клиент для API."""
        return TestClient(api)
    
    def test_logout_success(self, client, test_user):
        """Тест успешного выхода."""
        # Сначала логинимся для получения токена
        login_response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "TestPassword123!",
                "use_cookies": False
            }
        )
        
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Выходим с токеном
        logout_client = TestClient(api)
        logout_client.headers = {"Authorization": f"Bearer {token}"}
        response = logout_client.post("/auth/logout")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Logout successful"
    
    def test_logout_unauthorized(self, client):
        """Тест выхода без авторизации."""
        response = client.post("/auth/logout")
        
        assert response.status_code == 401


@pytest.mark.django_db
class TestRefreshToken:
    """Тесты для эндпоинта обновления токена /auth/refresh-token."""
    
    @pytest.fixture
    def client(self):
        """Клиент для API."""
        return TestClient(api)
    
    def test_refresh_token_success(self, client, test_user):
        """Тест успешного обновления токена."""
        # Логинимся для получения refresh_token
        login_response = client.post(
            "/auth/login",
            json={
                "email": "test@example.com",
                "password": "TestPassword123!",
                "use_cookies": False
            }
        )
        
        assert login_response.status_code == 200
        refresh_token = login_response.json()["refresh_token"]
        
        # Устанавливаем refresh_token в cookies
        refresh_client = TestClient(api)
        # В TestClient cookies устанавливаются через cookies атрибут
        refresh_client.cookies = {"refresh_token": refresh_token}
        
        # Обновляем токен
        response = refresh_client.post("/auth/refresh-token")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["message"] == "Tokens refreshed successfully"
        
        # Проверяем, что токены обновлены (новые значения)
        assert data["access_token"] != refresh_token
        assert data["refresh_token"] != refresh_token
    
    def test_refresh_token_missing(self, client):
        """Тест обновления токена без refresh_token в cookies."""
        response = client.post("/auth/refresh-token")
        
        assert response.status_code == 401
        data = response.json()
        
        assert data["status"] == 401
        assert data["code"] == "ACCOUNTS_NO_REFRESH_TOKEN"
    
    def test_refresh_token_invalid(self, client):
        """Тест обновления токена с неверным токеном."""
        refresh_client = TestClient(api)
        refresh_client.cookies = {"refresh_token": "invalid_token"}
        
        response = refresh_client.post("/auth/refresh-token")
        
        assert response.status_code == 401
        data = response.json()
        
        assert data["status"] == 401
        assert data["code"] in ["ACCOUNTS_INVALID_TOKEN", "ACCOUNTS_TOKEN_EXPIRED"]
