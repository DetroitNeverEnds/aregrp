from ninja import Schema
from typing import Optional


class UserRegistrationIn(Schema):
    user_type: str  # 'individual' или 'agent'
    full_name: str
    email: str
    phone: str
    password1: str
    password2: str
    use_cookies: bool = False
    
    # Поля для агентов (опциональные)
    organization_name: Optional[str] = None
    inn: Optional[str] = None


class UserLoginIn(Schema):
    email: str
    password: str
    use_cookies: bool = False


class UserOut(Schema):
    id: int
    username: str
    email: str
    user_type: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    organization_name: Optional[str] = None
    inn: Optional[str] = None


class AuthOut(Schema):
    user: UserOut
    access_token: str
    refresh_token: str
    message: str
    use_cookies: bool


class PasswordResetIn(Schema):
    email: str


class PasswordResetConfirmIn(Schema):
    token: str
    new_password1: str
    new_password2: str

