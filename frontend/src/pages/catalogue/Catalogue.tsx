import { useTranslation } from 'react-i18next';
import { Flex } from '../../components/ui/common/Flex';
import Text from '../../components/ui/common/Text';
import { useHeaderSettings } from '../../hooks/useHeaderSettings';
import { useCallback, useMemo } from 'react';
import type { HeaderProps } from '../../components/ui/layout/MainLayout/Header';
import { useFilterSearchParams } from '@/components/ui/forms/ObjectsFilter/useFilterSearchParams';
import { VerticalMainContainer } from '@/components/ui/layout/VerticalMainContainer';
import { Contaier } from '@/components/ui/layout/Container';
import { ObjectsFilter } from '@/components/ui/forms/ObjectsFilter';
import { CardContainer } from '@/components/ui/layout/CardsContainer';
import { usePremises } from '@/queries';
import { Loader } from '@/components/ui/common/Loader';
import { OfficeCard } from '@/components/ui/cards/OfficeCard';

const ResultsView = () => {
    const { t } = useTranslation();
    const { filter, setFilter } = useFilterSearchParams();
    const { data: queryData, isFetching } = usePremises(filter);
    const data = queryData?.data;
    const offices = data?.items;
    const error = queryData?.error;

    const onPageChange = useCallback(
        (page: number) => {
            setFilter({ ...filter, page });
        },
        [filter, setFilter],
    );

    if (isFetching) {
        return <Loader height={400} />;
    }
    if (error) {
        <Text>{t(`errors.${error.code}`, '<Unknown Error>')}</Text>;
    }
    if (offices === undefined || offices.length === 0) {
        return <Text color="gray-50">{t('pages.catalogue.noResults')}</Text>;
    }

    return (
        <CardContainer
            pagination={{
                currentPage: data?.page || 1,
                totalPages:
                    data?.total && data?.page_size ? Math.ceil(data?.total / data?.page_size) : 1,
                onPageChange,
            }}
        >
            {offices.map(item => (
                <OfficeCard key={item.uuid} item={item} />
            ))}
        </CardContainer>
    );
};

export const Catalogue = () => {
    const { t } = useTranslation();
    const { filter, getLinkToCatalogue } = useFilterSearchParams();
    const headerSettings: HeaderProps = useMemo(
        () => ({
            theme: 'light',
            breadcrumbs: [
                { to: '/', label: t('bc.main') },
                {
                    to: getLinkToCatalogue({ sale_type: filter.sale_type }),
                    label: filter.sale_type === 'sale' ? t('header.sale') : t('header.rent'),
                },
            ],
        }),
        [filter.sale_type, t, getLinkToCatalogue],
    );
    useHeaderSettings(headerSettings);

    return (
        <Flex justify="center" align="center" fullWidth>
            <VerticalMainContainer>
                <Contaier>
                    <Flex direction="row" justify="between" fullWidth>
                        <Text variant="h2">
                            {filter.sale_type === 'sale'
                                ? t('pages.catalogue.title.sale')
                                : t('pages.catalogue.title.rent')}
                        </Text>
                        <Text variant="20-reg">{t('pages.catalogue.subtitle')}</Text>
                    </Flex>
                    <ObjectsFilter />
                    <ResultsView />
                </Contaier>
            </VerticalMainContainer>
        </Flex>
    );
};
