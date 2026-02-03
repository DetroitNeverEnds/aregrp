"""
Smoke тесты для эндпоинтов профиля.
"""
import pytest
from ninja.testing import TestAsyncClient

from asgiref.sync import sync_to_async
from api.router import api
from apps.accounts.models import CustomUser


@pytest.mark.django_db
class TestProfileEndpoints:
    """Тесты для эндпоинтов профиля."""

    async def get_authenticated_client(self, api_client, email, password):
        """Создает аутентифицированный клиент."""
        login_response = await api_client.post(
            "/auth/login",
            json={"email": email, "password": password, "use_cookies": False}
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        api_client.headers = {"Authorization": f"Bearer {token}"}
        return api_client

    async def test_get_user(self, api_client, test_user):
        """Тест получения данных пользователя."""
        client = await self.get_authenticated_client(api_client, test_user.email, "TestPassword123!")
        response = await client.get("/profile/user")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["user_type"] == "individual"
        assert data["full_name"] == "Тестовый Пользователь"
        assert data["phone"] == test_user.phone
    
    async def test_get_user_unauthorized(self, api_client):
        """Тест получения данных без авторизации."""
        api_client.headers = {}
        api_client.cookies = {}
        response = await api_client.get("/profile/user")
        assert response.status_code == 401

    async def test_update_profile(self, api_client, test_user):
        """Тест обновления профиля."""
        client = await self.get_authenticated_client(api_client, test_user.email, "TestPassword123!")
        response = await client.put(
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
        
        user = await sync_to_async(CustomUser.objects.get)(email=test_user.email)
        assert user.full_name == "Обновленное Имя"
        assert user.phone == "+79991234599"
    
    async def test_update_profile_agent(self, api_client, test_agent_user):
        """Тест обновления профиля агента."""
        client = await self.get_authenticated_client(api_client, test_agent_user.email, "TestPassword123!")
        response = await client.put(
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
        
        user = await sync_to_async(CustomUser.objects.get)(email=test_agent_user.email)
        assert user.organization_name == "Новое Название ООО"
        assert user.inn == "9876543210"
    
    async def test_update_profile_unauthorized(self, api_client):
        """Тест обновления профиля без авторизации."""
        api_client.headers = {}
        api_client.cookies = {}
        response = await api_client.put(
            "/profile/profile",
            json={
                "full_name": "Новое Имя"
            }
        )
        
        assert response.status_code == 401
    
    async def test_change_password(self, api_client, test_user):
        """Тест смены пароля: успешная смена и вход с новым паролем."""
        client = await self.get_authenticated_client(api_client, test_user.email, "TestPassword123!")
        response = await client.post(
            "/profile/change-password",
            json={
                "current_password": "TestPassword123!",
                "new_password1": "NewPassword456!",
                "new_password2": "NewPassword456!",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data.get("message") == "Password changed successfully"

        api_client.headers = {}
        login_old = await api_client.post(
            "/auth/login",
            json={"email": test_user.email, "password": "TestPassword123!", "use_cookies": False},
        )
        assert login_old.status_code == 401
        login_new = await api_client.post(
            "/auth/login",
            json={"email": test_user.email, "password": "NewPassword456!", "use_cookies": False},
        )
        assert login_new.status_code == 200

    async def test_change_password_wrong_current(self, api_client, test_user):
        """Тест смены пароля с неверным текущим паролем — 400."""
        client = await self.get_authenticated_client(api_client, test_user.email, "TestPassword123!")
        response = await client.post(
            "/profile/change-password",
            json={
                "current_password": "WrongCurrentPass!",
                "new_password1": "NewPassword456!",
                "new_password2": "NewPassword456!",
            },
        )

        assert response.status_code == 400
        data = response.json()
        assert data["status"] == 400
        assert data["code"] == "ACCOUNTS_INVALID_CURRENT_PASSWORD"

    async def test_change_password_mismatch(self, api_client, test_user):
        """Тест смены пароля при несовпадении новых паролей — 400."""
        client = await self.get_authenticated_client(api_client, test_user.email, "TestPassword123!")
        response = await client.post(
            "/profile/change-password",
            json={
                "current_password": "TestPassword123!",
                "new_password1": "NewPassword456!",
                "new_password2": "OtherPassword789!",
            },
        )

        assert response.status_code == 400
        data = response.json()
        assert data["status"] == 400
        assert data["code"] == "ACCOUNTS_PASSWORD_MISMATCH"

    async def test_change_password_unauthorized(self, api_client):
        """Тест смены пароля без авторизации — 401."""
        api_client.headers = {}
        api_client.cookies = {}
        response = await api_client.post(
            "/profile/change-password",
            json={
                "current_password": "TestPassword123!",
                "new_password1": "NewPass123!",
                "new_password2": "NewPass123!",
            },
        )
        assert response.status_code == 401
