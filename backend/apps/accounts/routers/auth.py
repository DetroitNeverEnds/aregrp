from ninja import Router
from asgiref.sync import sync_to_async
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.db import IntegrityError
from django.conf import settings
from django.http import JsonResponse
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError

from api.schemas import ProblemDetail
from ..errors import create_accounts_error, AccountsErrorCodes

from ..schemas.auth import (
    UserRegistrationIn, UserLoginIn, UserOut, AuthOut, 
    PasswordResetIn, PasswordResetConfirmIn
)
from ..models import CustomUser
from ..services.auth_service import jwt_auth, generate_jwt_tokens, generate_password_reset_token, verify_password_reset_token
from ..services.email_service import send_password_reset_email
from ..services.utils import get_user_data


auth_router = Router()


@auth_router.post("/register", response={200: AuthOut, 400: ProblemDetail})
async def register(request, data: UserRegistrationIn):  # pylint: disable=unused-argument
    """
    Регистрация нового пользователя
    
    Создает нового пользователя в системе с указанными данными.
    Поддерживает регистрацию физических лиц и агентов.
    Автоматически генерирует JWT токены для аутентификации.
    
    **Параметры:**
    - `user_type`: Тип пользователя ('individual' или 'agent')
    - `full_name`: Полное имя пользователя
    - `email`: Email адрес (уникальный, используется как username)
    - `phone`: Номер телефона
    - `password1`: Пароль
    - `password2`: Подтверждение пароля
    - `organization_name`: Название организации (обязательно для агентов)
    - `inn`: ИНН (обязательно для агентов)
    - `use_cookies`: Установить токены в HTTP-Only cookies (опционально)
    
    **Пример запроса для физического лица:**
    ```json
    {
        "user_type": "individual",
        "full_name": "Иван Иванов",
        "email": "ivan@example.com",
        "phone": "+79991234567",
        "password1": "securepassword123",
        "password2": "securepassword123",
        "use_cookies": false
    }
    ```

    **Пример запроса для агента:**
    ```json
    {
        "user_type": "agent",
        "full_name": "Иван Иванов",
        "email": "agent@example.com",
        "phone": "+79991234567",
        "password1": "securepassword123",
        "password2": "securepassword123",
        "organization_name": "ООО Рога и Копыта",
        "inn": "1234567890",
        "use_cookies": false
    }
    ```

    **Пример ответа:**
    ```json
    {
        "user": {
            "id": 1,
            "username": "ivan@example.com",
            "email": "ivan@example.com",
            "user_type": "individual",
            "full_name": "Иван Иванов",
            "phone": "+79991234567"
        },
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "message": "User successfully registered",
        "use_cookies": false
    }
    ```
    
    **Коды ошибок:**
    - `400`: Пароли не совпадают, пользователь уже существует, ошибка валидации пароля,
             не указаны обязательные поля для агента
    """
    try:
        # Валидация типа пользователя
        if data.user_type not in ['individual', 'agent']:
            return 400, create_accounts_error(
                status=400,
                code=AccountsErrorCodes.INVALID_USER_TYPE,
                title="Invalid user type",
                detail="User type must be 'individual' or 'agent'",
                instance="/api/v1/auth/register"
            )
        
        # Валидация полей для агентов
        if data.user_type == 'agent':
            if not data.organization_name:
                return 400, create_accounts_error(
                    status=400,
                    code=AccountsErrorCodes.MISSING_ORGANIZATION_NAME,
                    title="Missing organization name",
                    detail="Organization name is required for agents",
                    instance="/api/v1/auth/register"
                )
            if not data.inn:
                return 400, create_accounts_error(
                    status=400,
                    code=AccountsErrorCodes.MISSING_INN,
                    title="Missing INN",
                    detail="INN is required for agents",
                    instance="/api/v1/auth/register"
                )
        
        # Валидация паролей
        if data.password1 != data.password2:
            return 400, create_accounts_error(
                status=400,
                code=AccountsErrorCodes.PASSWORD_MISMATCH,
                title="Passwords do not match",
                detail="The provided passwords do not match",
                instance="/api/v1/auth/register"
            )
        
        try:
            validate_password(data.password1)
        except ValidationError as e:
            return 400, create_accounts_error(
                status=400,
                code=AccountsErrorCodes.PASSWORD_VALIDATION_FAILED,
                title="Password validation failed",
                detail=f"Password validation failed: {'; '.join(e.messages)}",
                instance="/api/v1/auth/register"
            )
        
        # Проверяем уникальность email
        email_exists = await CustomUser.objects.filter(email=data.email).aexists()
        if email_exists:
            return 400, create_accounts_error(
                status=400,
                code=AccountsErrorCodes.EMAIL_EXISTS,
                title="Email already exists",
                detail=f"User with email '{data.email}' already exists",
                instance="/api/v1/auth/register"
            )
        
        # Проверяем уникальность телефона (если указан)
        if data.phone:
            phone_exists = await CustomUser.objects.filter(phone=data.phone).aexists()
            if phone_exists:
                return 400, create_accounts_error(
                    status=400,
                    code=AccountsErrorCodes.PHONE_EXISTS,
                    title="Phone number already exists",
                    detail=f"User with phone number '{data.phone}' already exists",
                    instance="/api/v1/auth/register"
                )
        
        # Генерируем username из email (до символа @)
        username = data.email.split('@')[0]
        
        # Создаем пользователя
        try:
            user = await sync_to_async(CustomUser.objects.create_user)(
                username=username,
                email=data.email,
                password=data.password1
            )
            
            # Устанавливаем дополнительные поля
            user.user_type = data.user_type
            user.full_name = data.full_name
            user.phone = data.phone
            
            if data.user_type == 'agent':
                user.organization_name = data.organization_name
                user.inn = data.inn
            
            await user.asave()
            
        except IntegrityError as e:
            error_msg = str(e)
            if 'email' in error_msg.lower():
                return 400, create_accounts_error(
                    status=400,
                    code=AccountsErrorCodes.EMAIL_EXISTS,
                    title="Email already exists",
                    detail="User with this email already exists",
                    instance="/api/v1/auth/register"
                )
            elif 'phone' in error_msg.lower():
                return 400, create_accounts_error(
                    status=400,
                    code=AccountsErrorCodes.PHONE_EXISTS,
                    title="Phone number already exists",
                    detail="User with this phone number already exists",
                    instance="/api/v1/auth/register"
                )
            return 400, create_accounts_error(
                status=400,
                code=AccountsErrorCodes.REGISTRATION_ERROR,
                title="Registration error",
                detail="User with this email or phone already exists",
                instance="/api/v1/auth/register"
            )
        
        access_token, refresh_token_value = generate_jwt_tokens(user)
        
        response_data = {
            "user": get_user_data(user),
            "access_token": access_token,
            "refresh_token": refresh_token_value,
            "message": "User successfully registered",
            "use_cookies": data.use_cookies
        }
        
        # Если запрошены cookies, устанавливаем их
        if data.use_cookies:
            response = JsonResponse(response_data)
            response.set_cookie(
                'access_token',
                access_token,
                max_age=settings.ACCESS_TOKEN_LIFETIME_MINUTES * 60,
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax',
                path='/'
            )
            response.set_cookie(
                'refresh_token',
                refresh_token_value,
                max_age=settings.REFRESH_TOKEN_LIFETIME_DAYS * 24 * 60 * 60,
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax',
                path='/'
            )
            return response
        
        return 200, response_data
        
    except Exception as e:
        return 400, create_accounts_error(
            status=400,
            code=AccountsErrorCodes.REGISTRATION_ERROR,
            title="Registration failed",
            detail=f"Registration failed: {str(e)}",
            instance="/api/v1/auth/register"
        )


