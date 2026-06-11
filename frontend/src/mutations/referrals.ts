import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { createReferralLink, type ReferralLinkCreateIn, type ReferralLinkOut } from '@/api';
import type { ApiError } from '@/api';

export function useCreateReferralLinkMutation(
    options?: Omit<
        UseMutationOptions<ReferralLinkOut, ApiError, ReferralLinkCreateIn>,
        'mutationFn'
    >,
) {
    return useMutation<ReferralLinkOut, ApiError, ReferralLinkCreateIn>({
        mutationFn: createReferralLink,
        ...options,
    });
}
