/**
 * Базовые типы для работы с API
 */

export type ApiErrorCode =
    | 'ACCOUNTS_INVALID_CREDENTIALS'
    | 'ACCOUNTS_EMAIL_EXISTS'
    | 'ACCOUNTS_PHONE_EXISTS'
    | 'ACCOUNTS_PASSWORD_MISMATCH'
    | 'ACCOUNTS_PASSWORD_VALIDATION_FAILED'
    | 'ACCOUNTS_INVALID_USER_TYPE'
    | 'ACCOUNTS_MISSING_ORGANIZATION_NAME'
    | 'ACCOUNTS_MISSING_INN'
    | 'ACCOUNTS_UNAUTHORIZED'
    | 'ACCOUNTS_TOKEN_EXPIRED'
    | 'ACCOUNTS_INVALID_TOKEN'
    | 'ACCOUNTS_NO_REFRESH_TOKEN'
    | 'ACCOUNTS_USER_NOT_FOUND'
    | 'ACCOUNTS_EMAIL_ALREADY_USED'
    | 'ACCOUNTS_PHONE_ALREADY_USED'
    | 'ACCOUNTS_INVALID_CURRENT_PASSWORD'
    | 'ACCOUNTS_REGISTRATION_ERROR'
    | 'ACCOUNTS_LOGIN_ERROR'
    | 'ACCOUNTS_PASSWORD_RESET_ERROR'
    | 'ACCOUNTS_PASSWORD_RESET_TOKEN_INVALID'
    | 'ACCOUNTS_PASSWORD_RESET_TOKEN_EXPIRED'
    | 'FEEDBACK_NOT_FOUND'
    | 'FEEDBACK_CREATION_ERROR'
    | 'FEEDBACK_UPDATE_ERROR'
    | 'FEEDBACK_DELETE_ERROR'
    | 'FEEDBACK_VALIDATION_ERROR'
    | 'SITE_SETTINGS_NOT_FOUND'
    | 'SITE_SETTINGS_ERROR'
    | 'RE_OBJECTS_NOT_FOUND';

/**
 * Ошибка API по RFC 7807 (Problem Details for HTTP APIs) из OpenAPI (api.json).
 *
 * Отличия от "классического" RFC7807:
 * - поле instance в OpenAPI nullable и не является required
 * - поле code — enum ApiErrorCode
 */
export interface ProblemDetail {
    type: string;
    status: number;
    title: string;
    detail: string;
    instance?: string | null;
    code: ApiErrorCode;
}

/**
 * Ошибки, сформированные клиентом (сеть, таймауты, нестандартные ответы и т.п.)
 */
export type ClientErrorCode = 'UNKNOWN_ERROR' | 'NETWORK_ERROR' | 'REQUEST_ERROR';

export interface ClientError {
    type: 'about:blank';
    title: 'API Error' | 'Network Error' | 'Request Error';
    status: number;
    detail: string;
    instance?: string | null;
    code: ClientErrorCode;
}

export type ApiError = ProblemDetail | ClientError;
