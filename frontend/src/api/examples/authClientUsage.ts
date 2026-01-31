/**
 * Примеры использования AuthApiClient
 *
 * AuthApiClient использует серверные HttpOnly cookies для refresh токена
 * и управляет только access токеном на клиенте
 */

import { AuthApiClient } from '../base/AuthApiClient';

// ============================================================================
// Создание клиента
// ============================================================================

/**
 * Создать API клиент с JWT авторизацией
 *
 * Refresh токен хранится в HttpOnly cookie на сервере (безопасно)
 * Access токен управляется клиентом (в localStorage)
 */
export function createAuthClient(): AuthApiClient {
    const client = new AuthApiClient({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
        timeout: 30000,

        // Callback при обновлении access токена
        onTokenRefresh: accessToken => {
            localStorage.setItem('accessToken', accessToken);
        },

        // Callback при ошибке авторизации
        onAuthError: () => {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        },
    });

    return client;
}

// ============================================================================
// Пример использования клиента
// ============================================================================

/**
 * Пример: Логин пользователя
 */
export async function loginExample() {
    const client = createAuthClient();

    try {
        // Отправляем логин запрос
        // Сервер автоматически установит refresh токен в HttpOnly cookie
        const response = await client.post<
            {
                access_token: string;
                user: { id: number; email: string };
            },
            {
                email: string;
                password: string;
            }
        >('/api/auth/login', {
            email: 'user@example.com',
            password: 'password123',
        });

        // Сохраняем access токен в localStorage
        localStorage.setItem('accessToken', response.access_token);

        console.log('Logged in:', response.user);

        return response.user;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

/**
 * Пример: Получение профиля пользователя
 */
export async function getUserProfileExample() {
    const client = createAuthClient();

    try {
        // Токен автоматически добавится в заголовки
        const profile = await client.get<{
            id: number;
            email: string;
            name: string;
        }>('/api/user/profile');

        console.log('User profile:', profile);

        return profile;
    } catch (error) {
        console.error('Failed to get profile:', error);
        throw error;
    }
}

/**
 * Пример: Выход из системы
 */
export async function logoutExample() {
    const client = createAuthClient();

    try {
        // Отправляем запрос на выход
        // Сервер автоматически удалит refresh токен из кук
        await client.post<void>('/api/auth/logout');

        // Очищаем access токен
        localStorage.removeItem('accessToken');

        console.log('Logged out successfully');
    } catch (error) {
        console.error('Logout failed:', error);
        throw error;
    }
}

/**
 * Пример: Проверка авторизации
 */
export async function checkAuthExample() {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
        console.log('User is authenticated');
        return true;
    } else {
        console.log('User is not authenticated');
        return false;
    }
}
