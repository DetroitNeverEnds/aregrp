import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import Helmet from 'react-helmet';
import { OfficeCard } from '@/components/ui/cards/OfficeCard';
import { Button } from '@/components/ui/common/Button';
import { Card } from '@/components/ui/common/Card/Card';
import { Flex } from '@/components/ui/common/Flex';
import { Gallery } from '@/components/ui/common/Gallery/Gallery';
import { Loader } from '@/components/ui/common/Loader';
import Text from '@/components/ui/common/Text';
import { CardContainer } from '@/components/ui/layout/CardsContainer';
import Container from '@/components/ui/layout/Container';
import type { LayoutSettings } from '@/components/ui/layout/MainLayout/Layout';
import { InfiniteQueryBoundary } from '@/components/ui/layout/QueryBoundary/InfiniteQueryBoundary';
import { QueryBoundary } from '@/components/ui/layout/QueryBoundary/QueryBoundary';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import { useTypedSearchParams } from '@/hooks/useTypedSearchParams';
import { BuildingOfficeFilter } from '@/components/ui/forms/BuildingOfficeFilter';
import { useFloor, usePremiseDetail, usePremisesInfinite } from '@/queries';
import type { BuildingDetailOut, PremiseListItem } from '@/api';
import type { SaleType } from '@/api/handlers/types';
import { SingleSelect } from '@/components/ui/common/input/Select';
import breakpointStyles from '@/styles/breakpoint-utilities.module.scss';
import { Sheet } from '@/components/ui/common/Sheet';
import { BetweenRowLayout } from '@/components/ui/layout/BetweenRowLayout';
import { useDevice } from '@/hooks';
import { Link } from '@/components/ui/common/Link';
import { YandexMap } from '@/components/ui/common/YandexMap';
import { MapPin } from '@/components/ui/common/MapPin';
import { PanoramaModal } from '@/components/ui/common/PanoramaModal';
import { parseBuildingSearchParams, toSearchParams } from './buildingSearchParams';
import { PremiseDetailsCardContent } from './PremiseDetailsCardContent';
import { FloorSchemaContent } from './FloorSchemaContent';
import styles from '../BuildingPage.module.scss';

type BuildingInfo = BuildingDetailOut;

type BuildingContentProps = {
    data: BuildingInfo;
};

