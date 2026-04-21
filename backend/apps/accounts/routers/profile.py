from asgiref.sync import sync_to_async
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from ninja import Query, Router

from api.schemas import ProblemDetail
from apps.bookings.schemas import BookingOut
from apps.bookings.services import list_bookings_for_user
from apps.deals.errors import DealsErrorCodes, create_deals_error
from apps.deals.schemas import ProfilePremisesListResponse
from apps.deals.services import list_deals_for_profile_page

from ..errors import AccountsErrorCodes, create_accounts_error
from ..schemas.profile import UpdatePasswordIn, UpdateProfileIn, UserOut
from ..services.auth_service import jwt_auth
from ..services.utils import get_user_data

profile_router = Router()


@profile_router.get(
    "/user",
    response={200: UserOut, 401: ProblemDetail},
    auth=jwt_auth,
    summary="Получить данные текущего пользователя",
    description=(
        "Возвращает информацию о текущем авторизованном пользователе. "
        "Требует Bearer JWT в заголовке Authorization."
    ),
)
async def get_user(request):
    """
    Получить данные текущего пользователя.

    Возвращает полную информацию о текущем авторизованном пользователе.

    **Требует аутентификации:** Bearer JWT токен в заголовке Authorization.

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


@profile_router.get(
    "/bookings",
    response={200: list[BookingOut], 401: ProblemDetail},
    auth=jwt_auth,
    summary="Мои брони",
    description=(
        "Список броней текущего пользователя (новые первые). "
        "При BOOKINGS_LIST_ONLY_ACTIVE=True (по умолчанию) — только неистёкшие; "
        "при False — все записи (см. настройки Django)."
    ),
)
async def list_my_bookings(request):
    items = await sync_to_async(list_bookings_for_user, thread_sensitive=True)(request.auth)
    return 200, items


@profile_router.get(
    '/premises',
    response={200: ProfilePremisesListResponse, 400: ProblemDetail, 401: ProblemDetail},
    auth=jwt_auth,
    summary='Объекты в личном кабинете',
    description=(
        'Список сделок пользователя (аренда или продажа). Параметр query: '
        f'{settings.RE_OBJECTS_SALE_TYPE_RENT} или {settings.RE_OBJECTS_SALE_TYPE_SALE}. '
        'Пагинация: page, page_size (как у /premises). '
        'Ответ: items, total, page, page_size, total_pages. '
        'Комиссия в строках только для user_type=agent.'
    ),
)
async def list_profile_premises(
    request,
    deal_query: str = Query(
        ...,
        alias='query',
        description='Тип сделки: rent (аренда) или sale (продажа).',
    ),
    page: int = Query(1, ge=1, description='Номер страницы'),
    page_size: int = Query(20, ge=1, le=100, description='Размер страницы'),
):
    rent = settings.RE_OBJECTS_SALE_TYPE_RENT
    sale = settings.RE_OBJECTS_SALE_TYPE_SALE
    if deal_query not in (rent, sale):
        return 400, create_deals_error(
            status=400,
            code=DealsErrorCodes.INVALID_DEAL_TYPE,
            title='Invalid query',
            detail=f"query must be '{rent}' or '{sale}'",
            instance='/api/v1/profile/premises',
        )
    result = await list_deals_for_profile_page(
        request.auth,
        deal_query,
        page=page,
        page_size=page_size,
    )
    return 200, ProfilePremisesListResponse(**result)


@profile_router.put(
    "/profile",
    response={200: UserOut, 400: ProblemDetail, 401: ProblemDetail},
    auth=jwt_auth,
    summary="Обновить профиль пользователя",
    description="Обновляет данные профиля: full_name, email, phone; для агентов — organization_name, inn. Требует JWT.",
)
async def update_profile(request, data: UpdateProfileIn):
    """
    Обновить профиль пользователя.

    Обновляет информацию профиля текущего авторизованного пользователя.
    Можно обновить имя, email, телефон; для агентов — название организации и ИНН.

    **Требует аутентификации:** Bearer JWT токен в заголовке Authorization.

    **Параметры:**
    - `full_name`: Полное имя (опционально)
    - `email`: Новый email адрес (опционально)
    - `phone`: Номер телефона (опционально)
    - `organization_name`: Название организации (опционально, для агентов)
    - `inn`: ИНН (опционально, для агентов)

    **Пример запроса:**
    ```
    PUT /api/v1/profile/profile
    Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
    Content-Type: application/json

    {
        "full_name": "Новое имя",
        "email": "newemail@example.com",
        "phone": "+79991234567"
    }
    ```

    **Пример ответа:**
    ```json
    {
        "id": 1,
        "username": "user",
        "email": "newemail@example.com",
        "user_type": "individual",
        "full_name": "Новое имя",
        "phone": "+79991234567"
    }
    ```

    **Коды ошибок:**
    - `400`: Ошибка обновления (например, email уже занят)
    - `401`: Не авторизован
    """
    try:
        user = request.auth
        
        if data.full_name:
            user.full_name = data.full_name
        if data.email:
            user.email = data.email
        if data.phone:
            user.phone = data.phone
        
        # Обновляем поля для агентов
        if user.user_type == 'agent':
            if data.organization_name:
                user.organization_name = data.organization_name
            if data.inn:
                user.inn = data.inn
        
        await user.asave()  # Async save
        
        return 200, get_user_data(user)
        
    except Exception as e:
        return 400, create_accounts_error(
            status=400,
            code=AccountsErrorCodes.REGISTRATION_ERROR,
            title="Update failed",
            detail=f"Update failed: {str(e)}",
            instance="/api/v1/profile/profile"
        )


@profile_router.post(
    "/change-password",
    response={200: dict, 400: ProblemDetail, 401: ProblemDetail},
    auth=jwt_auth,
    summary="Смена пароля",
    description="Меняет пароль авторизованного пользователя. Требует текущий пароль и дважды новый. Требует JWT.",
)
async def change_password(request, data: UpdatePasswordIn):
    """
    Смена пароля авторизованным пользователем.

    Позволяет авторизованному пользователю изменить свой пароль.
    Требует указания текущего пароля для подтверждения.

    **Требует аутентификации:** Bearer JWT токен в заголовке Authorization.

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
            return 400, create_accounts_error(
                status=400,
                code=AccountsErrorCodes.INVALID_CURRENT_PASSWORD,
                title="Invalid current password",
                detail="Current password is incorrect",
                instance="/api/v1/profile/change-password"
            )
        
        # Проверяем совпадение новых паролей
        if data.new_password1 != data.new_password2:
            return 400, create_accounts_error(
                status=400,
                code=AccountsErrorCodes.PASSWORD_MISMATCH,
                title="Passwords do not match",
                detail="New passwords do not match",
                instance="/api/v1/profile/change-password"
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
                instance="/api/v1/profile/change-password"
            )
        
        # Устанавливаем новый пароль и сохраняем асинхронно
        user.set_password(data.new_password1)
        await user.asave()
        
        return 200, {"message": "Password changed successfully"}
        
    except Exception as e:
        return 400, create_accounts_error(
            status=400,
            code=AccountsErrorCodes.REGISTRATION_ERROR,
            title="Password change failed",
            detail=f"Password change failed: {str(e)}",
            instance="/api/v1/profile/change-password"
        )

