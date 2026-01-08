from ninja import Schema


class UserRegistrationIn(Schema):
    username: str
    email: str
    password1: str
    password2: str
    use_cookies: bool = False


class UserLoginIn(Schema):
    username: str
    password: str
    use_cookies: bool = False


class UserOut(Schema):
    id: int
    username: str
    email: str


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


class ErrorOut(Schema):
    error: str
    message: str

