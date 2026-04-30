import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSiteInfo } from '@/queries/siteInfo';
import { useFilterSearchParams } from '@/components/ui/forms/ObjectsFilter/useFilterSearchParams';

export const useFooterLinks = () => {
    const { t } = useTranslation();
    const siteInfo = useSiteInfo().data?.data;
    const { getLinkToCatalogue } = useFilterSearchParams();

    return useMemo(
        () => [
            {
                title: t('footer.navigation.title'),
                links: [
                    { to: '/', label: t('footer.navigation.main') },
                    {
                        to: getLinkToCatalogue({ sale_type: 'sale' }),
                        label: t('footer.navigation.sale'),
                    },
                    {
                        to: getLinkToCatalogue({ sale_type: 'rent' }),
                        label: t('footer.navigation.rent'),
                    },
                    { to: '/investors', label: t('footer.navigation.investors') },
                    { to: '/agents', label: t('footer.navigation.agents') },
                    { to: '/contacts', label: t('footer.navigation.contacts') },
                ],
            },
            {
                title: t('footer.legal.title'),
                links: [
                    { to: '/privacy.pdf', label: t('footer.legal.privacy'), reloadDocument: true },
                    { to: '/oplata.pdf', label: t('footer.legal.payment'), reloadDocument: true },
                ],
            },
            {
                title: t('footer.contacts.title'),
                links: [
                    { to: `tel:${siteInfo?.phone}`, label: siteInfo?.display_phone || '-' },
                    { to: `mailto:${siteInfo?.email}`, label: siteInfo?.email || '-' },
                    { to: siteInfo?.telegram_link || '', label: t('footer.contacts.telegram') },
                    { to: siteInfo?.max_link || '', label: t('footer.contacts.max') },
                ],
            },
        ],
        [
            t,
            getLinkToCatalogue,
            siteInfo?.phone,
            siteInfo?.display_phone,
            siteInfo?.email,
            siteInfo?.telegram_link,
            siteInfo?.max_link,
        ],
    );
};
