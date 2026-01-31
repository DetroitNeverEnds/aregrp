import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type {
    LoginData,
    PasswordResetData,
    PasswordResetConfirmData,
    AuthResponse,
    Message,
} from '../api/handlers/auth/types';
import {
    register,
    login,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
} from '../api/handlers/auth';
import type { ApiError } from '../api';

export type UserType = 'individual' | 'agent';
export type RegisterMutationData = {
    userType: UserType;

    // physical
    fullName: string;
    // agent
    organisationName: string;
    INN: string;

    // common
    email: string;
    phone: string;
    password1: string;
    password2: string;

    // other
    policyAgrement: boolean;
};

export function useRegisterMutation(
    options?: Omit<UseMutationOptions<AuthResponse, ApiError, RegisterMutationData>, 'mutationFn'>,
) {
    return useMutation({
        mutationFn: (data: RegisterMutationData) => {
            const { userType, fullName, policyAgrement: _uPA, ...other } = data;
            return register({ user_type: userType, full_name: fullName, ...other });
        },
        ...options,
    });
}

export function useLoginMutation(
    options?: Omit<UseMutationOptions<AuthResponse, ApiError, LoginData>, 'mutationFn'>,
) {
    return useMutation({
        mutationFn: login,
        ...options,
    });
}

export function useLogoutMutation(
    options?: Omit<UseMutationOptions<Message, ApiError, void>, 'mutationFn'>,
) {
    return useMutation({
        mutationFn: logout,
        ...options,
    });
}

export function useRequestPasswordResetMutation(
    options?: Omit<UseMutationOptions<Message, ApiError, PasswordResetData>, 'mutationFn'>,
) {
    return useMutation({
        mutationFn: requestPasswordReset,
        ...options,
    });
}

export function useConfirmPasswordResetMutation(
    options?: Omit<UseMutationOptions<Message, ApiError, PasswordResetConfirmData>, 'mutationFn'>,
) {
    return useMutation({
        mutationFn: confirmPasswordReset,
        ...options,
    });
}
