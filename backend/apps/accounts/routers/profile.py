from ninja import Router
from asgiref.sync import sync_to_async
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password

from ..schemas.profile import (
    UserOut, UpdateProfileIn, UpdatePasswordIn, ErrorOut
)
from ..services.auth_service import jwt_auth
from ..services.utils import get_user_data


profile_router = Router()


@profile_router.get("/user", response={200: UserOut, 401: ErrorOut}, auth=jwt_auth)
async def get_user(request):
    """
    Получить данные текущего пользователя
    
    Возвращает полную информацию о текущем авторизованном пользователе,
    включая API токен, тарифный план и статистику использования.
    
    **Требует аутентификации:** Bearer JWT токен в заголовке Authorization
    
    **Пример запроса:**
    ```
    GET /api/v1/profile/user
    Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
    ```
    
    **Пример ответа:**
    ```json
    {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com"
    }
    ```
    
    **Коды ошибок:**
    - `401`: Не авторизован (отсутствует или неверный JWT токен)
    """
    return 200, get_user_data(request.auth)


@profile_router.put("/profile", response={200: UserOut, 400: ErrorOut, 401: ErrorOut}, auth=jwt_auth)
async def update_profile(request, data: UpdateProfileIn):
    """
    Обновить профиль пользователя
    
    Обновляет информацию профиля текущего авторизованного пользователя.
    Можно обновить имя пользователя и/или email адрес.
    
    **Требует аутентификации:** Bearer JWT токен в заголовке Authorization
    
    **Параметры:**
    - `username`: Новое имя пользователя (опционально)
    - `email`: Новый email адрес (опционально)
    
    **Пример запроса:**
    ```
    PUT /api/v1/profile/profile
    Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
    Content-Type: application/json
    
    {
        "username": "newusername",
        "email": "newemail@example.com"
    }
    ```
    
    **Пример ответа:**
    ```json
    {
        "id": 1,
        "username": "newusername",
        "email": "newemail@example.com"
    }
    ```
    
    **Коды ошибок:**
    - `400`: Ошибка обновления (например, имя пользователя уже занято)
    - `401`: Не авторизован
    """
    try:
        user = request.auth
        
        if data.username:
            user.username = data.username
        if data.email:
            user.email = data.email
        
        await user.asave()  # Async save
        
        return 200, get_user_data(user)
        
    except Exception as e:
        return 400, {"error": "update_error", "message": f"Update failed: {str(e)}"}


@profile_router.post("/change-password", response={200: dict, 400: ErrorOut, 401: ErrorOut}, auth=jwt_auth)
async def change_password(request, data: UpdatePasswordIn):
    """
    Смена пароля авторизованным пользователем
    
    Позволяет авторизованному пользователю изменить свой пароль.
    Требует указания текущего пароля для подтверждения.
    
    **Требует аутентификации:** Bearer JWT токен в заголовке Authorization
    
    **Параметры:**
    - `current_password`: Текущий пароль пользователя
    - `new_password1`: Новый пароль
    - `new_password2`: Подтверждение нового пароля
    
    **Пример запроса:**
    ```
    POST /api/v1/profile/change-password
    Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
    Content-Type: application/json
    
    {
        "current_password": "oldpassword123",
        "new_password1": "newpassword123",
        "new_password2": "newpassword123"
    }
    ```
    
    **Пример ответа:**
    ```json
    {
        "message": "Password changed successfully"
    }
    ```
    
    **Коды ошибок:**
    - `400`: Пароли не совпадают, неверный текущий пароль, ошибка валидации пароля
    - `401`: Не авторизован
    """
    try:
        user = request.auth
        
        # Проверяем текущий пароль асинхронно
        is_valid = await sync_to_async(user.check_password)(data.current_password)
        
        if not is_valid:
            return 400, {
                "error": "invalid_current_password",
                "message": "Current password is incorrect"
            }
        
        # Проверяем совпадение новых паролей
        if data.new_password1 != data.new_password2:
            return 400, {
                "error": "password_mismatch",
                "message": "New passwords do not match"
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
        
        return 200, {"message": "Password changed successfully"}
        
    except Exception as e:
        return 400, {
            "error": "change_password_error",
            "message": f"Password change failed: {str(e)}"
        }

