import { useTranslation } from 'react-i18next';
import { Flex } from '../../components/ui/common/Flex';
import Text from '../../components/ui/common/Text';
import { useHeaderSettings } from '../../hooks/useHeaderSettings';
import { useMemo } from 'react';
import type { HeaderProps } from '../../components/ui/layout/MainLayout/Header';
import { useFilterSearchParams } from '@/components/ui/forms/ObjectsFilter/useFilterSearchParams';
import { VerticalMainContainer } from '@/components/ui/layout/VerticalMainContainer';
import { Contaier } from '@/components/ui/layout/Container';
import { ObjectsFilter } from '@/components/ui/forms/ObjectsFilter';

export const Catalogue = () => {
    const { t } = useTranslation();
    const { filter } = useFilterSearchParams();
    const headerSettings: HeaderProps = useMemo(
        () => ({
            theme: 'light',
            breadcrumbs: [
                { to: '/', label: t('bc.main') },
                {
                    to: `/catalogue?filter={"type":"${filter.type === 'sale' ? 'sale' : 'rent'}"}`,
                    label: filter.type === 'sale' ? t('header.sale') : t('header.rent'),
                },
            ],
        }),
        [filter.type, t],
    );
    useHeaderSettings(headerSettings);
    return (
        <Flex justify="center" align="center" fullWidth>
            <VerticalMainContainer>
                <Contaier>
                    <Flex direction="row" justify="between" fullWidth>
                        <Text variant="h2">
                            {filter.type === 'sale'
                                ? t('pages.catalogue.title.sale')
                                : t('pages.catalogue.title.rent')}
                        </Text>
                        <Text variant="20-reg">{t('pages.catalogue.subtitle')}</Text>
                    </Flex>
                    <ObjectsFilter />
                </Contaier>
            </VerticalMainContainer>
        </Flex>
    );
};
