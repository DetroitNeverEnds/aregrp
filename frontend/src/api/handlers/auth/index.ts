import { api } from '../../base/api';
import type {
    RegisterData,
    LoginData,
    PasswordResetData,
    PasswordResetConfirmData,
    AuthResponse,
    Message,
} from './types';

export const register = api.post<RegisterData, AuthResponse>('/auth/register');

export const login = api.post<LoginData, AuthResponse>('/auth/login');

export const logout = api.post<void, Message>('/auth/logout');

export const requestPasswordReset = api.post<PasswordResetData, Message>('/auth/password-reset');

export const confirmPasswordReset = api.post<PasswordResetConfirmData, Message>(
    '/auth/password-reset/confirm',
);

// Экспорт типов
export type * from './types';
