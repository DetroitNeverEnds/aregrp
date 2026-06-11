import Cookies from 'js-cookie';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import Config from '@/config';

import { captureReferralFromSearch, isReferralCode } from './referral';

const { cookieName, cookiePath } = Config.referral;

describe('referral', () => {
    beforeEach(() => {
        Cookies.remove(cookieName, { path: cookiePath });
        vi.stubEnv('PROD', false);
    });

    describe('isReferralCode', () => {
        it('принимает валидный UUID', () => {
            expect(isReferralCode('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
        });

        it('отклоняет невалидное значение', () => {
            expect(isReferralCode('not-a-uuid')).toBe(false);
        });
    });

    describe('captureReferralFromSearch', () => {
        it('записывает cookie и возвращает search без ref', () => {
            const code = '550e8400-e29b-41d4-a716-446655440000';
            const premiseId = '11111111-1111-4111-8111-111111111111';
            const nextSearch = captureReferralFromSearch(
                `?ref=${code}&selectedPremise=${premiseId}`,
            );

            expect(Cookies.get(cookieName)).toBe(code);
            expect(nextSearch).toBe(`?selectedPremise=${premiseId}`);
        });

        it('возвращает пустую строку, если ref был единственным параметром', () => {
            const code = '550e8400-e29b-41d4-a716-446655440000';
            const nextSearch = captureReferralFromSearch(`?ref=${code}`);

            expect(Cookies.get(cookieName)).toBe(code);
            expect(nextSearch).toBe('');
        });

        it('возвращает null без ref', () => {
            expect(captureReferralFromSearch('?selectedPremise=abc')).toBeNull();
            expect(Cookies.get(cookieName)).toBeUndefined();
        });

        it('возвращает null при невалидном ref', () => {
            expect(captureReferralFromSearch('?ref=invalid')).toBeNull();
            expect(Cookies.get(cookieName)).toBeUndefined();
        });
    });
});
