import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';
import type { ApiError } from '../types';

/**
 * Конфигурация базового API клиента
 */
export interface BaseApiClientConfig {
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
export class BaseApiClient {
    protected axiosInstance: AxiosInstance;

    constructor(config: BaseApiClientConfig) {
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
     */
    protected setupInterceptors(): void {
        // Перехватчик ответов для обработки ошибок
        this.axiosInstance.interceptors.response.use(
            response => response,
            (error: AxiosError) => {
                return Promise.reject(this.handleError(error));
            },
        );
    }

    /**
     * Проверить, является ли объект Problem Detail
     */
    protected isProblemDetail(obj: unknown): obj is ApiError {
        if (typeof obj !== 'object' || obj === null) {
            return false;
        }
        const required: (keyof ApiError)[] = ['type', 'title', 'status', 'detail', 'instance'];
        return required.every(key => key in obj);
    }

    /**
     * Обработать ошибку axios
     */
    protected handleError(error: AxiosError): ApiError {
        if (error.response) {
            // Сервер ответил с кодом ошибки
            const status = error.response.status;
            const data = error.response.data;

            // Если ответ содержит Problem Detail
            if (this.isProblemDetail(data)) {
                return data;
            }

            // Иначе создаем стандартную ошибку
            const errorData = data as { message?: string; detail?: string };
            return {
                type: 'about:blank',
                title: 'API Error',
                status,
                detail: errorData?.message || errorData?.detail || 'Unknown error',
                instance: error.config?.url || '',
                code: 'UNKNOWN_ERROR',
            };
        } else if (error.request) {
            // Запрос был отправлен, но ответа не получено
            return {
                type: 'about:blank',
                title: 'Network Error',
                status: 0,
                detail: error.message || 'No response from server',
                instance: error.config?.url || '',
                code: 'NETWORK_ERROR',
            };
        } else {
            // Ошибка при настройке запроса
            return {
                type: 'about:blank',
                title: 'Request Error',
                status: 0,
                detail: error.message || 'Failed to create request',
                instance: '',
                code: 'REQUEST_ERROR',
            };
        }
    }

    /**
     * Выполнить запрос к API
     */
    protected async request<TReq, TRes>(config: AxiosRequestConfig<TReq>): Promise<TRes> {
        const response = await this.axiosInstance.request(config);
        return response.data as TRes;
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
