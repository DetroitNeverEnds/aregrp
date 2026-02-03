"""
Тесты для эндпоинтов аутентификации и регистрации.
"""
import pytest
from unittest.mock import patch, AsyncMock
from ninja.testing import TestAsyncClient

from asgiref.sync import sync_to_async
from api.router import api
from apps.accounts.models import CustomUser
from apps.accounts.services.auth_service import generate_password_reset_token


@pytest.mark.django_db
class TestRegistration:
    """Тесты для эндпоинта регистрации /auth/register."""

    @pytest.fixture
    def client(self, api_client):
        return api_client

    async def test_register_individual_success(self, client):
        """Тест успешной регистрации физического лица."""
        response = await client.post(
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

        user = await sync_to_async(CustomUser.objects.get)(email="ivan@example.com")
        assert user.user_type == "individual"
        assert user.full_name == "Иван Иванов"
        assert user.phone == "+79991234567"
        assert await sync_to_async(user.check_password)("TestPassword123!")
    
    async def test_register_agent_success(self, client):
        """Тест успешной регистрации агента."""
        response = await client.post(
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
        
        user = await sync_to_async(CustomUser.objects.get)(email=data["user"]["email"])
        assert user.user_type == "agent"
        assert user.organization_name == "ООО Рога и Копыта"
        assert user.inn == "1234567890"
    
    async def test_register_duplicate_email(self, client, test_user):
        """Тест регистрации с существующим email."""
        response = await client.post(
            "/auth/register",
            json={
                "user_type": "individual",
                "full_name": "Другой Пользователь",
                "email": test_user.email,  # уже занят test_user
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
    
    async def test_register_duplicate_phone(self, client, test_user):
        """Тест регистрации с существующим телефоном."""
        response = await client.post(
            "/auth/register",
            json={
                "user_type": "individual",
                "full_name": "Другой Пользователь",
                "email": "new@example.com",
                "phone": test_user.phone,  # уже занят test_user
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
    
    async def test_register_password_mismatch(self, client):
        """Тест регистрации с несовпадающими паролями."""
        response = await client.post(
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
    
    async def test_register_agent_missing_organization_name(self, client):
        """Тест регистрации агента без названия организации."""
        response = await client.post(
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
    
    async def test_register_agent_missing_inn(self, client):
        """Тест регистрации агента без ИНН."""
        response = await client.post(
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
    
    async def test_register_invalid_user_type(self, client):
        """Тест регистрации с неверным типом пользователя."""
        response = await client.post(
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
    
    async def test_register_weak_password(self, client):
        """Тест регистрации со слабым паролем."""
        response = await client.post(
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
    
    async def test_register_with_cookies(self, client):
        """Тест регистрации с установкой cookies."""
        response = await client.post(
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
    def client(self, api_client):
        return api_client

    async def test_login_success(self, client, test_user):
        """Тест успешного входа."""
        response = await client.post(
            "/auth/login",
            json={
                "email": test_user.email,
                "password": "TestPassword123!",
                "use_cookies": False
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["message"] == "Login successful"
        user_data = data["user"]
        assert user_data["email"] == test_user.email
        assert user_data["user_type"] == "individual"
        
        # Проверяем, что токены не пустые
        assert len(data["access_token"]) > 0
        assert len(data["refresh_token"]) > 0
    
    async def test_login_invalid_email(self, client):
        """Тест входа с несуществующим email."""
        response = await client.post(
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
    
    async def test_login_invalid_password(self, client, test_user):
        """Тест входа с неверным паролем."""
        response = await client.post(
            "/auth/login",
            json={
                "email": test_user.email,
                "password": "WrongPassword123!",
                "use_cookies": False
            }
        )
        
        assert response.status_code == 401
        data = response.json()
        
        assert data["status"] == 401
        assert data["code"] == "ACCOUNTS_INVALID_CREDENTIALS"
    
    async def test_login_with_cookies(self, client, test_user):
        """Тест входа с установкой cookies."""
        response = await client.post(
            "/auth/login",
            json={
                "email": test_user.email,
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
    def client(self, api_client):
        return api_client

    async def test_logout_success(self, client, test_user):
        """Тест успешного выхода."""
        login_response = await client.post(
            "/auth/login",
            json={
                "email": test_user.email,
                "password": "TestPassword123!",
                "use_cookies": False
            }
        )
        
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        client.headers = {"Authorization": f"Bearer {token}"}
        response = await client.post("/auth/logout")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Logout successful"
    
    async def test_logout_unauthorized(self, client):
        """Тест выхода без авторизации."""
        client.headers = {}
        client.cookies = {}
        response = await client.post("/auth/logout")
        assert response.status_code == 401


@pytest.mark.django_db
class TestRefreshToken:
    """Тесты для эндпоинта обновления токена /auth/refresh-token."""

    @pytest.fixture
    def client(self, api_client):
        return api_client

    async def test_refresh_token_success(self, client, test_user):
        """Тест успешного обновления токена."""
        client.headers = {}
        client.cookies = {}
        login_response = await client.post(
            "/auth/login",
            json={
                "email": test_user.email,
                "password": "TestPassword123!",
                "use_cookies": False
            }
        )
        
        assert login_response.status_code == 200
        refresh_token = login_response.json()["refresh_token"]
        client.cookies = {"refresh_token": refresh_token}
        response = await client.post("/auth/refresh-token")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["message"] == "Tokens refreshed successfully"
        
        # Новые токены выданы
        assert len(data["access_token"]) > 0
        assert len(data["refresh_token"]) > 0
    
    async def test_refresh_token_missing(self, client):
        """Тест обновления токена без refresh_token в cookies."""
        client.headers = {}
        client.cookies = {}
        response = await client.post("/auth/refresh-token")
        assert response.status_code == 401
        data = response.json()
        
        assert data["status"] == 401
        assert data["code"] == "ACCOUNTS_NO_REFRESH_TOKEN"
    
    async def test_refresh_token_invalid(self, client):
        """Тест обновления токена с неверным токеном."""
        client.cookies = {"refresh_token": "invalid_token"}
        response = await client.post("/auth/refresh-token")
        
        assert response.status_code == 401
        data = response.json()
        
        assert data["status"] == 401
        assert data["code"] in ["ACCOUNTS_INVALID_TOKEN", "ACCOUNTS_TOKEN_EXPIRED"]


@pytest.mark.django_db
class TestPasswordReset:
    """Тесты для POST /auth/password-reset."""

    @pytest.fixture
    def client(self, api_client):
        return api_client

    @patch("apps.accounts.routers.auth.send_password_reset_email", new_callable=AsyncMock, return_value=True)
    async def test_password_reset_success(self, mock_send_email, client, test_user):
        """Запрос сброса пароля для существующего email возвращает 200 и отправляет письмо."""
        response = await client.post(
            "/auth/password-reset",
            json={"email": test_user.email},
        )

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "account" in data["message"].lower() or "email" in data["message"].lower()
        mock_send_email.assert_called_once()

    async def test_password_reset_nonexistent_email_returns_200(self, client):
        """Для несуществующего email возвращается 200 (без раскрытия факта)."""
        response = await client.post(
            "/auth/password-reset",
            json={"email": "nonexistent@example.com"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "message" in data


@pytest.mark.django_db
class TestPasswordResetConfirm:
    """Тесты для POST /auth/password-reset/confirm."""

    @pytest.fixture
    def client(self, api_client):
        return api_client

    async def test_password_reset_confirm_success(self, client, test_user):
        """Успешная смена пароля по токену из письма."""
        token = generate_password_reset_token(test_user)
        response = await client.post(
            "/auth/password-reset/confirm",
            json={
                "token": token,
                "new_password1": "NewSecurePass123!",
                "new_password2": "NewSecurePass123!",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data.get("message") == "Password has been reset successfully"
        login_response = await client.post(
            "/auth/login",
            json={
                "email": test_user.email,
                "password": "NewSecurePass123!",
                "use_cookies": False,
            },
        )
        assert login_response.status_code == 200

    async def test_password_reset_confirm_invalid_token(self, client):
        """Неверный токен — 401."""
        response = await client.post(
            "/auth/password-reset/confirm",
            json={
                "token": "invalid.jwt.token",
                "new_password1": "NewPass123!",
                "new_password2": "NewPass123!",
            },
        )

        assert response.status_code == 401
        data = response.json()
        assert data["status"] == 401
        assert "token" in data.get("code", "").lower() or "invalid" in data.get("detail", "").lower()

    async def test_password_reset_confirm_password_mismatch(self, client, test_user):
        """Пароли не совпадают — 400."""
        token = generate_password_reset_token(test_user)
        response = await client.post(
            "/auth/password-reset/confirm",
            json={
                "token": token,
                "new_password1": "NewPass123!",
                "new_password2": "OtherPass123!",
            },
        )

        assert response.status_code == 400
        data = response.json()
        assert data["status"] == 400
        assert data["code"] == "ACCOUNTS_PASSWORD_MISMATCH"

    async def test_password_reset_confirm_weak_password(self, client, test_user):
        """Слабый пароль — 400."""
        token = generate_password_reset_token(test_user)
        response = await client.post(
            "/auth/password-reset/confirm",
            json={
                "token": token,
                "new_password1": "123",
                "new_password2": "123",
            },
        )

        assert response.status_code == 400
        data = response.json()
        assert data["status"] == 400
        assert data["code"] == "ACCOUNTS_PASSWORD_VALIDATION_FAILED"
