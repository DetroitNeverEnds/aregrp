# API Client Documentation

Документация по использованию API клиентов в проекте AREGRP.

## Содержание

- [Обзор](#обзор)
- [BaseApiClient](#baseapiclient)
- [AuthApiClient](#authapiclient)
- [Работа с токенами](#работа-с-токенами)
- [Примеры использования](#примеры-использования)

## Обзор

Проект использует два основных класса для работы с API:

- **BaseApiClient** - базовый HTTP клиент на основе axios
- **AuthApiClient** - расширение с поддержкой JWT авторизации

## BaseApiClient

Базовый класс для выполнения HTTP запросов с обработкой ошибок.

### Возможности

- GET, POST, PUT, PATCH, DELETE запросы
- Автоматическая обработка ошибок
- Поддержка таймаутов
- Стандартизация ошибок в формате Problem Details (RFC 7807)

### Пример использования

```typescript
import { BaseApiClient } from './base/BaseApiClient';

const client = new BaseApiClient({
    baseURL: 'https://api.example.com',
    timeout: 30000,
    headers: {
        'X-Custom-Header': 'value',
    },
});

// GET запрос
const data = await client.get('/api/users');

// POST запрос
const newUser = await client.post('/api/users', {
    name: 'John Doe',
    email: 'john@example.com',
});
```

## AuthApiClient

Расширение BaseApiClient с поддержкой JWT авторизации.

### Возможности

- ✅ Автоматическое добавление Bearer токена в заголовки
- ✅ Автоматическое обновление токенов при истечении (refresh token flow)
- ✅ Очередь запросов при обновлении токена
- ✅ Поддержка различных стратегий хранения токенов
- ✅ Callbacks для интеграции с приложением

### Технологии

Использует библиотеку [`axios-jwt`](https://www.npmjs.com/package/axios-jwt) для управления JWT токенами.

### Конфигурация

```typescript
interface AuthApiClientConfig extends BaseApiClientConfig {
    // Callback при успешном обновлении access токена
    onTokenRefresh?: (accessToken: string) => void;
    
    // Callback при ошибке авторизации (401, невалидный refresh token)
    onAuthError?: () => void;
}
```

### Методы

```typescript
// Установить access токен (после логина)
// Refresh токен уже в HttpOnly cookie на сервере
client.setTokens(accessToken);

// Получить текущий access токен
const token = await client.getToken();

// Очистить токены (при выходе)
client.clearTokens();

// Проверить авторизацию
const isAuth = await client.isAuthenticated();
```

## Работа с токенами

### Архитектура безопасности

`AuthApiClient` использует **серверные HttpOnly cookies** для refresh токена - самый безопасный подход.

**Как это работает:**
1. После логина сервер устанавливает refresh токен в HttpOnly cookie
2. Клиент сохраняет только access токен (в localStorage)
3. При обновлении токена refresh автоматически отправляется из cookie
4. Сервер возвращает новый access токен

**Преимущества:**
- ✅ Refresh токен защищен от XSS атак (HttpOnly)
- ✅ Автоматическая отправка refresh токена браузером
- ✅ SameSite защита от CSRF
- ✅ Простота - не нужно управлять refresh токеном на клиенте

### Использование

```typescript
const client = new AuthApiClient({
    baseURL: 'https://api.example.com',
    
    onTokenRefresh: (accessToken) => {
        // Сохраняем access токен
        localStorage.setItem('accessToken', accessToken);
    },
    
    onAuthError: () => {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
    },
});

// Загружаем access токен при инициализации
const accessToken = localStorage.getItem('accessToken');
if (accessToken) {
    client.setTokens(accessToken);
}
```

## Примеры использования

### Логин с серверными куками

```typescript
const client = new AuthApiClient({
    baseURL: 'https://api.example.com',
    useServerCookies: true,
    onTokenRefresh: (accessToken) => {
        localStorage.setItem('accessToken', accessToken);
    },
});

// Логин - сервер автоматически установит refresh токен в HttpOnly cookie
const response = await client.post('/api/auth/login', {
    email: 'user@example.com',
    password: 'password123',
});

// Сохранить только access токен
client.setTokens(response.access_token);
```

### Авторизованные запросы

```typescript
// Токен автоматически добавляется в заголовки
const profile = await client.get('/api/user/profile');

const updatedProfile = await client.put('/api/user/profile', {
    name: 'New Name',
});
```

### Автоматическое обновление токена

```typescript
// При получении 401 ошибки:
// 1. axios-jwt автоматически вызовет POST /api/auth/refresh-token
// 2. Refresh токен автоматически отправится из HttpOnly cookie
// 3. Сервер вернет новый access токен
// 4. Клиент сохранит новый access токен
// 5. Исходный запрос повторится с новым токеном

const data = await client.get('/api/protected-resource');
// Если access токен истек, он будет автоматически обновлен
```

### Выход из системы

```typescript
// Сервер автоматически удалит refresh токен из HttpOnly cookie
await client.post('/api/auth/logout');

// Очистить access токен
client.clearTokens();
localStorage.removeItem('accessToken');
```

### Проверка авторизации

```typescript
const isAuthenticated = await client.isAuthenticated();

if (!isAuthenticated) {
    window.location.href = '/login';
}
```

## Обработка ошибок

Все ошибки стандартизированы в формате Problem Details (RFC 7807):

```typescript
interface ApiError {
    type: string;        // URI идентификатор типа ошибки
    title: string;       // Краткое описание
    status: number;      // HTTP статус код
    detail: string;      // Подробное описание
    instance: string;    // URI запроса, вызвавшего ошибку
}
```

**Пример обработки:**

```typescript
try {
    const data = await client.get('/api/users');
} catch (error) {
    const apiError = error as ApiError;
    
    console.error(`Error ${apiError.status}: ${apiError.title}`);
    console.error(`Details: ${apiError.detail}`);
    
    if (apiError.status === 401) {
        // Ошибка авторизации
    } else if (apiError.status === 404) {
        // Ресурс не найден
    }
}
```

## Дополнительные материалы

- [Примеры использования](./examples/authClientUsage.ts)
- [Утилиты для работы с cookies](./utils/cookies.ts)
- [axios-jwt документация](https://www.npmjs.com/package/axios-jwt)