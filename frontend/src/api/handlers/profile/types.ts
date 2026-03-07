/**
 * Типы для profile handlers
 */

// Реэкспорт типов из auth для избежания дублирования
export type { UserData, Message } from '../auth/types';

/**
 * Данные для обновления профиля
 */
export interface UpdateProfileData {
    full_name?: string;
    email?: string;
    phone?: string;
    organization_name?: string;
    inn?: string;
}

/**
 * Данные для смены пароля
 */
export interface ChangePasswordData {
    current_password: string;
    new_password1: string;
    new_password2: string;
}
