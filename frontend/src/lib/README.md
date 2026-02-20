# Библиотека утилит

## queryHelpers.ts

### Обёртка API запросов для React Query

Этот модуль предоставляет утилиты для обработки ошибок API запросов в React Query.

#### Проблема

По умолчанию React Query не кеширует ошибки так же долго, как успешные результаты. Это приводит к повторным запросам при каждом ре-рендере компонента, что может вызвать бесконечные циклы запросов.

#### Решение

Функция `wrapApiCall` оборачивает API запросы и возвращает ошибки как часть успешного результата, а не выбрасывает их. Это позволяет React Query кешировать как успешные результаты, так и ошибки одинаково.

#### Использование

```typescript
import { wrapApiCall, type QueryResult } from '../lib/queryHelpers';
import { getUser, type UserData } from '../api';

export function useUser(): UseQueryResult<QueryResult<UserData>, never> {
    return useQuery({
        queryKey: ['profile', 'user'],
        queryFn: () => wrapApiCall(getUser)(),
        staleTime: 5 * 60 * 1000,
    });
}

// В компоненте
const userQuery = useUser();
const userResult = userQuery.data;

if (userQuery.isPending) {
    return <Loader />;
}

if (userResult?.error) {
    // Обработка ошибки
    console.error(userResult.error.detail);
} else if (userResult?.data) {
    // Использование данных
    console.log(userResult.data.username);
}
```

#### Типы

```typescript
type QueryResult<T> = {
    data?: T;
    error?: ApiError;
};
```

#### Преимущества

1. **Кеширование ошибок**: Ошибки кешируются так же, как успешные результаты
2. **Нет бесконечных циклов**: Повторные рендеры не вызывают новые запросы
3. **Явная обработка**: Ошибки обрабатываются явно, а не через исключения
4. **Единообразие**: Все запросы обрабатываются одинаково

#### Миграция существующих запросов

**До:**
```typescript
export function useUser(): UseQueryResult<UserData, Error> {
    return useQuery({
        queryKey: ['profile', 'user'],
        queryFn: getUser,
    });
}

// Использование
const user = useUser();
if (user.isError) {
    // Обработка ошибки
}
if (user.data) {
    // Использование данных
}
```

**После:**
```typescript
export function useUser(): UseQueryResult<QueryResult<UserData>, never> {
    return useQuery({
        queryKey: ['profile', 'user'],
        queryFn: () => wrapApiCall(getUser)(),
    });
}

// Использование
const userQuery = useUser();
const userResult = userQuery.data;
if (userResult?.error) {
    // Обработка ошибки
}
if (userResult?.data) {
    // Использование данных
}