@auth_router.post("/login", response={200: AuthOut, 400: ProblemDetail, 401: ProblemDetail})
async def login_user(request, data: UserLoginIn):
    """
    Вход в систему
    
    Аутентифицирует пользователя по email и паролю.
    Возвращает JWT токены для доступа к защищенным эндпоинтам.
    
    **Параметры:**
    - `email`: Email адрес пользователя
    - `password`: Пароль
    - `use_cookies`: Установить токены в HTTP-Only cookies (опционально)
    
    **Пример запроса:**
    ```json
    {
        "email": "test@example.com",
        "password": "securepassword123",
        "use_cookies": false
    }
    ```
    
    **Пример ответа:**
    ```json
    {
        "user": {
            "id": 1,
            "username": "test",
            "email": "test@example.com"
        },
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "message": "Login successful",
        "use_cookies": false
    }
    ```
    
    **Коды ошибок:**
    - `400`: Ошибка сервера
    - `401`: Неверные учетные данные
    """
    try:
        # Ищем пользователя по email
        try:
            user = await CustomUser.objects.aget(email=data.email)
        except CustomUser.DoesNotExist:  # type: ignore
            return 401, create_accounts_error(
                status=401,
                code=AccountsErrorCodes.INVALID_CREDENTIALS,
                title="Invalid credentials",
                detail="Invalid email or password",
                instance="/api/v1/auth/login"
            )
        
        # Проверяем пароль
        is_valid = await sync_to_async(user.check_password)(data.password)
        
        if not is_valid:
            return 401, create_accounts_error(
                status=401,
                code=AccountsErrorCodes.INVALID_CREDENTIALS,
                title="Invalid credentials",
                detail="Invalid email or password",
                instance="/api/v1/auth/login"
            )
        
        access_token, refresh_token_value = generate_jwt_tokens(user)
        
        response_data = {
            "user": get_user_data(user),
            "access_token": access_token,
            "refresh_token": refresh_token_value,
            "message": "Login successful",
            "use_cookies": data.use_cookies
        }
        
        # Если запрошены cookies, устанавливаем их
        if data.use_cookies:
            response = JsonResponse(response_data)
            response.set_cookie(
                'access_token',
                access_token,
                max_age=settings.ACCESS_TOKEN_LIFETIME_MINUTES * 60,
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax',
                path='/'
            )
            response.set_cookie(
                'refresh_token',
                refresh_token_value,
                max_age=settings.REFRESH_TOKEN_LIFETIME_DAYS * 24 * 60 * 60,
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax',
                path='/'
            )
            return response
        
        return 200, response_data
        
    except Exception as e:
        return 400, create_accounts_error(
            status=400,
            code=AccountsErrorCodes.LOGIN_ERROR,
            title="Login failed",
            detail=f"Login failed: {str(e)}",
            instance="/api/v1/auth/login"
        )


