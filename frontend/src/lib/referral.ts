import Cookies from 'js-cookie';

import Config from '@/config';

const { referral: referralConfig } = Config;

const UUID_RE = new RegExp(referralConfig.codeUuidPattern, 'i');

export function isReferralCode(value: string): boolean {
    return UUID_RE.test(value.trim());
}

/**
 * Сохраняет реферальный код из query-параметра ref в cookie.
 * @returns новый search (с `?` или пустая строка), если ref был обработан; иначе `null`
 */
export function captureReferralFromSearch(search: string): string | null {
    const params = new URLSearchParams(search);
    const ref = params.get(referralConfig.searchParam)?.trim();

    if (!ref || !isReferralCode(ref)) {
        return null;
    }

    Cookies.set(referralConfig.cookieName, ref, {
        expires: referralConfig.cookieDays,
        path: referralConfig.cookiePath,
        sameSite: referralConfig.cookieSameSite,
        secure: import.meta.env.PROD,
    });

    params.delete(referralConfig.searchParam);
    const next = params.toString();
    return next ? `?${next}` : '';
}
