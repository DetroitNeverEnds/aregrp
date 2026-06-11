import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { createPayment, type PaymentCreateIn, type PaymentCreateOut } from '@/api';
import type { ApiError } from '@/api';

export function useCreatePaymentMutation(
    options?: Omit<UseMutationOptions<PaymentCreateOut, ApiError, PaymentCreateIn>, 'mutationFn'>,
) {
    return useMutation<PaymentCreateOut, ApiError, PaymentCreateIn>({
        mutationFn: createPayment,
        ...options,
    });
}
