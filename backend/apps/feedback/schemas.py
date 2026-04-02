from datetime import datetime

from ninja import Field, Schema


class FeedbackCreateIn(Schema):
    name: str = Field(..., min_length=1, max_length=200)
    email: str = Field(default='', max_length=100)
    phone: str = Field(..., min_length=1, max_length=20)
    subject: str = Field(..., min_length=1, max_length=200)
    message: str = Field(default='')


class FeedbackOut(Schema):
    id: int
    name: str
    email: str
    phone: str
    subject: str
    message: str
    status: str
    created_at: datetime
