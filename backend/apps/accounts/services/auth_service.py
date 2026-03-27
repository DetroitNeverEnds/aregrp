"""
Сервис для JWT аутентификации
"""
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from datetime import datetime, timedelta, timezone
from django.conf import settings
from django.http import HttpRequest, HttpResponse
from ninja.security import HttpBearer
from ..models import CustomUser

# Настройки времени жизни токенов из Django settings (загружаются из .env файла)
ACCESS_TOKEN_LIFETIME_MINUTES = settings.ACCESS_TOKEN_LIFETIME_MINUTES  # Время жизни access токена в минутах
REFRESH_TOKEN_LIFETIME_DAYS = settings.REFRESH_TOKEN_LIFETIME_DAYS      # Время жизни refresh токена в днях
PASSWORD_RESET_TOKEN_LIFETIME_HOURS = settings.PASSWORD_RESET_TOKEN_LIFETIME_HOURS  # Время жизни токена сброса пароля в часах
ACCESS_COOKIE_NAME = "access_token"
REFRESH_COOKIE_NAME = "refresh_token"


class JWTAuth(HttpBearer):
    """JWT аутентификация с поддержкой cookies (async для работы в ASGI/Uvicorn)"""

    def __call__(self, request: HttpRequest):
        """
        Приоритет источников токена:
        1) access_token из cookies
        2) Bearer token из Authorization header
        """
        header_token = None
        auth_value = request.headers.get(self.header)
        if auth_value:
            parts = auth_value.split(" ")
            if parts[0].lower() == self.openapi_scheme:
                header_token = " ".join(parts[1:])
        return self.authenticate(request, header_token)
    
    async def authenticate(self, request, token):
        """Асинхронная аутентификация пользователя по JWT токену"""
        # Сначала пробуем получить токен из cookies
        access_token = get_access_token_from_request(request)
        if access_token:
            return await self._authenticate_with_token(access_token)

        # Если в cookies токена нет, пробуем Bearer token из заголовка
        if token:
            return await self._authenticate_with_token(token)
        
        return None
    
    async def _authenticate_with_token(self, token):
        """Асинхронная аутентификация по токену"""
        try:
            # Декодируем JWT токен (синхронная операция - просто декодирование, без БД)
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=['HS256']
            )
            
            # Проверяем тип токена (должен быть access)
            # jwt.decode уже проверил срок действия (exp)
            if payload.get('type') != 'access':
                return None
            
            # Получаем пользователя АСИНХРОННО - правильно для async контекста
            user_id = payload.get('user_id')
            if not user_id:
                return None
            
            try:
                user = await CustomUser.objects.aget(id=user_id)
                if not user.is_active:
                    return None
                return user
            except CustomUser.DoesNotExist:
                # Пользователь не найден в БД
                return None
            
        except ExpiredSignatureError:
            # Токен истек
            return None
        except InvalidTokenError:
            # Неверный формат токена или подпись
            return None
        except Exception:
            # Любые другие ошибки (например, проблемы с БД)
            return None


def generate_jwt_tokens(user):
    """Генерирует JWT токены для пользователя"""
    now = datetime.now(timezone.utc)
    
    # Access token - короткоживущий
    access_payload = {
        'user_id': user.id,  # Обычный int ID
        'username': user.username,
        'email': user.email,
        'type': 'access',
        'exp': now + timedelta(minutes=ACCESS_TOKEN_LIFETIME_MINUTES),
        'iat': now
    }
    
    # Refresh token - долгоживущий
    refresh_payload = {
        'user_id': user.id,  # Обычный int ID
        'type': 'refresh',
        'exp': now + timedelta(days=REFRESH_TOKEN_LIFETIME_DAYS),
        'iat': now
    }
    
    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm='HS256')
    
    return access_token, refresh_token


def get_token_from_cookies(request: HttpRequest, cookie_name: str) -> str | None:
    """Возвращает токен из cookies по имени cookie."""
    return request.COOKIES.get(cookie_name)

def get_access_token_from_request(request: HttpRequest) -> str | None:
    """Возвращает access token из cookies запроса."""
    return get_token_from_cookies(request, ACCESS_COOKIE_NAME)


def get_refresh_token_from_request(request: HttpRequest) -> str | None:
    """Возвращает refresh token из cookies запроса."""
    return get_token_from_cookies(request, REFRESH_COOKIE_NAME)



def set_auth_cookies(response: HttpResponse, access_token: str, refresh_token: str) -> HttpResponse:
    """Устанавливает access и refresh токены в HTTP-only cookies."""
    response.set_cookie(
        ACCESS_COOKIE_NAME,
        access_token,
        max_age=ACCESS_TOKEN_LIFETIME_MINUTES * 60,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="Lax",
        path="/",
    )
    response.set_cookie(
        REFRESH_COOKIE_NAME,
        refresh_token,
        max_age=REFRESH_TOKEN_LIFETIME_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="Lax",
        path="/",
    )
    return response


def clear_auth_cookies(response: HttpResponse) -> HttpResponse:
    """Удаляет auth cookies (access и refresh)."""
    response.delete_cookie(ACCESS_COOKIE_NAME, path="/")
    response.delete_cookie(REFRESH_COOKIE_NAME, path="/")
    return response


def generate_password_reset_token(user):
    """Генерирует JWT токен для сброса пароля"""
    now = datetime.now(timezone.utc)
    
    payload = {
        'user_id': user.id,
        'email': user.email,
        'type': 'password_reset',
        'exp': now + timedelta(hours=PASSWORD_RESET_TOKEN_LIFETIME_HOURS),
        'iat': now
    }
    
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token


def verify_password_reset_token(token):
    """
    Проверяет токен сброса пароля и возвращает user_id
    
    Returns:
        tuple: (user_id, email) если токен валиден, иначе (None, None)
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        
        # Проверяем тип токена
        if payload.get('type') != 'password_reset':
            return None, None
        
        user_id = payload.get('user_id')
        email = payload.get('email')
        
        if not user_id or not email:
            return None, None
        
        return user_id, email
        
    except ExpiredSignatureError:
        # Токен истек
        return None, None
    except InvalidTokenError:
        # Неверный формат токена или подпись
        return None, None
    except Exception:
        # Любые другие ошибки
        return None, None


# Создаем экземпляр для использования в роутерах
jwt_auth = JWTAuth()

