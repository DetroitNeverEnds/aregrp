import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex } from '../../components/ui/common/Flex';
import { useLayoutSettings } from '../../hooks/useLayoutSettings';
import type { LayoutSettings } from '../../components/ui/layout/MainLayout/Layout';
import { ObjectsFilter } from '../../components/ui/forms/ObjectsFilter';
import Text from '../../components/ui/common/Text';
import { YandexMap } from '../../components/ui/common/YandexMap';
import { BuildingCard } from '../../components/ui/cards/BuildingCard';

import styles from './Root.module.scss';
import { Button } from '../../components/ui/common/Button';
import Container, { FeatureCard } from '../../components/ui/layout/Container';
import { Column } from '../../components/ui/layout/TwoColumnsContainer';
import { Divider } from '../../components/ui/common/Divider';
import { FeedbackFormRow } from '../../components/ui/layout/FeedbackFormRow';
import { useBuildingsCatalogueInfinite, usePremises } from '../../queries/premises';
import { Welcome } from './components/Welcome';
import { VerticalMainContainer } from '../../components/ui/layout/VerticalMainContainer';
import { CardContainer } from '@/components/ui/layout/CardsContainer/CardContainer';
import { OfficeCard } from '@/components/ui/cards/OfficeCard';
import { BenifitsWorking } from '@/components/ui/cards/Benefits';
import { Page } from '@/components/ui/layout/Page/Page';
import Config from '@/config';
import { useFilterSearchParams } from '@/components/ui/forms/ObjectsFilter/useFilterSearchParams';
import { MapPin } from '@/components/ui/common/MapPin';

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
    const premises = usePremises({ page_size: Config.pageSizeMain }).data?.data;
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
    // const mapCenter = data.coordinates[0];
    // const [selectedBuildingUuid, setSelectedBuildingUuid] = useState<string | null>(null);

    // const mapMarkers: YandexMapMarkerItem[] = useMemo(() => {
    //     return buildings.map((item, index) => ({
    //         key: item.uuid,
    //         coordinates: coordinateAroundCenter(mapCenter, index, buildings.length),
    //         children: (
    //             <BuildingMapMarker
    //                 item={item}
    //                 active={selectedBuildingUuid === item.uuid}
    //                 onToggle={() =>
    //                     setSelectedBuildingUuid(prev => (prev === item.uuid ? null : item.uuid))
    //                 }
    //             />
    //         ),
    //     }));
    // }, [buildings, mapCenter, selectedBuildingUuid]);

    return (
        <Page>
            <Welcome />
            <VerticalMainContainer>
                {/* Map and default buildings */}
                <ObjectsFilter />
                <Container justify="center" align="center">
                    <Flex align="start" gap={20} fullWidth>
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
                    <YandexMap
                        markers={buildings.map(item => ({
                            key: item.uuid,
                            coordinates: item.geo_point,
                            content: <MapPin address={item.address} />,
                        }))}
                        className={styles.map}
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
                    <Flex direction="row" align="start" gap={24} fullWidth>
                        <Column gap={40}>
                            <Divider />
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
                    </Flex>
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
                            <OfficeCard key={item.uuid} item={item} />
                        ))}
                    </CardContainer>
                    <Button variant="outlined" to={getLinkToCatalogue({ sale_type: 'sale' })}>
                        Перейти в каталог
                    </Button>
                </Container>

                {/* Work with us benefits */}
                <BenifitsWorking variant="working" />

                {/* Feedback form */}
                <FeedbackFormRow />
            </VerticalMainContainer>
        </Page>
    );
};
