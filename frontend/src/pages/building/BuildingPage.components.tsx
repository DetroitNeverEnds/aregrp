import { useTranslation } from 'react-i18next';
import { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import { FloorSchema, type FloorRoom } from '@/components/ui/building/FloorSchema';
import { fetchFloorSvgMock } from '@/components/ui/building/FloorSchema/mocks';
import { OfficeCard } from '@/components/ui/cards/OfficeCard';
import { Button } from '@/components/ui/common/Button';
import { Card } from '@/components/ui/common/Card/Card';
import { FlatButton } from '@/components/ui/common/FlatButton';
import { Flex } from '@/components/ui/common/Flex';
import { Gallery, type GalleryMedia } from '@/components/ui/common/Gallery/Gallery';
import { Loader } from '@/components/ui/common/Loader';
import Text from '@/components/ui/common/Text';
import { CardContainer } from '@/components/ui/layout/CardsContainer';
import Container from '@/components/ui/layout/Container';
import type { LayoutSettings } from '@/components/ui/layout/MainLayout/Layout';
import { InfiniteQueryBoundary } from '@/components/ui/layout/QueryBoundary/InfiniteQueryBoundary';
import { QueryBoundary } from '@/components/ui/layout/QueryBoundary/QueryBoundary';
import { Column } from '@/components/ui/layout/TwoColumnsContainer';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import { useTypedSearchParams, type SearchParamsParser } from '@/hooks/useTypedSearchParams';
import { BuildingOfficeFilter } from '@/components/ui/forms/BuildingOfficeFilter';
import { useFloor, usePremiseDetail, usePremisesInfinite } from '@/queries';
import { useUser } from '@/queries/profile';
import type { BuildingDetailOut, FloorResponseOut, PremiseDetail, PremiseListItem } from '@/api';
import MedicalCrossIcon from './medical-cross.svg?react';
import { GenerateLinkModal } from './GenerateLinkModal';

import styles from './BuildingPage.module.scss';

type BuildingInfo = BuildingDetailOut;

type BuildingSearchParams = {
    floor: number;
    selectedPremise?: string;
};

const parseBuildingSearchParams: SearchParamsParser<BuildingSearchParams> = raw => ({
    floor: Number(raw.floor) || 1,
    selectedPremise: raw.selectedPremise || undefined,
});

const toSearchParams = (params: BuildingSearchParams): Record<string, string> => {
    const result: Record<string, string> = {};
    if (params.floor) result.floor = String(params.floor);
    if (params.selectedPremise) result.selectedPremise = params.selectedPremise;
    return result;
};

type PremiseDetailsCardProps = {
    data: PremiseDetail;
};

const formatRubles = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
        return '—';
    }
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const PremiseDetailsCard = (props: PremiseDetailsCardProps) => {
    const premise = props.data;

    const { t } = useTranslation();
    const user = useUser().data?.data;
    const isAgent = user?.user_type === 'agent';

    const [generateLinkOpen, setGenerateLinkOpen] = useState(false);

    const primaryPrice = useMemo(
        () => premise.rent_price ?? premise.sale_price ?? premise.price,
        [premise],
    );

    return (
        <>
            <Card withShadow gap={12} className={styles.officeCard} align="start">
                <Gallery
                    premise={premise}
                    fit="contain"
                    className={styles.premiseDetails__gallery}
                />
                <Card background="gray" gap={40} align="start" fullWidth>
                    <Flex
                        direction="row"
                        justify="between"
                        align="start"
                        wrap="wrap"
                        fullWidth
                        gap={12}
                    >
                        <Flex gap={6} align="start">
                            <Text variant="24-med">{premise.name}</Text>
                            {premise.sale_price && (
                                <Text variant="24-med" color="primary-700">
                                    {formatRubles(primaryPrice)}
                                </Text>
                            )}
                            {premise.rent_price && (
                                <Text variant="20-med" color="primary-700">
                                    {premise.rent_price && 'или '}
                                    {formatRubles(primaryPrice)} / месяц
                                </Text>
                            )}
                        </Flex>

                        {isAgent && (
                            <FlatButton
                                type="button"
                                className={classNames(styles.premiseDetails__generateLink)}
                                onClick={() => setGenerateLinkOpen(true)}
                            >
                                <MedicalCrossIcon />
                                <Text variant="12-med">{t('pages.building.generateLink')}</Text>
                            </FlatButton>
                        )}
                    </Flex>
                    <Flex gap={8} align="start">
                        <Text variant="14-reg" color="gray-70">
                            {t('pages.building.address')}: {premise.address}
                        </Text>
                        <Text variant="14-reg" color="gray-70">
                            {t('pages.building.area')}: {premise.area}
                        </Text>

                        <Text variant="14-reg" color="gray-70">
                            {t('pages.building.floor')}: {premise.floor}
                        </Text>

                        <Text variant="14-reg" color="gray-70">
                            {t('pages.building.tenant')}:{' '}
                            {premise.has_tenant
                                ? t(`components.OfficeCard.hasTennant`)
                                : t(`components.OfficeCard.noTennant`)}
                        </Text>
                    </Flex>
                </Card>
                <Flex direction="row" gap={6} align="stretch" fullWidth>
                    <Column>
                        <Button variant="primary" width="max">
                            {t('pages.building.reserve')}
                        </Button>
                    </Column>
                    {/* TODO: Add details button */}
                    {/* <Column>
                    <Button variant="outlined" width="max">
                        {t('pages.building.details')}
                    </Button>
                </Column> */}
                </Flex>
            </Card>

            <GenerateLinkModal
                open={generateLinkOpen}
                onClose={() => setGenerateLinkOpen(false)}
                premise={premise}
            />
        </>
    );
};

