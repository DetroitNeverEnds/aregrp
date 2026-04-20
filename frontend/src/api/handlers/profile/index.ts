import { api } from '@/api/base/api';
import type {
    UserData,
    UpdateProfileData,
    ChangePasswordData,
    Message,
    ProfilePremisesQueryParams,
    ProfilePremisesListResponse,
} from './types';

/**
 * Получить данные текущего пользователя
 */
export const getUser = api.get<void, UserData>('/profile/user');

/**
 * Объекты в личном кабинете (аренда или продажа)
 */
export const getProfilePremises = api.get<ProfilePremisesQueryParams, ProfilePremisesListResponse>(
    '/profile/premises',
);

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
