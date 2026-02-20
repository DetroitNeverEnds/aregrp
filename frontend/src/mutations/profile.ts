import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import {
    updateProfile,
    changePassword,
    type UpdateProfileData,
    type ChangePasswordData,
    type UserData,
    type Message,
} from '../api';
import type { ApiError } from '../api';

/**
 * Хук для обновления профиля пользователя
 */
export function useUpdateProfileMutation(
    options?: Omit<UseMutationOptions<UserData, ApiError, UpdateProfileData>, 'mutationFn'>,
) {
    return useMutation({
        mutationFn: updateProfile,
        ...options,
    });
}

/**
 * Хук для смены пароля
 */
export function useChangePasswordMutation(
    options?: Omit<UseMutationOptions<Message, ApiError, ChangePasswordData>, 'mutationFn'>,
) {
    return useMutation({
        mutationFn: changePassword,
        ...options,
    });
}