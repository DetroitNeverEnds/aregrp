import { AuthApiClient, type AuthApiClientConfig } from './AuthApiClient';

let apiClientInstance: AuthApiClient | null = null;

export function initializeApiClient(config: AuthApiClientConfig): void {
    apiClientInstance = new AuthApiClient(config);
}

function getApiClient(): AuthApiClient {
    if (!apiClientInstance) {
        throw new Error('API client not initialized. Call initializeApiClient() first.');
    }
    return apiClientInstance;
}

export const api = {
    /**
     * GET запрос
     */
    get<TRequest, TResponse>(endpoint: string): (params: TRequest) => Promise<TResponse> {
        return async () => {
            const client = getApiClient();
            return await client.get<TResponse>(endpoint);
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
