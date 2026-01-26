from ninja import Schema
from typing import Optional


class UserOut(Schema):
    id: int
    username: str
    email: str
    user_type: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    organization_name: Optional[str] = None
    inn: Optional[str] = None


class UpdateProfileIn(Schema):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    organization_name: Optional[str] = None
    inn: Optional[str] = None


class UpdatePasswordIn(Schema):
    current_password: str
    new_password1: str
    new_password2: str

