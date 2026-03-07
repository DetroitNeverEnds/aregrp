import { ApiClient, type ApiClientConfig } from './ApiClient';

let apiClientInstance: ApiClient | null = null;

export function initializeApiClient(config: ApiClientConfig): void {
    apiClientInstance = new ApiClient(config);
}

function getApiClient(): ApiClient {
    if (!apiClientInstance) {
        throw new Error('API client not initialized. Call initializeApiClient() first.');
    }
    return apiClientInstance;
}

export const api = {
    /**
     * GET запрос
     */
    get<TRequest, TResponse>(endpoint: string): (params?: TRequest) => Promise<TResponse> {
        return async (params?: TRequest) => {
            const client = getApiClient();
            return await client.get<TResponse>(
                endpoint,
                params as Record<string, string | number | boolean>,
            );
        };
    },

    /**
     * POST запрос
     */
    post<TRequest, TResponse>(endpoint: string): (data: TRequest) => Promise<TResponse> {
        return async (data: TRequest) => {
            const client = getApiClient();
            return await client.post<TResponse, TRequest>(endpoint, data);
        };
    },

    /**
     * PUT запрос
     */
    put<TRequest, TResponse>(endpoint: string): (data: TRequest) => Promise<TResponse> {
        return async (data: TRequest) => {
            const client = getApiClient();
            return await client.put<TResponse, TRequest>(endpoint, data);
        };
    },

    /**
     * PATCH запрос
     */
    patch<TRequest, TResponse>(endpoint: string): (data: TRequest) => Promise<TResponse> {
        return async (data: TRequest) => {
            const client = getApiClient();
            return await client.patch<TResponse, TRequest>(endpoint, data);
        };
    },

    /**
     * DELETE запрос
     */
    delete<TRequest, TResponse>(endpoint: string): (data: TRequest) => Promise<TResponse> {
        return async (data: TRequest) => {
            const client = getApiClient();
            return await client.delete<TResponse, TRequest>(endpoint, data);
        };
    },
};
