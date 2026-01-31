/**
 * Типы для auth handlers
 */

/**
 * Данные пользователя
 */
export interface UserData {
    id: number;
    username: string;
    email: string;
    user_type: string;
    full_name?: string;
    phone?: string;
    organization_name?: string;
    inn?: string;
}

/**
 * Ответ авторизации
 */
export interface AuthResponse {
    user: UserData;
    access_token: string;
    refresh_token: string;
    message: string;
    use_cookies: boolean;
}

/**
 * Данные для регистрации
 */
export interface RegisterData {
    user_type: 'individual' | 'agent';
    full_name: string;
    email: string;
    phone: string;
    password1: string;
    password2: string;
    use_cookies?: boolean;
    organization_name?: string;
    inn?: string;
}

/**
 * Данные для входа
 */
export interface LoginData {
    email: string;
    password: string;
    use_cookies?: boolean;
}

/**
 * Данные для сброса пароля
 */
export interface PasswordResetData {
    email: string;
}

/**
 * Данные для подтверждения сброса пароля
 */
export interface PasswordResetConfirmData {
    token: string;
    new_password1: string;
    new_password2: string;
}

export interface Message {
    message: string;
}
