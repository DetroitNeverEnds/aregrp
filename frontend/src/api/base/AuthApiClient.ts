import {
    applyAuthTokenInterceptor,
    // clearAuthTokens,
    // setAuthTokens,
    // getAccessToken,
    type TokenRefreshRequest,
} from 'axios-jwt';
import { BaseApiClient, type BaseApiClientConfig } from './BaseApiClient';

/**
 * Ответ от API при обновлении токена
 */
interface RefreshTokenResponse {
    message: string;
    access_token: string;
    refresh_token: string;
}

/**
 * Конфигурация JWT API клиента
 */
export interface AuthApiClientConfig extends BaseApiClientConfig {
    onTokenRefresh?: (accessToken: string) => void;
    onAuthError?: () => void;
}

/**
 * API клиент с поддержкой JWT авторизации
 *
 * Автоматически добавляет JWT токен в заголовки запросов
 * и обновляет токены при истечении срока действия используя axios-jwt
 *
 * Refresh токен хранится в HttpOnly cookie на сервере (безопасный подход)
 * Access токен управляется клиентом
 */
export class AuthApiClient extends BaseApiClient {
    private onTokenRefresh?: (accessToken: string) => void;
    private onAuthError?: () => void;

    constructor(config: AuthApiClientConfig) {
        super(config);
        this.onTokenRefresh = config.onTokenRefresh;
        this.onAuthError = config.onAuthError;

        // Включаем отправку cookies для refresh токена
        this.axiosInstance.defaults.withCredentials = true;

        this.setupAuthInterceptors();
    }

    /**
     * Настроить перехватчики для авторизации
     */
    private setupAuthInterceptors(): void {
        const requestRefresh: TokenRefreshRequest = async (): Promise<string> => {
            try {
                // Refresh токен автоматически отправляется в HttpOnly cookie
                const response = await this.post<RefreshTokenResponse>(
                    '/api/auth/refresh-token',
                    {},
                );

                const accessToken = response.access_token;

                // Вызываем callback при успешном обновлении
                if (this.onTokenRefresh) {
                    this.onTokenRefresh(accessToken);
                }

                return accessToken;
            } catch (error) {
                // Вызываем callback при ошибке авторизации
                if (this.onAuthError) {
                    this.onAuthError();
                }
                throw error;
            }
        };

        // Применяем перехватчики axios-jwt
        applyAuthTokenInterceptor(this.axiosInstance, {
            requestRefresh,
            header: 'Authorization',
            headerPrefix: 'Bearer ',
        });
    }

    // /**
    //  * Установить access токен
    //  * Refresh токен уже в HttpOnly cookie на сервере
    //  */
    // public setTokens(accessToken: string): void {
    //     setAuthTokens({
    //         accessToken,
    //         refreshToken: '', // Пустая строка, т.к. refresh токен в HttpOnly cookie
    //     });

    //     // Вызываем callback
    //     if (this.onTokenRefresh) {
    //         this.onTokenRefresh(accessToken);
    //     }
    // }

    // /**
    //  * Получить текущий access токен
    //  */
    // public async getToken(): Promise<string | undefined> {
    //     return await getAccessToken();
    // }

    // /**
    //  * Очистить токены
    //  */
    // public clearTokens(): void {
    //     clearAuthTokens();
    // }

    // /**
    //  * Проверить, авторизован ли пользователь
    //  */
    // public async isAuthenticated(): Promise<boolean> {
    //     const token = await getAccessToken();
    //     return !!token;
    // }
}
