"""
Smoke тесты для эндпоинтов профиля.
"""
from datetime import timedelta

import pytest
from asgiref.sync import sync_to_async
from django.test import override_settings
from django.utils import timezone

from apps.accounts.models import CustomUser
from apps.bookings.models import Booking
from apps.deals.models import Deal
from apps.re_objects.models import Premise


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

    async def test_profile_premises_unauthorized(self, api_client):
        """Список объектов ЛК без JWT — 401."""
        api_client.headers = {}
        api_client.cookies = {}
        response = await api_client.get('/profile/premises', query_params={'query': 'rent'})
        assert response.status_code == 401

    async def test_profile_premises_invalid_query(self, api_client, test_user):
        """Неверный query — 400 DEALS_INVALID_DEAL_TYPE."""
        client = await self.get_authenticated_client(api_client, test_user.email, 'TestPassword123!')
        response = await client.get('/profile/premises', query_params={'query': 'lease'})
        assert response.status_code == 400
        assert response.json()['code'] == 'DEALS_INVALID_DEAL_TYPE'

    async def test_profile_premises_rent_empty(self, api_client, test_user):
        """Нет сделок — пустой items и поля пагинации."""
        client = await self.get_authenticated_client(api_client, test_user.email, 'TestPassword123!')
        response = await client.get('/profile/premises', query_params={'query': 'rent'})
        assert response.status_code == 200
        assert response.json() == {
            'items': [],
            'total': 0,
            'page': 1,
            'page_size': 20,
            'total_pages': 0,
        }

    async def test_profile_premises_rent_individual(self, api_client, test_user, building_with_premise):
        """Сделка аренды: строка без комиссии у физлица."""
        _, premise = building_with_premise
        expires = timezone.now().date() + timedelta(days=30)

        def create_deal():
            return Deal.objects.create(
                user_id=test_user.id,
                premise=premise,
                deal_type=Deal.DealType.RENT,
                rent_expires_at=expires,
                commission_amount=99_000,
            )

        await sync_to_async(create_deal)()
        client = await self.get_authenticated_client(api_client, test_user.email, 'TestPassword123!')
        response = await client.get('/profile/premises', query_params={'query': 'rent'})
        assert response.status_code == 200
        payload = response.json()
        assert payload['total'] == 1
        assert payload['page'] == 1
        assert payload['page_size'] == 20
        assert payload['total_pages'] == 1
        assert len(payload['items']) == 1
        row = payload['items'][0]
        assert row['premise']['uuid'] == str(premise.uuid)
        assert row['premise']['name'] == '101'
        assert row['building']['name'] == 'БЦ Тестовый'
        assert row['commission'] is None
        assert row['rent_expires_at'] is not None
        assert row['contract_type'] is None
        assert row['contract_signed_on'] is None

    async def test_profile_premises_rent_agent_commission(self, api_client, test_agent_user, building_with_premise):
        """У агента в ответе есть commission."""
        _, premise = building_with_premise
        expires = timezone.now().date() + timedelta(days=7)

        def create_deal():
            return Deal.objects.create(
                user_id=test_agent_user.id,
                premise=premise,
                deal_type=Deal.DealType.RENT,
                rent_expires_at=expires,
                commission_amount=20_000,
            )

        await sync_to_async(create_deal)()
        client = await self.get_authenticated_client(api_client, test_agent_user.email, 'TestPassword123!')
        response = await client.get('/profile/premises', query_params={'query': 'rent'})
        assert response.status_code == 200
        row = response.json()['items'][0]
        assert row['commission'] == 20_000

    async def test_profile_premises_sale_contract(self, api_client, test_user, building_with_premise):
        """Продажа: тип договора — человекочитаемая подпись."""
        _, premise = building_with_premise
        end = timezone.now().date() + timedelta(days=365)

        def create_deal():
            return Deal.objects.create(
                user_id=test_user.id,
                premise=premise,
                deal_type=Deal.DealType.SALE,
                contract_type=Deal.ContractType.PDKP,
                contract_signed_on=end,
                commission_amount=50_000,
            )

        await sync_to_async(create_deal)()
        client = await self.get_authenticated_client(api_client, test_user.email, 'TestPassword123!')
        response = await client.get('/profile/premises', query_params={'query': 'sale'})
        assert response.status_code == 200
        row = response.json()['items'][0]
        assert row['contract_type'] == 'ПДКП'
        assert row['rent_expires_at'] is None
        assert row['contract_signed_on'] is not None

    async def test_profile_premises_pagination(self, api_client, test_user, building_with_premise):
        """Вторая страница при page_size=1 — вторая из двух сделок (разные помещения)."""
        _, premise = building_with_premise
        expires = timezone.now().date() + timedelta(days=30)

        def create_two():
            p2 = Premise.objects.create(
                building=premise.building,
                city=premise.city,
                floor=premise.floor,
                area=40,
                price_per_month=50_000,
                available_for_rent=True,
                number='102',
            )
            Deal.objects.create(
                user_id=test_user.id,
                premise=premise,
                deal_type=Deal.DealType.RENT,
                rent_expires_at=expires,
                commission_amount=10_000,
            )
            Deal.objects.create(
                user_id=test_user.id,
                premise=p2,
                deal_type=Deal.DealType.RENT,
                rent_expires_at=expires,
                commission_amount=10_000,
            )

        await sync_to_async(create_two)()
        client = await self.get_authenticated_client(api_client, test_user.email, 'TestPassword123!')
        r1 = await client.get(
            '/profile/premises',
            query_params={'query': 'rent', 'page': 1, 'page_size': 1},
        )
        r2 = await client.get(
            '/profile/premises',
            query_params={'query': 'rent', 'page': 2, 'page_size': 1},
        )
        assert r1.status_code == 200 and r2.status_code == 200
        j1, j2 = r1.json(), r2.json()
        assert j1['total'] == 2
        assert j1['total_pages'] == 2
        assert j1['page'] == 1
        assert j2['page'] == 2
        assert len(j1['items']) == 1
        assert len(j2['items']) == 1
        assert j1['items'][0]['premise']['uuid'] != j2['items'][0]['premise']['uuid']

    @override_settings(BOOKINGS_LIST_ONLY_ACTIVE=True)
    async def test_profile_bookings_only_non_expired(self, api_client, test_user, building_with_premise):
        """По умолчанию в списке только брони с expires_at > now."""
        _, premise = building_with_premise
        now = timezone.now()

        def seed():
            Booking.objects.create(
                user_id=test_user.id,
                premise=premise,
                deal_type=Booking.DealType.RENT,
                expires_at=now - timedelta(hours=1),
            )
            Booking.objects.create(
                user_id=test_user.id,
                premise=premise,
                deal_type=Booking.DealType.RENT,
                expires_at=now + timedelta(days=1),
            )

        await sync_to_async(seed)()
        client = await self.get_authenticated_client(api_client, test_user.email, 'TestPassword123!')
        response = await client.get('/profile/bookings')
        assert response.status_code == 200
        items = response.json()
        assert len(items) == 1
        assert items[0]['expires_at'] is not None

    @override_settings(BOOKINGS_LIST_ONLY_ACTIVE=False)
    async def test_profile_bookings_includes_expired_when_setting_off(
        self, api_client, test_user, building_with_premise
    ):
        """При BOOKINGS_LIST_ONLY_ACTIVE=False отдаются и истёкшие брони."""
        _, premise = building_with_premise
        now = timezone.now()

        def seed():
            Booking.objects.create(
                user_id=test_user.id,
                premise=premise,
                deal_type=Booking.DealType.RENT,
                expires_at=now - timedelta(hours=1),
            )
            Booking.objects.create(
                user_id=test_user.id,
                premise=premise,
                deal_type=Booking.DealType.RENT,
                expires_at=now + timedelta(days=1),
            )

        await sync_to_async(seed)()
        client = await self.get_authenticated_client(api_client, test_user.email, 'TestPassword123!')
        response = await client.get('/profile/bookings')
        assert response.status_code == 200
        assert len(response.json()) == 2
