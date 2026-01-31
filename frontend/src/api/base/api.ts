import { AuthApiClient, type AuthApiClientConfig } from './AuthApiClient';

/**
 * Глобальный экземпляр API клиента
 */
let apiClientInstance: AuthApiClient | null = null;

/**
 * Инициализировать API клиент
 */
export function initializeApiClient(config: AuthApiClientConfig): void {
    apiClientInstance = new AuthApiClient(config);
}

/**
 * Получить экземпляр API клиента
 */
function getApiClient(): AuthApiClient {
    if (!apiClientInstance) {
        throw new Error('API client not initialized. Call initializeApiClient() first.');
    }
    return apiClientInstance;
}

/**
 * Фабрика для создания типизированных API функций
 *
 * @example
 * ```typescript
 * // Определяем типы
 * interface GetItemsRequest {
 *     page: number;
 *     limit: number;
 * }
 *
 * interface GetItemsResponse {
 *     items: Item[];
 *     total: number;
 * }
 *
 * // Создаем функцию для запроса
 * const getItems = api.get<GetItemsRequest, GetItemsResponse>('/items');
 *
 * // Используем
 * try {
 *     const response = await getItems({ page: 1, limit: 10 });
 *     console.log(response.items);
 * } catch (error) {
 *     if (error instanceof ApiError) {
 *         console.error(error.detail);
 *     }
 * }
 * ```
 */
export const api = {
    /**
     * GET запрос
     */
    get<TRequest, TResponse>(endpoint: string): (params: TRequest) => Promise<TResponse> {
        return async () => {
            const client = getApiClient();
            return await client.get<TResponse>(endpoint);
            // return handleApiResponse(response);
        };
    },

    /**
     * POST запрос
     */
    post<TRequest, TResponse>(endpoint: string): (data: TRequest) => Promise<TResponse> {
        return async (data: TRequest) => {
            const client = getApiClient();
            return await client.post<TRequest, TResponse>(endpoint, data);
        };
    },

    /**
     * PUT запрос
     */
    put<TRequest, TResponse>(endpoint: string): (data: TRequest) => Promise<TResponse> {
        return async (data: TRequest) => {
            const client = getApiClient();
            return await client.put<TRequest, TResponse>(endpoint, data);
        };
    },

    /**
     * PATCH запрос
     */
    patch<TRequest, TResponse>(endpoint: string): (data: TRequest) => Promise<TResponse> {
        return async (data: TRequest) => {
            const client = getApiClient();
            return await client.patch<TRequest, TResponse>(endpoint, data);
        };
    },

    /**
     * DELETE запрос
     */
    delete<TRequest, TResponse>(endpoint: string): (data: TRequest) => Promise<TResponse> {
        return async (data: TRequest) => {
            const client = getApiClient();
            return await client.delete<TRequest, TResponse>(endpoint, data);
        };
    },
};

// /**
//  * Утилиты для работы с токенами
//  */
// export const tokens = {
//     /**
//      * Проверить, авторизован ли пользователь
//      */
//     isAuthenticated: () => {
//         const client = getApiClient();
//         return client.isAuthenticated();
//     },

//     /**
//      * Установить токены
//      */
//     set: (accessToken: string, refreshToken: string) => {
//         const client = getApiClient();
//         client.setTokens(accessToken, refreshToken);
//     },

//     /**
//      * Очистить токены
//      */
//     clear: () => {
//         const client = getApiClient();
//         client.clearTokens();
//     },
// };
