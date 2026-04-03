import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createBooking, type BookingCreateIn, type BookingOut } from '../api';
import type { ApiError } from '../api';

export function useCreateBookingMutation(
    options?: Omit<UseMutationOptions<BookingOut, ApiError, BookingCreateIn>, 'mutationFn'>,
) {
    const queryClient = useQueryClient();
    const { onSuccess, ...restOptions } = options ?? {};
    return useMutation({
        mutationFn: createBooking,
        async onSuccess(data, variables, onMutateResult, mutationContext) {
            await queryClient.invalidateQueries({ queryKey: ['profile', 'bookings'] });
            await queryClient.invalidateQueries({ queryKey: ['premises'] });
            onSuccess?.(data, variables, onMutateResult, mutationContext);
        },
        ...restOptions,
    });
}
