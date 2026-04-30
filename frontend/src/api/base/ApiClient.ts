import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosError,
    type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiError, ProblemDetail } from '@/api/types';

/**
 * Конфигурация базового API клиента
 */
export interface ApiClientConfig {
    baseURL: string;
    timeout?: number;
    headers?: Record<string, string>;
}

export interface Request<Params, Body> {
    params: Params;
    body: Body;
}

/**
 * Базовый класс для работы с API на основе axios
 *
 * Предоставляет основные методы для выполнения HTTP запросов
 * с обработкой ошибок и таймаутов
 */
export class ApiClient {
    protected axiosInstance: AxiosInstance;

    constructor(config: ApiClientConfig) {
        this.axiosInstance = axios.create({
            baseURL: config.baseURL,
            timeout: config.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
                ...config.headers,
            },
        });

        this.setupInterceptors();
    }

    /**
     * Настроить перехватчики axios
     * Сначала handleAuth (retry при 401), затем handleError (преобразование в ApiError)
     */
    protected setupInterceptors(): void {
        this.axiosInstance.interceptors.response.use(
            response => response,
            async (error: AxiosError) => {
                try {
                    return await this.handleAuth(error);
                } catch (e) {
                    return Promise.reject(this.handleError(e as AxiosError));
                }
            },
        );
    }

    protected isProblemDetail(obj: unknown): obj is ProblemDetail {
        if (typeof obj !== 'object' || obj === null) {
            return false;
        }

        // instance в OpenAPI nullable и не required — поэтому не проверяем его наличие
        const required: (keyof ProblemDetail)[] = ['type', 'title', 'status', 'detail', 'code'];
        return required.every(key => key in obj);
    }

    protected async handleAuth(error: AxiosError) {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
            try {
                originalRequest._retry = true;
                await axios.post('/api/v1/auth/refresh-token', {});
                return this.axiosInstance(originalRequest);
            } catch (refreshError) {
                console.error(refreshError);
            }
        }
        return Promise.reject(error);
    }

    protected handleError(error: AxiosError): ApiError {
        if (error.response) {
            // Сервер ответил с кодом ошибки
            const status = error.response.status;
            const data = error.response.data;

            // Если ответ содержит Problem Detail (RFC7807 + code enum)
            if (this.isProblemDetail(data)) {
                return data;
            }

            // Иначе формируем клиентскую ошибку (спека не гарантирует формат)
            const errorData = data as { message?: string; detail?: string };
            return {
                type: 'about:blank',
                title: 'API Error',
                status,
                detail: errorData?.message || errorData?.detail || 'Unknown error',
                instance: error.config?.url ?? null,
                code: 'UNKNOWN_ERROR',
            };
        } else if (error.request) {
            // Запрос был отправлен, но ответа не получено
            return {
                type: 'about:blank',
                title: 'Network Error',
                status: 0,
                detail: error.message || 'No response from server',
                instance: error.config?.url ?? null,
                code: 'NETWORK_ERROR',
            };
        } else {
            // Ошибка при настройке запроса
            return {
                type: 'about:blank',
                title: 'Request Error',
                status: 0,
                detail: error.message || 'Failed to create request',
                instance: null,
                code: 'REQUEST_ERROR',
            };
        }
    }

    /**
     * Выполнить запрос к API
     */
    protected async request<TReq, TRes>(config: AxiosRequestConfig<TReq>): Promise<TRes> {
        return (await this.axiosInstance.request(config)).data as TRes;
    }

    /**
     * GET запрос
     */
    public async get<TRes>(
        url: string,
        params?: Record<string, string | number | boolean>,
    ): Promise<TRes> {
        return this.request({
            method: 'GET',
            url,
            params,
        });
    }

    /**
     * POST запрос
     */
    public async post<TRes, TReq = unknown>(url: string, data?: TReq): Promise<TRes> {
        return this.request({
            method: 'POST',
            url,
            data,
        });
    }

    /**
     * PUT запрос
     */
    public async put<TRes, TReq = unknown>(url: string, data?: TReq): Promise<TRes> {
        return this.request({
            method: 'PUT',
            url,
            data,
        });
    }

    /**
     * PATCH запрос
     */
    public async patch<TRes, TReq = unknown>(url: string, data?: TReq): Promise<TRes> {
        return this.request({
            method: 'PATCH',
            url,
            data,
        });
    }

    /**
     * DELETE запрос
     */
    public async delete<TRes, TReq = unknown>(url: string, data?: TReq): Promise<TRes> {
        return this.request({
            method: 'DELETE',
            url,
            data,
        });
    }

    /**
     * Получить экземпляр axios для расширенного использования
     */
    public getAxiosInstance(): AxiosInstance {
        return this.axiosInstance;
    }
}
