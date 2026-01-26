# Формат ошибок API

Все ошибки API возвращаются в формате [RFC 7807 (Problem Details for HTTP APIs)](https://tools.ietf.org/html/rfc7807).

## Структура ошибки

```json
{
    "type": "https://api.example.com/problems/accounts-email-exists",
    "status": 400,
    "title": "Email already exists",
    "detail": "User with email 'test@example.com' already exists",
    "instance": "/api/v1/auth/register",
    "code": "ACCOUNTS_EMAIL_EXISTS"
}
```

### Поля

- **type** (string, обязательное) - URI типа ошибки. Генерируется автоматически на основе кода ошибки.
- **status** (integer, обязательное) - HTTP статус код ошибки.
- **title** (string, обязательное) - Краткое описание ошибки для человека.
- **detail** (string, обязательное) - Детальное описание ошибки с дополнительной информацией.
- **instance** (string, опциональное) - URI ресурса, на котором произошла ошибка.
- **code** (string, обязательное) - Внутренний код ошибки. Используется фронтендом для выбора текстовки.

## Использование на фронтенде

Фронтенд использует поле `code` для выбора соответствующей текстовки из словаря переводов. 
Если код не найден, используются `title` и `detail` как fallback.

Пример обработки на фронтенде:

```typescript
const errorCode = error.code; // "ACCOUNTS_EMAIL_EXISTS"
const errorText = translations[errorCode] || error.title;
```

## Как использовать в новом приложении

### Шаг 1: Создайте файл `errors.py` в вашем приложении

Например, для приложения `orders`:

```python
# apps/orders/errors.py
from api.errors import create_problem_detail


class OrdersErrorCodes:
    """Коды ошибок для модуля orders."""
    
    # Общие ошибки
    ORDER_NOT_FOUND = "ORDERS_ORDER_NOT_FOUND"
    ORDER_ALREADY_PAID = "ORDERS_ORDER_ALREADY_PAID"
    ORDER_CANNOT_BE_MODIFIED = "ORDERS_ORDER_CANNOT_BE_MODIFIED"
    ORDER_CREATION_ERROR = "ORDERS_ORDER_CREATION_ERROR"
    ORDER_UPDATE_ERROR = "ORDERS_ORDER_UPDATE_ERROR"
    VALIDATION_ERROR = "ORDERS_VALIDATION_ERROR"


def create_orders_error(
    status: int,
    code: str,
    title: str,
    detail: str,
    instance: str = None
) -> dict:
    """
    Создает ошибку для модуля orders.
    
    Args:
        status: HTTP статус код
        code: Код ошибки из OrdersErrorCodes
        title: Краткое описание ошибки
        detail: Детальное описание ошибки
        instance: URI ресурса (опционально)
    
    Returns:
        dict: Объект ошибки в формате ProblemDetail
    """
    if instance is None:
        instance = "/api/v1/orders"
    
    return create_problem_detail(
        status=status,
        code=code,
        title=title,
        detail=detail,
        instance=instance
    )
```

### Шаг 2: Используйте в роутерах

```python
# apps/orders/routers/orders.py
from ninja import Router
from api.schemas import ProblemDetail
from ..errors import create_orders_error, OrdersErrorCodes

orders_router = Router()


@orders_router.put(
    "/orders/{order_id}",
    response={200: OrderOut, 400: ProblemDetail, 404: ProblemDetail, 409: ProblemDetail}
)
async def update_order(request, order_id: int, data: OrderUpdateIn):
    """
    Обновление заказа.
    """
    try:
        # Получаем заказ
        try:
            order = await Order.objects.aget(id=order_id)
        except Order.DoesNotExist:
            return 404, create_orders_error(
                status=404,
                code=OrdersErrorCodes.ORDER_NOT_FOUND,
                title="Order not found",
                detail=f"Order with id {order_id} not found",
                instance=f"/api/v1/orders/{order_id}"
            )
        
        # Проверяем, можно ли изменять заказ
        if order.status == 'paid':
            return 409, create_orders_error(
                status=409,
                code=OrdersErrorCodes.ORDER_ALREADY_PAID,
                title="Order cannot be modified",
                detail=f"Order {order_id} is already paid and cannot be edited.",
                instance=f"/api/v1/orders/{order_id}"
            )
        
        # Обновляем заказ
        # ... логика обновления ...
        
        return 200, order_data
        
    except Exception as e:
        return 400, create_orders_error(
            status=400,
            code=OrdersErrorCodes.ORDER_UPDATE_ERROR,
            title="Order update failed",
            detail=f"Failed to update order: {str(e)}",
            instance=f"/api/v1/orders/{order_id}"
        )
```

### Шаг 3: Импортируйте схему ProblemDetail в response

Важно: В декораторе роутера всегда используйте `ProblemDetail` из `api.schemas`:

```python
from api.schemas import ProblemDetail

@router.post(
    "/endpoint",
    response={200: SuccessOut, 400: ProblemDetail, 401: ProblemDetail}
)
```

## Соглашения по именованию кодов

1. **Префикс приложения**: Коды должны начинаться с префикса приложения в верхнем регистре:
   - `ACCOUNTS_*` для accounts
   - `ORDERS_*` для orders
   - `FEEDBACK_*` для feedback
   - и т.д.

2. **Формат**: Используйте UPPER_SNAKE_CASE для кодов.

3. **Описательность**: Коды должны быть описательными:
   - ✅ `ORDERS_ORDER_ALREADY_PAID`
   - ❌ `ORDERS_ERR1`

4. **Именование функции**: Функция создания ошибок должна называться `create_{app_name}_error`:
   - `create_orders_error`
   - `create_feedback_error`
   - `create_accounts_error`

## Примеры кодов ошибок по приложениям

### Accounts (`apps/accounts/errors.py`)

- `ACCOUNTS_INVALID_CREDENTIALS` - Неверные учетные данные
- `ACCOUNTS_EMAIL_EXISTS` - Email уже существует
- `ACCOUNTS_PHONE_EXISTS` - Телефон уже существует
- `ACCOUNTS_PASSWORD_MISMATCH` - Пароли не совпадают
- `ACCOUNTS_UNAUTHORIZED` - Не авторизован
- `ACCOUNTS_TOKEN_EXPIRED` - Токен истек
- `ACCOUNTS_INVALID_TOKEN` - Неверный токен

### Feedback (`apps/feedback/errors.py`)

- `FEEDBACK_NOT_FOUND` - Отзыв не найден
- `FEEDBACK_CREATION_ERROR` - Ошибка создания отзыва
- `FEEDBACK_VALIDATION_ERROR` - Ошибка валидации данных

### Orders (пример)

- `ORDERS_ORDER_NOT_FOUND` - Заказ не найден
- `ORDERS_ORDER_ALREADY_PAID` - Заказ уже оплачен
- `ORDERS_ORDER_CANNOT_BE_MODIFIED` - Заказ нельзя изменить

## Базовый модуль

Общая функция `create_problem_detail` находится в `api/errors.py` и используется всеми приложениями. 
Она автоматически генерирует поле `type` на основе кода ошибки.

## Полный пример для нового приложения

```python
# 1. Создайте apps/myapp/errors.py
from api.errors import create_problem_detail

class MyAppErrorCodes:
    MY_ERROR = "MYAPP_MY_ERROR"

def create_myapp_error(status, code, title, detail, instance=None):
    if instance is None:
        instance = "/api/v1/myapp"
    return create_problem_detail(status, code, title, detail, instance)

# 2. Используйте в роутере
from api.schemas import ProblemDetail
from ..errors import create_myapp_error, MyAppErrorCodes

@router.post("/endpoint", response={200: Success, 400: ProblemDetail})
async def my_endpoint(request, data: DataIn):
    if error_condition:
        return 400, create_myapp_error(
            status=400,
            code=MyAppErrorCodes.MY_ERROR,
            title="Error title",
            detail="Error details",
            instance="/api/v1/myapp/endpoint"
        )
```