@auth_router.post("/logout", response={200: dict, 400: ProblemDetail, 401: ProblemDetail}, auth=jwt_auth)
async def logout_user(request):  # pylint: disable=unused-argument
    """
    Выход из системы
    
    Очищает HTTP-Only cookies и завершает сессию пользователя.
    Удаляет access и refresh токены из cookies.
    
    **Требует аутентификации:** Bearer JWT токен в заголовке Authorization
    
    **Пример запроса:**
    ```
    POST /api/v1/auth/logout
    Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
    ```

    **Пример ответа:**
    ```json
    {
        "message": "Logout successful"
    }
    ```
    
    **Коды ошибок:**
    - `401`: Не авторизован
    """
    try:
        # Очищаем cookies
        response = JsonResponse({"message": "Logout successful"})
        response.delete_cookie('access_token', path='/')
        response.delete_cookie('refresh_token', path='/')
        return response
        
    except Exception as e:
        return 400, create_accounts_error(
            status=400,
            code=AccountsErrorCodes.REGISTRATION_ERROR,
            title="Logout error",
            detail=f"Logout error: {str(e)}",
            instance="/api/v1/auth/logout"
        )


@auth_router.post("/refresh-token", response={200: dict, 400: ProblemDetail, 401: ProblemDetail})
async def refresh_token(request):
    """
    Обновить JWT токены
    
    Обновляет access и refresh токены используя refresh токен из HTTP-Only cookies.
    Устанавливает новые токены обратно в cookies.
    
    **Требует:** Refresh токен в HTTP-Only cookie
    
    **Пример запроса:**
    ```
    POST /api/v1/auth/refresh-token
    Cookie: refresh_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
    ```
    
    **Пример ответа:**
    ```json
    {
        "message": "Tokens refreshed successfully",
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
    ```
    
    **Коды ошибок:**
    - `401`: Refresh токен не найден, истек или неверный
    """
    try:
        # Получаем refresh токен из cookies
        refresh_token_value = request.COOKIES.get('refresh_token')
        
        if not refresh_token_value:
            return 401, create_accounts_error(
                status=401,
                code=AccountsErrorCodes.NO_REFRESH_TOKEN,
                title="Refresh token not found",
                detail="Refresh token not found in cookies",
                instance="/api/v1/auth/refresh-token"
            )
        
        # Декодируем и проверяем токен
        try:
            payload = jwt.decode(refresh_token_value, settings.SECRET_KEY, algorithms=['HS256'])
            
            # Проверяем тип токена (должен быть refresh)
            if payload.get('type') != 'refresh':
                return 401, create_accounts_error(
                    status=401,
                    code=AccountsErrorCodes.INVALID_TOKEN,
                    title="Invalid token type",
                    detail="Invalid token type. Expected refresh token",
                    instance="/api/v1/auth/refresh-token"
                )
            
            user_id = payload.get('user_id')
            
            if not user_id:
                return 401, create_accounts_error(
                    status=401,
                    code=AccountsErrorCodes.INVALID_TOKEN,
                    title="Invalid refresh token",
                    detail="Invalid refresh token",
                    instance="/api/v1/auth/refresh-token"
                )
            
            # Получаем пользователя асинхронно
            user = await CustomUser.objects.aget(id=user_id)
            
        except ExpiredSignatureError:
            return 401, create_accounts_error(
                status=401,
                code=AccountsErrorCodes.TOKEN_EXPIRED,
                title="Token expired",
                detail="Refresh token expired",
                instance="/api/v1/auth/refresh-token"
            )
        except InvalidTokenError:
            return 401, create_accounts_error(
                status=401,
                code=AccountsErrorCodes.INVALID_TOKEN,
                title="Invalid token",
                detail="Invalid refresh token",
                instance="/api/v1/auth/refresh-token"
            )
        except CustomUser.DoesNotExist:  # type: ignore
            return 401, create_accounts_error(
                status=401,
                code=AccountsErrorCodes.USER_NOT_FOUND,
                title="User not found",
                detail="User not found",
                instance="/api/v1/auth/refresh-token"
            )
        
        # Генерируем новые токены
        access_token, new_refresh_token = generate_jwt_tokens(user)
        
        # Устанавливаем новые cookies
        response = JsonResponse({
            "message": "Tokens refreshed successfully",
            "access_token": access_token,
            "refresh_token": new_refresh_token
        })
        
        # Устанавливаем HTTP-Only cookies
        response.set_cookie(
            'access_token',
            access_token,
            max_age=settings.ACCESS_TOKEN_LIFETIME_MINUTES * 60,
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            path='/'
        )
        
        response.set_cookie(
            'refresh_token',
            new_refresh_token,
            max_age=settings.REFRESH_TOKEN_LIFETIME_DAYS * 24 * 60 * 60,
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            path='/'
        )
        
        return response
        
    except Exception as e:
        return 400, create_accounts_error(
            status=400,
            code=AccountsErrorCodes.REGISTRATION_ERROR,
            title="Token refresh error",
            detail=f"Token refresh error: {str(e)}",
            instance="/api/v1/auth/refresh-token"
        )


