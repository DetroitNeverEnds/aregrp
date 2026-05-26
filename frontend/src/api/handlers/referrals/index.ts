import { api } from '@/api/base/api';
import type { ReferralLinkCreateIn, ReferralLinkOut } from './types';

export const createReferralLink = api.post<ReferralLinkCreateIn, ReferralLinkOut>(
    '/referrals/links',
);

export type * from './types';
