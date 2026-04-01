"""
Схемы API для обратной связи.
"""
from datetime import datetime

from ninja import Schema
from pydantic import Field


class FeedbackCreateIn(Schema):
    """Вход: обязательны имя, телефон и тема (источник заявки); сообщение — опционально."""

    name: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(..., min_length=1, max_length=20)
    subject: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description='Тема / источник заявки (страница, кампания, UTM и т.п.)',
    )
    message: str = Field(default='', max_length=10_000)


class FeedbackOut(Schema):
    id: int
    name: str
    email: str
    phone: str
    subject: str
    message: str
    status: str
    created_at: datetime
