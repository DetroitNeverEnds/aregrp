import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
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
    const queryClient = useQueryClient();
    const { onSuccess, ...restOptions } = options ?? {};
    return useMutation({
        mutationFn: (data: RegisterMutationData) => {
            const {
                userType,
                fullName,
                organisationName,
                INN,
                policyAgrement: _uPA,
                ...other
            } = data;
            return register({
                user_type: userType,
                full_name: fullName,
                organization_name: organisationName,
                inn: INN,
                ...other,
            });
        },
        async onSuccess(data, variables, onMutateResult, mutationContext) {
            await queryClient.invalidateQueries({ queryKey: ['profile', 'user'] });
            onSuccess?.(data, variables, onMutateResult, mutationContext);
        },
        ...restOptions,
    });
}

export function useLoginMutation(
    options?: Omit<UseMutationOptions<AuthResponse, ApiError, LoginData>, 'mutationFn'>,
) {
    const queryClient = useQueryClient();
    const { onSuccess, ...restOptions } = options ?? {};
    return useMutation({
        mutationFn: login,
        async onSuccess(data, variables, onMutateResult, mutationContext) {
            await queryClient.invalidateQueries({ queryKey: ['profile', 'user'] });
            onSuccess?.(data, variables, onMutateResult, mutationContext);
        },
        ...restOptions,
    });
}

export function useLogoutMutation(
    options?: Omit<UseMutationOptions<Message, ApiError, void>, 'mutationFn'>,
) {
    return useMutation({
        mutationFn: logout,
        async onSuccess(_data, _variables, _onMutateResult, context) {
            await context.client.invalidateQueries({ queryKey: ['profile', 'user'] });
        },
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
        async onSuccess(_data, _variables, _onMutateResult, context) {
            await context.client.invalidateQueries({ queryKey: ['profile', 'user'] });
        },
        ...options,
    });
}
