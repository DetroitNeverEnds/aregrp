import { api } from '../../base/api';
import type { UserData, UpdateProfileData, ChangePasswordData, Message } from './types';

/**
 * Получить данные текущего пользователя
 */
export const getUser = api.get<void, UserData>('/profile/user');

/**
 * Обновить профиль пользователя
 */
export const updateProfile = api.put<UpdateProfileData, UserData>('/profile/profile');

/**
 * Сменить пароль
 */
export const changePassword = api.post<ChangePasswordData, Message>('/profile/change-password');

// Экспорт типов
export type * from './types';
