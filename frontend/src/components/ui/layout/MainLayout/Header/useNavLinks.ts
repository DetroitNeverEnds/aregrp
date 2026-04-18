import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFilterSearchParams } from '@/components/ui/forms/ObjectsFilter/useFilterSearchParams';
import { useSiteInfo } from '@/queries/siteInfo';
import type { LinkProps } from '@/components/ui/common/Link';

export const useNavLinks = () => {
    const { t } = useTranslation();
    const { getLinkToCatalogue } = useFilterSearchParams();
    const siteInfo = useSiteInfo().data?.data;

    const navLinks: Partial<LinkProps> & { label: string; to: string }[] = useMemo(
        () => [
            {
                to: getLinkToCatalogue({ sale_type: 'sale' }),
                label: t('header.sale'),
            },
            {
                to: getLinkToCatalogue({ sale_type: 'rent' }),
                label: t('header.rent'),
            },
            {
                to: '/investors',
                label: t('header.investors'),
            },
            {
                to: '/agents',
                label: t('header.agents'),
            },
            {
                to: '/contacts',
                label: t('header.contacts'),
            },
            {
                to: siteInfo?.cases || '',
                label: t('header.cases'),
                target: '_blank',
                trailingIcon: 'download-rounded',
            },
        ],
        [getLinkToCatalogue, siteInfo?.cases, t],
    );

    return navLinks;
};
