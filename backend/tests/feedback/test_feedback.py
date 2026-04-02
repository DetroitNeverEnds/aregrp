"""Тесты POST /feedback — создание обращения."""

import pytest
from asgiref.sync import sync_to_async

from apps.feedback.models import Feedback


@pytest.mark.django_db(transaction=True)
class TestFeedbackCreate:
    async def test_create_feedback_success(self, api_client):
        payload = {
            'name': 'Иван',
            'email': 'ivan@example.com',
            'phone': '+79990001122',
            'subject': 'Вопрос',
            'message': 'Текст обращения',
        }
        response = await api_client.post('/feedback/', json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data['name'] == 'Иван'
        assert data['email'] == 'ivan@example.com'
        assert data['phone'] == '+79990001122'
        assert data['subject'] == 'Вопрос'
        assert data['message'] == 'Текст обращения'
        assert data['status'] == 'new'
        assert 'id' in data
        assert 'created_at' in data

        count = await sync_to_async(Feedback.objects.filter(id=data['id']).count)()
        assert count == 1

    async def test_create_feedback_phone_optional(self, api_client):
        response = await api_client.post(
            '/feedback/',
            json={
                'name': 'Мария',
                'email': 'maria@example.com',
                'subject': 'Без телефона',
                'message': 'Сообщение',
            },
        )
        assert response.status_code == 201
        assert response.json()['phone'] == ''

    async def test_create_feedback_validation_empty_message(self, api_client):
        response = await api_client.post(
            '/feedback/',
            json={
                'name': 'Мария',
                'email': 'maria@example.com',
                'subject': 'Тема',
                'message': '',
            },
        )
        assert response.status_code == 422
