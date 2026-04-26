import type { ApiError } from '@/api/types';

/**
 * Результат API запроса с обработкой ошибок
 */
export type QueryResult<T> = {
    data?: T;
    error?: ApiError;
};

/**
 * Обёртка для API запросов, которая перехватывает ошибки
 * и возвращает их как часть результата вместо throw
 *
 * @param apiCall - Функция API запроса
 * @returns Функция, возвращающая QueryResult
 */
export function wrapApiCall<TArgs extends unknown[], TResponse>(
    apiCall: (...args: TArgs) => Promise<TResponse>,
): (...args: TArgs) => Promise<QueryResult<TResponse>> {
    return async (...args: TArgs): Promise<QueryResult<TResponse>> => {
        try {
            const data = await apiCall(...args);
            return { data };
        } catch (error) {
            return { error: error as ApiError };
        }
    };
}