type FloorSchemaContentProps = {
    data: FloorResponseOut;
};

const FloorSchemaContent = (props: FloorSchemaContentProps) => {
    const floorData = props.data;

    const [{ selectedPremise }, rawParams, setSearchParams] =
        useTypedSearchParams(parseBuildingSearchParams);

    const onPremiseSelect = useCallback(
        (room: FloorRoom) => {
            const isAlreadySelected = room.uuid === selectedPremise;
            if (isAlreadySelected) {
                const { selectedPremise: _, ...rest } = rawParams;
                setSearchParams(rest);
            } else {
                setSearchParams({
                    ...rawParams,
                    selectedPremise: room.uuid,
                });
            }
        },
        [rawParams, selectedPremise, setSearchParams],
    );

    return (
        <FloorSchema
            svg={fetchFloorSvgMock()}
            rooms={floorData.premises ?? []}
            selectedPremiseId={selectedPremise}
            onRoomSelect={onPremiseSelect}
        />
    );
};

type BuildingContentProps = {
    data: BuildingInfo;
};

export const BuildingContent = (props: BuildingContentProps) => {
    const { data: buildingInfo } = props;

    const { t } = useTranslation();

    const legend = useMemo(
        () => [
            {
                title: t('pages.building.legend.free'),
                style: styles.floorchema__legend__free,
            },
            {
                title: t('pages.building.legend.occupied'),
                style: styles.floorchema__legend__occupied,
            },
            {
                title: t('pages.building.legend.other'),
                style: styles.floorchema__legend__other,
            },
        ],
        [t],
    );

    const layoutSettings = useMemo<LayoutSettings>(
        () => ({
            header: {
                theme: 'light',
                breadcrumbs: [
                    { to: '/', label: t('bc.main') },
                    { to: `/building/${buildingInfo.uuid}`, label: buildingInfo.title },
                ],
            },
            mainContentBackground: 'gray-0',
        }),
        [buildingInfo.title, buildingInfo.uuid, t],
    );
    useLayoutSettings(layoutSettings);

    // Building info
    const [currentMediaCategoryIndex, setCurrentMediaCategoryIndex] = useState(0);
    const currentMediaCategory = useMemo(
        () => buildingInfo.media_categories[currentMediaCategoryIndex] || '',
        [buildingInfo.media_categories, currentMediaCategoryIndex],
    );
    const selectedMedia: GalleryMedia[] | undefined = useMemo(
        () => buildingInfo.media.filter(media => media.category === currentMediaCategory),
        [buildingInfo.media, currentMediaCategory],
    );

    // Floor, selected premise, and catalog filter (local state, not in URL)
    const [params, _rawParams, setSearchParams] = useTypedSearchParams(parseBuildingSearchParams);
    const { floor: currentFloor, selectedPremise } = params;

    const [catalogFilter, setCatalogFilter] = useState<{
        min_price?: number;
        max_price?: number;
        min_area?: number;
        max_area?: number;
    }>({});

    const otherPremisesParams = useMemo(
        () => ({ building_uuids: buildingInfo.uuid, ...catalogFilter }),
        [buildingInfo.uuid, catalogFilter],
    );
    const premisesInfiniteQ = usePremisesInfinite(otherPremisesParams);

    const floorQ = useFloor(buildingInfo.uuid, currentFloor);
    const selectedPremiseQ = usePremiseDetail(selectedPremise);

    const onFloorSelect = useCallback(
        (floor: number) => {
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

    return (
        <>
            <Flex direction="row" gap={24} fullWidth align="start">
                <div
                    className={styles.detailsPanelWrapper}
                    style={{ width: selectedPremise ? 500 : 0 }}
                >
                    {selectedPremise && (
                        <QueryBoundary
                            query={selectedPremiseQ}
                            Component={PremiseDetailsCard}
                            onRetry="default"
                        />
                    )}
                </div>
                <Card size="xl" background="gray" className={styles.floorSchema} gap={65}>
                    <Flex direction="row" justify="between" align="start">
                        <Text variant="h2" className={styles.floorchema__header__text}>
                            {buildingInfo?.title}
                            {/* ({buildingInfo?.address}) */}
                        </Text>
                    </Flex>
                    <Flex gap={40} fullWidth>
                        <Flex direction="row" gap={20}>
                            {legend.map(({ title, style }) => (
                                <Flex key={title} direction="row" gap={8}>
                                    <div className={style} />
                                    <Text variant="14-reg">{title}</Text>
                                </Flex>
                            ))}
                        </Flex>
                        <QueryBoundary
                            query={floorQ}
                            Component={FloorSchemaContent}
                            onRetry="default"
                        />

                        <Flex direction="row" gap={12}>
                            {_.range(1, (buildingInfo.total_floors || 1) + 1).map(floor => (
                                <Button
                                    key={floor}
                                    variant={currentFloor === floor ? 'primary' : 'secondary'}
                                    onClick={() => onFloorSelect(floor)}
                                >
                                    {t('pages.building.floor')} {floor}
                                </Button>
                            ))}
                        </Flex>
                    </Flex>
                </Card>
            </Flex>

            {/* Каталог других офисов */}
            <Container>
                <Flex direction="row" justify="between" align="center" fullWidth>
                    <Text variant="h2">{t('pages.building.officeCatalogue')}</Text>
                    <Text variant="20-reg">{t('pages.catalogue.subtitle')}</Text>
                </Flex>
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
                                        type="any"
                                    />
                                ))}
                            </CardContainer>
                        )
                    }
                </InfiniteQueryBoundary>
            </Container>

            {/* Картинки инфраструктуры */}
            <Container>
                <Text variant="h2">{t('pages.building.infrastructure')}</Text>
                <Flex direction="row" gap={12}>
                    {buildingInfo?.media_categories.map((category, index) => (
                        <Button
                            key={category}
                            variant={category === currentMediaCategory ? 'primary' : 'secondary'}
                            onClick={() => setCurrentMediaCategoryIndex(index)}
                        >
                            {category}
                        </Button>
                    ))}
                </Flex>
                <Gallery
                    size="l"
                    media={selectedMedia}
                    className={styles.gallery}
                    key={currentMediaCategory}
                />
            </Container>
        </>
    );
};