@auth_router.post("/password-reset", response={200: dict, 400: ProblemDetail})
async def password_reset(request, data: PasswordResetIn):  # pylint: disable=unused-argument
    """
    Запрос сброса пароля
    
    Отправляет email с токеном для сброса пароля на указанный email адрес.
    Если пользователь с таким email не найден, возвращает успешный ответ
    (для безопасности не раскрываем информацию о существовании пользователя).
    
    **Параметры:**
    - `email`: Email адрес пользователя
    
    **Пример запроса:**
    ```json
    {
        "email": "user@example.com"
    }
    ```
    
    **Пример ответа:**
    ```json
    {
        "message": "If an account with this email exists, a password reset link has been sent."
    }
    ```
    
    **Коды ошибок:**
    - `400`: Ошибка отправки email
    """
    try:
        # Ищем пользователя по email асинхронно
        try:
            user = await CustomUser.objects.aget(email=data.email)
        except CustomUser.DoesNotExist:  # type: ignore
            # Для безопасности возвращаем успешный ответ даже если пользователь не найден
            return 200, {
                "message": "If an account with this email exists, a password reset link has been sent."
            }
        
        # Генерируем токен сброса пароля
        token = generate_password_reset_token(user)
        
        # Отправляем email асинхронно
        email_sent = await send_password_reset_email(user, token)
        
        if not email_sent:
            return 400, create_accounts_error(
                status=400,
                code=AccountsErrorCodes.PASSWORD_RESET_ERROR,
                title="Email send failed",
                detail="Failed to send password reset email",
                instance="/api/v1/auth/password-reset"
            )
        
        return 200, {
            "message": "If an account with this email exists, a password reset link has been sent."
        }
        
    except Exception as e:
        return 400, create_accounts_error(
            status=400,
            code=AccountsErrorCodes.PASSWORD_RESET_ERROR,
            title="Password reset failed",
            detail=f"Password reset request failed: {str(e)}",
            instance="/api/v1/auth/password-reset"
        )


