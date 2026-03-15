/**
 * Типы для profile handlers
 */

// Реэкспорт типов из auth для избежания дублирования
export type { UserData, Message } from '../auth/types';

/**
 * Данные для обновления профиля
 */
export interface UpdateProfileData {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    organization_name?: string | null;
    inn?: string | null;
}

/**
 * Данные для смены пароля
 */
export interface ChangePasswordData {
    current_password: string;
    new_password1: string;
    new_password2: string;
}
