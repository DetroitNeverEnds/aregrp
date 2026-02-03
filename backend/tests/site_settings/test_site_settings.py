"""
Тесты для эндпоинтов настроек сайта (site-settings).
"""
import pytest
from asgiref.sync import sync_to_async
from ninja.testing import TestAsyncClient

from api.router import api
from apps.site_settings.models import MainSettings, ContactsSettings


def _create_main_settings():
    obj = MainSettings(
        phone="+79990001122",
        display_phone="8 (999) 000-11-22",
        email="site@example.com",
        description="Тестовое описание организации",
        org_name="ООО Тест",
        inn="7707083893",
        whatsapp_link="https://wa.me/79990001122",
        telegram_link="https://t.me/test",
    )
    obj.save()
    return obj


def _create_contacts_settings():
    obj = ContactsSettings(
        ogrn="1177746123456",
        legal_address="г. Москва, ул. Тестовая, д. 1",
        latitude=55.7558,
        longitude=37.6173,
        sales_center_address="г. Москва, офис продаж",
    )
    obj.save()
    return obj


@pytest.fixture
async def main_settings(db):
    """Создаёт единственный экземпляр MainSettings (ORM в sync_to_async для async-тестов)."""
    return await sync_to_async(_create_main_settings)()


@pytest.fixture
async def contacts_settings(db):
    """Создаёт единственный экземпляр ContactsSettings."""
    return await sync_to_async(_create_contacts_settings)()


@pytest.mark.django_db
class TestMainInfo:
    """Тесты для GET /site-settings/main-info."""

    async def test_main_info_success(self, api_client, main_settings):
        """Успешное получение основных настроек."""
        response = await api_client.get("/site-settings/main-info")

        assert response.status_code == 200
        data = response.json()
        assert data["phone"] == "+79990001122"
        assert data["display_phone"] == "8 (999) 000-11-22"
        assert data["email"] == "site@example.com"
        assert data["description"] == "Тестовое описание организации"
        assert data["org_name"] == "ООО Тест"
        assert data["inn"] == "7707083893"
        assert data["whatsapp_link"] == "https://wa.me/79990001122"
        assert data["telegram_link"] == "https://t.me/test"

    @pytest.fixture
    async def main_settings_fallback(self, db):
        """MainSettings без display_phone (для проверки fallback)."""
        def create():
            obj = MainSettings(
                phone="+79990003344",
                email="fallback@example.com",
                description="Desc",
            )
            obj.save()
            return obj
        return await sync_to_async(create)()

    async def test_main_info_display_phone_fallback(self, api_client, main_settings_fallback):
        """display_phone подставляется из phone, если пустой."""
        response = await api_client.get("/site-settings/main-info")

        assert response.status_code == 200
        data = response.json()
        assert data["phone"] == "+79990003344"
        assert data["display_phone"] == "+79990003344"


@pytest.mark.django_db
class TestContacts:
    """Тесты для GET /site-settings/contacts."""

    async def test_contacts_success(self, api_client, contacts_settings):
        """Успешное получение настроек контактов (реквизиты и офис)."""
        response = await api_client.get("/site-settings/contacts")

        assert response.status_code == 200
        data = response.json()
        assert data["ogrn"] == "1177746123456"
        assert data["legal_address"] == "г. Москва, ул. Тестовая, д. 1"
        assert data["sales_center_address"] == "г. Москва, офис продаж"
        assert "coordinates" in data
        assert data["coordinates"]["lat"] == 55.7558
        assert data["coordinates"]["lng"] == 37.6173

    @pytest.fixture
    async def contacts_settings_no_coords(self, db):
        """ContactsSettings без координат."""
        def create():
            obj = ContactsSettings(ogrn="123", legal_address="Адрес")
            obj.save()
            return obj
        return await sync_to_async(create)()

    async def test_contacts_coordinates_null_when_not_set(self, api_client, contacts_settings_no_coords):
        """coordinates = null, если широта/долгота не заданы."""
        response = await api_client.get("/site-settings/contacts")

        assert response.status_code == 200
        data = response.json()
        assert data["coordinates"] is None
        assert data["ogrn"] == "123"
