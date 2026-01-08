from ninja import Schema
from typing import Optional


class UserOut(Schema):
    id: int
    username: str
    email: str


class UpdateProfileIn(Schema):
    username: Optional[str] = None
    email: Optional[str] = None


class UpdatePasswordIn(Schema):
    current_password: str
    new_password1: str
    new_password2: str


class ErrorOut(Schema):
    error: str
    message: str

