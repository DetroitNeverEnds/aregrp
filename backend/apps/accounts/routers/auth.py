from ninja import Router
from django.contrib.auth import authenticate
from asgiref.sync import sync_to_async
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.db import IntegrityError
from django.conf import settings
from django.http import JsonResponse
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError

from ..schemas.auth import (
    UserRegistrationIn, UserLoginIn, UserOut, AuthOut, 
    ErrorOut, PasswordResetIn, PasswordResetConfirmIn
)
from ..models import CustomUser
from ..services.auth_service import jwt_auth, generate_jwt_tokens, generate_password_reset_token, verify_password_reset_token
from ..services.email_service import send_password_reset_email
from ..services.utils import get_user_data


auth_router = Router()


@auth_router.post("/register", response={200: AuthOut, 400: ErrorOut})
async def register(request, data: UserRegistrationIn):  # pylint: disable=unused-argument
    """
    Регистрация нового пользователя
    
    Создает нового пользователя в системе с указанными данными.
    Автоматически генерирует API токен и JWT токены для аутентификации.
    
    **Параметры:**
    - `username`: Имя пользователя (уникальное)
    - `email`: Email адрес (уникальный)
    - `password1`: Пароль
    - `password2`: Подтверждение пароля
    - `use_cookies`: Установить токены в HTTP-Only cookies (опционально)
    
    **Пример запроса:**
    ```json
    {
        "username": "testuser",
        "email": "test@example.com",
        "password1": "securepassword123",
        "password2": "securepassword123",
        "use_cookies": false
    }

    **Пример ответа:**
    ```json
    {
        "user": {
            "id": 1,
            "username": "testuser",
            "email": "test@example.com"
        },
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "message": "User successfully registered",
        "use_cookies": false
    }
    ```
    
    **Коды ошибок:**
    - `400`: Пароли не совпадают, пользователь уже существует, ошибка валидации пароля
    """
    try:
        if data.password1 != data.password2:
            return 400, {"error": "password_mismatch", "message": "Passwords do not match"}
        
        try:
            validate_password(data.password1)
        except ValidationError as e:
            return 400, {"error": "password_validation", "message": f"Password validation failed: {'; '.join(e.messages)}"}
        
        try:
            user = await sync_to_async(CustomUser.objects.create_user)(
                username=data.username,
                email=data.email,
                password=data.password1
            )
            
        except IntegrityError:
            return 400, {"error": "user_exists", "message": "User with this username or email already exists"}
        
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
        return 400, {"error": "registration_error", "message": f"Registration failed: {str(e)}"}


@auth_router.post("/login", response={200: AuthOut, 400: ErrorOut, 401: ErrorOut})
async def login_user(request, data: UserLoginIn):
    """
    Вход в систему
    
    Аутентифицирует пользователя по имени пользователя и паролю.
    Возвращает JWT токены для доступа к защищенным эндпоинтам.
    
    **Параметры:**
    - `username`: Имя пользователя
    - `password`: Пароль
    - `use_cookies`: Установить токены в HTTP-Only cookies (опционально)
    
    **Пример запроса:**
    ```json
    {
        "username": "testuser",
        "password": "securepassword123",
        "use_cookies": false
    }
    ```
    
    **Пример ответа:**
    ```json
    {
        "user": {
            "id": 1,
            "username": "testuser",
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
        user = await sync_to_async(authenticate)(request, username=data.username, password=data.password)
        
        if user is None:
            return 401, {"error": "invalid_credentials", "message": "Invalid username or password"}
        
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
        return 400, {"error": "login_error", "message": f"Login failed: {str(e)}"}


@auth_router.post("/logout", response={200: dict, 400: ErrorOut, 401: ErrorOut}, auth=jwt_auth)
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
        return 400, {
            "error": "logout_error",
            "message": f"Logout error: {str(e)}"
        }


@auth_router.post("/refresh-token", response={200: dict, 400: ErrorOut, 401: ErrorOut})
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
            return 401, {
                "error": "no_refresh_token",
                "message": "Refresh token not found in cookies"
            }
        
        # Декодируем и проверяем токен
        try:
            payload = jwt.decode(refresh_token_value, settings.SECRET_KEY, algorithms=['HS256'])
            
            # Проверяем тип токена (должен быть refresh)
            if payload.get('type') != 'refresh':
                return 401, {
                    "error": "invalid_token",
                    "message": "Invalid token type. Expected refresh token"
                }
            
            user_id = payload.get('user_id')
            
            if not user_id:
                return 401, {
                    "error": "invalid_token",
                    "message": "Invalid refresh token"
                }
            
            # Получаем пользователя асинхронно
            user = await CustomUser.objects.aget(id=user_id)
            
        except ExpiredSignatureError:
            return 401, {
                "error": "token_expired",
                "message": "Refresh token expired"
            }
        except InvalidTokenError:
            return 401, {
                "error": "invalid_token",
                "message": "Invalid refresh token"
            }
        except CustomUser.DoesNotExist:  # type: ignore
            return 401, {
                "error": "user_not_found",
                "message": "User not found"
            }
        
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
        return 400, {
            "error": "refresh_error",
            "message": f"Token refresh error: {str(e)}"
        }


@auth_router.post("/password-reset", response={200: dict, 400: ErrorOut})
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
            return 400, {
                "error": "email_send_failed",
                "message": "Failed to send password reset email"
            }
        
        return 200, {
            "message": "If an account with this email exists, a password reset link has been sent."
        }
        
    except Exception as e:
        return 400, {
            "error": "password_reset_error",
            "message": f"Password reset request failed: {str(e)}"
        }


@auth_router.post("/password-reset/confirm", response={200: dict, 400: ErrorOut, 401: ErrorOut})
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
            return 401, {
                "error": "invalid_token",
                "message": "Invalid or expired password reset token"
            }
        
        # Получаем пользователя асинхронно
        try:
            user = await CustomUser.objects.aget(id=user_id, email=email)
        except CustomUser.DoesNotExist:  # type: ignore
            return 401, {
                "error": "user_not_found",
                "message": "User not found"
            }
        
        # Проверяем совпадение паролей
        if data.new_password1 != data.new_password2:
            return 400, {
                "error": "password_mismatch",
                "message": "Passwords do not match"
            }
        
        # Валидируем новый пароль
        try:
            validate_password(data.new_password1, user)
        except ValidationError as e:
            return 400, {
                "error": "password_validation",
                "message": f"Password validation failed: {'; '.join(e.messages)}"
            }
        
        # Устанавливаем новый пароль и сохраняем асинхронно
        user.set_password(data.new_password1)
        await user.asave()
        
        return 200, {"message": "Password has been reset successfully"}
        
    except Exception as e:
        return 400, {
            "error": "password_reset_confirm_error",
            "message": f"Password reset confirmation failed: {str(e)}"
        }