@auth_router.post("/password-reset/confirm", response={200: dict, 400: ProblemDetail, 401: ProblemDetail})
async def password_reset_confirm(request, data: PasswordResetConfirmIn):  # pylint: disable=unused-argument
    """
    Подтверждение сброса пароля
    
    Устанавливает новый пароль используя токен из email.
    
    **Параметры:**
    - `token`: JWT токен для сброса пароля (из email)
    - `new_password1`: Новый пароль
    - `new_password2`: Подтверждение нового пароля
    
    **Пример запроса:**
    ```json
    {
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "new_password1": "newpassword123",
        "new_password2": "newpassword123"
    }
    ```
    
    **Пример ответа:**
    ```json
    {
        "message": "Password has been reset successfully"
    }
    ```
    
    **Коды ошибок:**
    - `400`: Пароли не совпадают, ошибка валидации пароля, неверный токен
    - `401`: Токен истек или неверный
    """
    try:
        # Проверяем токен
        user_id, email = verify_password_reset_token(data.token)
        
        if not user_id or not email:
            return 401, create_accounts_error(
                status=401,
                code=AccountsErrorCodes.PASSWORD_RESET_TOKEN_INVALID,
                title="Invalid token",
                detail="Invalid or expired password reset token",
                instance="/api/v1/auth/password-reset/confirm"
            )
        
        # Получаем пользователя асинхронно
        try:
            user = await CustomUser.objects.aget(id=user_id, email=email)
        except CustomUser.DoesNotExist:  # type: ignore
            return 401, create_accounts_error(
                status=401,
                code=AccountsErrorCodes.USER_NOT_FOUND,
                title="User not found",
                detail="User not found",
                instance="/api/v1/auth/password-reset/confirm"
            )
        
        # Проверяем совпадение паролей
        if data.new_password1 != data.new_password2:
            return 400, create_accounts_error(
                status=400,
                code=AccountsErrorCodes.PASSWORD_MISMATCH,
                title="Passwords do not match",
                detail="The provided passwords do not match",
                instance="/api/v1/auth/password-reset/confirm"
            )
        
        # Валидируем новый пароль
        try:
            validate_password(data.new_password1, user)
        except ValidationError as e:
            return 400, create_accounts_error(
                status=400,
                code=AccountsErrorCodes.PASSWORD_VALIDATION_FAILED,
                title="Password validation failed",
                detail=f"Password validation failed: {'; '.join(e.messages)}",
                instance="/api/v1/auth/password-reset/confirm"
            )
        
        # Устанавливаем новый пароль и сохраняем асинхронно
        user.set_password(data.new_password1)
        await user.asave()
        
        return 200, {"message": "Password has been reset successfully"}
        
    except Exception as e:
        return 400, create_accounts_error(
            status=400,
            code=AccountsErrorCodes.PASSWORD_RESET_ERROR,
            title="Password reset confirmation failed",
            detail=f"Password reset confirmation failed: {str(e)}",
            instance="/api/v1/auth/password-reset/confirm"
        )

