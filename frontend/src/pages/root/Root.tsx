import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex } from '@/components/ui/common/Flex';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import type { LayoutSettings } from '@/components/ui/layout/MainLayout/Layout';
import { ObjectsFilter } from '@/components/ui/forms/ObjectsFilter';
import Text from '@/components/ui/common/Text';
import { YandexMap } from '@/components/ui/common/YandexMap';
import { BuildingCard } from '@/components/ui/cards/BuildingCard';

import styles from './Root.module.scss';
import { Button } from '@/components/ui/common/Button';
import Container, { FeatureCard } from '@/components/ui/layout/Container';
import { Column } from '@/components/ui/layout/Column';
import { Divider } from '@/components/ui/common/Divider';
import { FeedbackFormRow } from '@/components/ui/layout/FeedbackFormRow';
import { useBuildingsCatalogueInfinite, usePremises } from '@/queries/premises';
import { Welcome } from './components/Welcome';
import { VerticalMainContainer } from '@/components/ui/layout/VerticalMainContainer';
import { CardContainer } from '@/components/ui/layout/CardsContainer/CardContainer';
import { OfficeCard } from '@/components/ui/cards/OfficeCard';
import { BenifitsWorking } from '@/components/ui/cards/Benefits';
import { Page } from '@/components/ui/layout/Page/Page';
import Config from '@/config';
import { useFilterSearchParams } from '@/components/ui/forms/ObjectsFilter/useFilterSearchParams';
import { BuildingMapMarker } from './components/BuildingMapMarker/BuildingMapMarker';
import { setActiveBuildingMarkerUuid } from '@/lib/buildingMapMarkerActiveStore';
import breakpointStyles from '@/styles/breakpoint-utilities.module.scss';
import { Columns } from '@/components/ui/layout/Columns';

const layoutSettings: LayoutSettings = {
    header: {
        theme: 'dark',
        breadcrumbs: [],
    },
    mainContentBackground: 'gray-0',
};

export const Root = () => {
    const { t } = useTranslation();
    const { getLinkToCatalogue } = useFilterSearchParams();

    useLayoutSettings(layoutSettings);

    // const buildingsData = useBuildingsCatalogue({ page_size: Config.pageSizeMain }).data?.data;
    const premises = usePremises({ sale_type: 'sale', page_size: Config.pageSizeMain }).data?.data;
    const {
        data: buildingsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useBuildingsCatalogueInfinite({ page_size: Config.pageSizeMain });
    const buildings = useMemo(
        () => buildingsData?.pages.flatMap(page => page?.data?.items ?? []) ?? [],
        [buildingsData],
    );
    const mapsMarkers = useMemo(
        () =>
            buildings.map(item => ({
                key: item.uuid,
                coordinates: item.geo_point,
                content: <BuildingMapMarker item={item} />,
            })),
        [buildings],
    );

    useEffect(() => {
        return () => {
            setActiveBuildingMarkerUuid(undefined);
        };
    }, []);

    return (
        <Page>
            <Welcome />
            <VerticalMainContainer>
                {/* Map and default buildings */}
                <ObjectsFilter />
                <Container justify="center" align="center">
                    <>
                        <Flex
                            align="start"
                            gap={20}
                            fullWidth
                            className={breakpointStyles.desktopOnly}
                        >
                            <Text variant="18-reg" color="gray-50">
                                Расположение
                            </Text>
                            <Flex direction="row" justify="between" fullWidth gap={60}>
                                <Text variant="h2" color="primary-900">
                                    Наши бизнес-центры
                                </Text>
                                <Text variant="20-reg" style={{ maxWidth: '520px' }}>
                                    У нас широкий выбор офисов для выгодного инвестирования в
                                    коммерческую недвижимость
                                </Text>
                            </Flex>
                        </Flex>
                        <Flex
                            align="start"
                            gap={12}
                            fullWidth
                            className={breakpointStyles.mobileOnly}
                        >
                            <Text variant="18-reg" color="gray-50">
                                Расположение
                            </Text>
                            <Text variant="h2" color="primary-900">
                                Наши бизнес-центры
                            </Text>
                            <Text variant="20-reg" style={{ maxWidth: '520px' }}>
                                У нас широкий выбор офисов для выгодного инвестирования в
                                коммерческую недвижимость
                            </Text>
                        </Flex>
                    </>
                    <YandexMap
                        markers={mapsMarkers}
                        className={styles.map}
                        onMapClick={() => setActiveBuildingMarkerUuid(undefined)}
                    />
                    <CardContainer
                        loadMore={hasNextPage ? () => fetchNextPage() : undefined}
                        loadMoreLoading={isFetchingNextPage}
                    >
                        {buildings?.map(item => (
                            <BuildingCard key={item.uuid} item={item} />
                        ))}
                    </CardContainer>
                </Container>

                {/* Office Buildings Benefits */}
                <FeatureCard gap={80}>
                    <Columns rowsNum={2}>
                        <Column gap={40}>
                            <Divider className={breakpointStyles.desktopOnly} />
                            <Text variant="h2">{t('benefits.officeBuildings.title')}</Text>
                        </Column>
                        <Column gap={40}>
                            <Divider />
                            <Flex gap={20} fullWidth align="start">
                                <Text variant="18-reg">
                                    {t('benefits.officeBuildings.subtitle')}
                                </Text>
                                <Text variant="20-med" color="primary-yellow">
                                    {t('benefits.officeBuildings.description')}
                                </Text>
                            </Flex>
                        </Column>
                    </Columns>
                    <Flex direction="row" align="start" gap={100} fullWidth>
                        <Flex align="start">
                            <Text className={styles.benifits__number__title}>12</Text>
                            <Text variant="14-reg">
                                {t('benefits.officeBuildings.stats.businessCenters')}
                            </Text>
                        </Flex>
                        <Flex align="start">
                            <Text className={styles.benifits__number__title}>~400</Text>
                            <Text variant="14-reg">
                                {t('benefits.officeBuildings.stats.officePremises')}
                            </Text>
                        </Flex>
                    </Flex>
                </FeatureCard>

                {/* Actual offers */}
                <Container align="center">
                    <Flex fullWidth align="start">
                        <Text variant="h2">Актуальные предложения</Text>
                        <Text variant="h2" color="gray-50">
                            лучших офисов в продаже
                        </Text>
                    </Flex>
                    <CardContainer>
                        {premises?.items.map(item => (
                            <OfficeCard key={item.uuid} item={item} type="any" />
                        ))}
                    </CardContainer>
                    <>
                        <Button
                            variant="outlined"
                            to={getLinkToCatalogue({ sale_type: 'sale' })}
                            className={breakpointStyles.desktopOnly}
                        >
                            Перейти в каталог
                        </Button>
                        <Button
                            variant="outlined"
                            to={getLinkToCatalogue({ sale_type: 'sale' })}
                            className={breakpointStyles.mobileOnly}
                            width="max"
                        >
                            Перейти в каталог
                        </Button>
                    </>
                </Container>

                {/* Work with us benefits */}
                <BenifitsWorking variant="working" />

                {/* Feedback form */}
                <FeedbackFormRow originKey="main" />
            </VerticalMainContainer>
        </Page>
    );
};
