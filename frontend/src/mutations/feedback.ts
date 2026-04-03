import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { createFeedback, type FeedbackCreateIn, type FeedbackOut } from '../api';
import type { ApiError } from '../api';

export function useCreateFeedbackMutation(
    options?: Omit<UseMutationOptions<FeedbackOut, ApiError, FeedbackCreateIn>, 'mutationFn'>,
) {
    return useMutation({
        mutationFn: createFeedback,
        ...options,
    });
}
