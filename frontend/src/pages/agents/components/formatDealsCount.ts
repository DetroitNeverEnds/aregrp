import type { TFunction } from 'i18next';

export const formatDealsCount = (count: number, t: TFunction): string => {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
        return t('pages.agents.topPartners.deals_one', { count });
    }

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        return t('pages.agents.topPartners.deals_few', { count });
    }

    return t('pages.agents.topPartners.deals_many', { count });
};