export const BuildingContent = ({ data: buildingInfo }: BuildingContentProps) => {
    const { t } = useTranslation();

    const [params, _rawParams, setSearchParams] = useTypedSearchParams(parseBuildingSearchParams);
    const setSaleType = useCallback(
        (saleType: SaleType) => {
            setSearchParams(
                toSearchParams({
                    ...params,
                    selectedPremise: undefined,
                    sale_type: saleType || 'sale',
                }),
            );
        },
        [params, setSearchParams],
    );
    const { floor: currentFloorRaw, selectedPremise, sale_type: saleTypeRaw } = params;
    const currentFloor = currentFloorRaw || buildingInfo.floors?.[0]?.key;
    const saleType = saleTypeRaw || 'sale';
    const presentation =
        (saleType === 'rent' ? buildingInfo.presentation_rent : buildingInfo.presentation_sale) ||
        undefined;

    const legend = useMemo(
        () => [
            {
                title: t('pages.building.legend.free'),
                style: styles.floorSchema__legend__free,
            },
            {
                title: t('pages.building.legend.unavailable'),
                style: styles.floorSchema__legend__unavailable,
            },
            {
                title: t('pages.building.legend.windows'),
                style: styles.floorSchema__legend__windows,
            },
            {
                title: t('pages.building.legend.partitions'),
                style: styles.floorSchema__legend__partitions,
            },
        ],
        [t],
    );

    const buildingPageSearch = useMemo(() => {
        const q = toSearchParams(params);
        const s = new URLSearchParams(q).toString();
        return s ? `?${s}` : '';
    }, [params]);

    const layoutSettings = useMemo<LayoutSettings>(
        () => ({
            header: {
                theme: 'light',
                breadcrumbs: [
                    { to: '/', label: t('bc.main') },
                    {
                        to: `/building/${buildingInfo.uuid}${buildingPageSearch}`,
                        label: buildingInfo.title,
                    },
                ],
            },
            mainContentBackground: 'gray-0',
        }),
        [buildingInfo.title, buildingInfo.uuid, buildingPageSearch, t],
    );
    useLayoutSettings(layoutSettings);

    const buildingMedia = useMemo(() => buildingInfo.media ?? [], [buildingInfo.media]);

    const [catalogFilter, setCatalogFilter] = useState<{
        min_price?: number;
        max_price?: number;
        min_area?: number;
        max_area?: number;
    }>({});

    const otherPremisesParams = useMemo(
        () => ({
            building_uuids: buildingInfo.uuid,
            ...catalogFilter,
            ...(saleType ? { sale_type: saleType } : {}),
        }),
        [buildingInfo.uuid, catalogFilter, saleType],
    );
    const premisesInfiniteQ = usePremisesInfinite(otherPremisesParams);

    const floorQ = useFloor(buildingInfo.uuid, saleType || 'sale', currentFloor);
    const selectedPremiseQ = usePremiseDetail(selectedPremise);

    useEffect(() => {
        const premiseFloorId = selectedPremiseQ.data?.data?.floor?.id;
        if (premiseFloorId && premiseFloorId !== currentFloor) {
            setSearchParams(
                toSearchParams({
                    ...params,
                    floor: premiseFloorId,
                    selectedPremise: undefined,
                }),
            );
        }
        return;
    }, [selectedPremiseQ.data?.data, currentFloor, setSearchParams, params]);

    const onFloorSelect = useCallback(
        (floor: string) => {
            setSearchParams(toSearchParams({ ...params, floor, selectedPremise: undefined }));
        },
        [params, setSearchParams],
    );

    const onCatalogFilterChange = useCallback(
        (filter: {
            min_price?: number;
            max_price?: number;
            min_area?: number;
            max_area?: number;
        }) => {
            setCatalogFilter(filter);
        },
        [],
    );

    const device = useDevice();
    const [buildingPanoramaOpen, setBuildingPanoramaOpen] = useState(false);
    const hasBuildingPanoramas = useMemo(
        () => buildingInfo.floors?.some(floor => (floor.panoramas?.length ?? 0) > 0) ?? false,
        [buildingInfo.floors],
    );

    return (
        <>
            <Helmet>
                <title>{buildingInfo.title}</title>
            </Helmet>
            <Flex direction="row" gap={24} fullWidth align="start">
                {device === 'desktop' && (selectedPremise || buildingMedia.length > 0) && (
                    <Card withShadow className={classNames(styles.officeCard)} align="start">
                        <Flex gap={12} className={styles.officeCard__content} align="start">
                            {selectedPremise ? (
                                <QueryBoundary
                                    query={selectedPremiseQ}
                                    render={data => (
                                        <PremiseDetailsCardContent
                                            data={data}
                                            canBook={
                                                floorQ.data?.data?.premises?.find(
                                                    premise => premise.uuid === selectedPremise,
                                                )?.is_available ?? false
                                            }
                                            dealType={saleType}
                                            buildingTitle={buildingInfo.title}
                                        />
                                    )}
                                    onRetry="default"
                                />
                            ) : (
                                <>
                                    <Text
                                        variant="20-med"
                                        className={styles.officeCard__content__title}
                                    >
                                        Места общего пользования
                                    </Text>
                                    <Gallery
                                        media={buildingMedia}
                                        type="full"
                                        size="m"
                                        fit="cover"
                                        orientation="vertical"
                                        className={styles.buildingMediaSidebar}
                                    />
                                </>
                            )}
                        </Flex>
                    </Card>
                )}
                {selectedPremise && device === 'mobile' && (
                    <Sheet
                        open={true}
                        onClose={() =>
                            setSearchParams(
                                toSearchParams({ ...params, selectedPremise: undefined }),
                            )
                        }
                        gap={20}
                        lockBodyScroll
                    >
                        <QueryBoundary
                            query={selectedPremiseQ}
                            render={data => (
                                <PremiseDetailsCardContent
                                    data={data}
                                    canBook={
                                        floorQ.data?.data?.premises?.find(
                                            premise => premise.uuid === selectedPremise,
                                        )?.is_available ?? false
                                    }
                                    dealType={saleType}
                                    buildingTitle={buildingInfo.title}
                                />
                            )}
                            onRetry="default"
                        />
                    </Sheet>
                )}
                <Card size="xl" background="gray" className={styles.floorSchema} gap={20}>
                    <>
                        <Flex
                            direction="row"
                            justify="between"
                            align="start"
                            fullWidth
                            className={breakpointStyles.desktopOnly}
                        >
                            <Flex gap={8} align="start" wrap="wrap">
                                <Text variant="h3" className={styles.floorSchema__header__text}>
                                    {buildingInfo?.title}
                                </Text>
                                {presentation && (
                                    <Link
                                        to={presentation}
                                        variant="external"
                                        target="_blank"
                                        leadingIcon="download-rounded"
                                        className={styles.floorSchema__header__link}
                                        theme="black"
                                    >
                                        {t('pages.building.downloadPresentation')}
                                    </Link>
                                )}
                                {hasBuildingPanoramas && (
                                    <Button
                                        variant="outlined"
                                        size="sm"
                                        onClick={() => setBuildingPanoramaOpen(true)}
                                    >
                                        {t('pages.building.viewBuildingPanorama')}
                                    </Button>
                                )}
                            </Flex>
                            <SingleSelect<SaleType>
                                options={[
                                    { label: { title: t('common.sale') }, value: 'sale' },
                                    { label: { title: t('common.rent') }, value: 'rent' },
                                ]}
                                onChange={val => setSaleType(val || 'sale')}
                                value={saleType}
                            />
                        </Flex>
                        <Flex
                            align="start"
                            gap={12}
                            fullWidth
                            className={breakpointStyles.mobileOnly}
                        >
                            <SingleSelect<SaleType>
                                options={[
                                    { label: { title: t('common.sale') }, value: 'sale' },
                                    { label: { title: t('common.rent') }, value: 'rent' },
                                ]}
                                onChange={val => setSaleType(val || 'sale')}
                                value={saleType}
                            />
                            <Text variant="h2" className={styles.floorSchema__header__text}>
                                {buildingInfo?.title}
                            </Text>
                            {presentation && (
                                <Link
                                    to={presentation}
                                    variant="external"
                                    target="_blank"
                                    leadingIcon="download-rounded"
                                    className={styles.floorSchema__header__link}
                                >
                                    {t('pages.building.downloadPresentation')}
                                </Link>
                            )}
                            {hasBuildingPanoramas && (
                                <Button
                                    variant="outlined"
                                    size="sm"
                                    onClick={() => setBuildingPanoramaOpen(true)}
                                >
                                    {t('pages.building.viewBuildingPanorama')}
                                </Button>
                            )}
                        </Flex>
                    </>

                    <Flex gap={20} fullWidth className={styles.a}>
                        <Flex direction="row" gap={20} wrap="wrap">
                            {legend.map(({ title, style }) => (
                                <Flex key={title} direction="row" gap={8}>
                                    <div className={style} />
                                    <Text variant="14-reg">{title}</Text>
                                </Flex>
                            ))}
                        </Flex>
                        <QueryBoundary
                            query={floorQ}
                            render={data => <FloorSchemaContent data={data} />}
                            onRetry="default"
                        />

                        <Flex direction="row" gap={12}>
                            {buildingInfo.floors?.map(floor => (
                                <Button
                                    key={floor.key}
                                    variant={currentFloor === floor.key ? 'primary' : 'secondary'}
                                    onClick={() => onFloorSelect(floor.key)}
                                    disabled={
                                        (saleType === 'sale' && !floor.has_sale) ||
                                        (saleType === 'rent' && !floor.has_rent)
                                    }
                                >
                                    {floor.title}
                                </Button>
                            ))}
                        </Flex>
                    </Flex>
                </Card>
            </Flex>

            {device === 'mobile' && (
                <Flex gap={8} align="start">
                    <Text variant="20-med">Места общего пользования</Text>
                    <Gallery
                        media={buildingMedia}
                        type="thumbs"
                        size="m"
                        fit="cover"
                        orientation="horizontal"
                        className={styles.buildingMediaSidebar}
                    />
                </Flex>
            )}

            <Container>
                <BetweenRowLayout>
                    <Text variant="h2">{t('pages.building.officeCatalogue')}</Text>
                    <Text variant="20-reg">{t('pages.catalogue.subtitle')}</Text>
                </BetweenRowLayout>
                <Flex gap={20} fullWidth align="start">
                    <BuildingOfficeFilter
                        key={JSON.stringify(catalogFilter)}
                        value={catalogFilter}
                        onChange={onCatalogFilterChange}
                    />
                </Flex>
                <InfiniteQueryBoundary<PremiseListItem>
                    query={premisesInfiniteQ}
                    loadingFallback={<Loader />}
                    onRetry="default"
                >
                    {({ items, loadMore, isFetchingNextPage }) =>
                        items.length === 0 ? (
                            <Text color="gray-50">{t('pages.catalogue.noResults')}</Text>
                        ) : (
                            <CardContainer loadMore={loadMore} loadMoreLoading={isFetchingNextPage}>
                                {items.map(premiseData => (
                                    <OfficeCard
                                        key={premiseData.uuid}
                                        item={premiseData}
                                        type={saleType || 'any'}
                                    />
                                ))}
                            </CardContainer>
                        )
                    }
                </InfiniteQueryBoundary>
            </Container>

            {buildingInfo.geo_point && (
                <Container>
                    <Text variant="h2">Местоположение</Text>
                    <YandexMap
                        staticMap
                        className={styles.map}
                        markers={[
                            {
                                key: `building-${buildingInfo.uuid}`,
                                coordinates: {
                                    lat: buildingInfo.geo_point.lat,
                                    lon: buildingInfo.geo_point.lon,
                                },
                                content: <MapPin address={buildingInfo.address} />,
                            },
                        ]}
                    />
                </Container>
            )}

            {hasBuildingPanoramas && currentFloor && (
                <PanoramaModal
                    open={buildingPanoramaOpen}
                    onClose={() => setBuildingPanoramaOpen(false)}
                    mode="building"
                    floors={buildingInfo.floors ?? []}
                    initialFloorKey={currentFloor}
                    title={`${buildingInfo.title} — ${t('pages.building.viewBuildingPanorama')}`}
                />
            )}
        </>
    );
};
