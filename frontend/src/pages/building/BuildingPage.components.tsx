import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import Helmet from 'react-helmet';
import { FloorSchema, type FloorRoom } from '@/components/ui/building/FloorSchema';
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
import { Column } from '@/components/ui/layout/Column';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import { useTypedSearchParams, type SearchParamsParser } from '@/hooks/useTypedSearchParams';
import { BuildingOfficeFilter } from '@/components/ui/forms/BuildingOfficeFilter';
import { useFloor, usePremiseDetail, usePremisesInfinite } from '@/queries';
import { useUser } from '@/queries/profile';
import type {
    BuildingDetailOut,
    FloorResponseOut,
    PremiseDetail,
    PremiseListItem,
    SaleType,
} from '@/api';
import MedicalCrossIcon from './medical-cross.svg?react';
import { GenerateLinkModal } from './GenerateLinkModal';

import styles from './BuildingPage.module.scss';
import { SingleSelect } from '@/components/ui/common/input/Select';
import breakpointStyles from '@/styles/breakpoint-utilities.module.scss';
import { Sheet } from '@/components/ui/common/Sheet';
import { BetweenRowLayout } from '@/components/ui/layout/BetweenRowLayout';
import { useGadget } from '@/hooks';

type BuildingInfo = BuildingDetailOut;

type BuildingSearchParams = {
    floor: number;
    selectedPremise?: string;
    sale_type?: 'sale' | 'rent';
};

const parseBuildingSearchParams: SearchParamsParser<BuildingSearchParams> = raw => ({
    floor: Number(raw.floor) || 1,
    selectedPremise: raw.selectedPremise || undefined,
    sale_type: raw.sale_type === 'sale' || raw.sale_type === 'rent' ? raw.sale_type : undefined,
});

const toSearchParams = (params: BuildingSearchParams): Record<string, string> => {
    const result: Record<string, string> = {};
    if (params.floor) result.floor = String(params.floor);
    if (params.selectedPremise) result.selectedPremise = params.selectedPremise;
    if (params.sale_type) result.sale_type = params.sale_type;
    return result;
};

type PremiseDetailsCardProps = {
    data: PremiseDetail;
    canBook: boolean;
    buildingTitle: string;
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

const PremiseDetailsCardContent = ({
    data: premise,
    canBook,
    buildingTitle,
}: PremiseDetailsCardProps) => {
    const { t } = useTranslation();
    const user = useUser().data?.data;
    const isAuthenticated = user !== undefined;
    const isAgent = user?.user_type === 'agent';

    const [generateLinkOpen, setGenerateLinkOpen] = useState(false);

    return (
        <>
            <Helmet>
                <title>
                    {premise.name} - {buildingTitle}
                </title>
            </Helmet>
            <Gallery premise={premise} fit="contain" className={styles.premiseDetails__gallery} />
            <Card background="gray" gap={40} align="start" fullWidth>
                <Flex gap={6} align="start" fullWidth>
                    <Flex
                        direction="row"
                        justify="between"
                        align="start"
                        wrap="wrap"
                        fullWidth
                        gap={12}
                    >
                        <Text variant="24-med" ellipsis>
                            {premise.name}
                        </Text>

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
                    {premise.sale_price && (
                        <Text variant="24-med" color="primary-700">
                            {formatRubles(premise.sale_price)}
                        </Text>
                    )}
                    {premise.rent_price && (
                        <Text variant="20-med" color="primary-700">
                            {premise.sale_price && 'или '}
                            {formatRubles(premise.rent_price)} / месяц
                        </Text>
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
            {canBook && (
                <Flex direction="row" gap={6} align="stretch" fullWidth>
                    <Column gap={6} align="center">
                        <Button variant="primary" width="max" disabled={!isAuthenticated}>
                            {t('pages.building.book')}
                        </Button>
                        {!isAuthenticated && (
                            <Text color="gray-50" variant="12-reg">
                                {t('pages.building.authToBook')}
                            </Text>
                        )}
                    </Column>
                </Flex>
            )}

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
            svg={props.data.schema_svg || ''}
            rooms={floorData.premises ?? []}
            selectedPremiseId={selectedPremise}
            onRoomSelect={onPremiseSelect}
        />
    );
};

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
    const { floor: currentFloor, selectedPremise, sale_type: saleTypeForFloorFromParams } = params;
    const saleTypeForFloor = saleTypeForFloorFromParams || 'sale';

    // На обновление параметров, скроллим наверх
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [params.floor, params.selectedPremise]);

    const legend = useMemo(
        () => [
            {
                title: t('pages.building.legend.free'),
                style: styles.floorSchema__legend__free,
            },
            {
                title: t(
                    saleTypeForFloor === 'sale'
                        ? 'pages.building.legend.unavailable_sale'
                        : 'pages.building.legend.unavailable_rent',
                ),
                style: styles.floorSchema__legend__unavailable,
            },
            {
                title: t('pages.building.legend.other'),
                style: styles.floorSchema__legend__other,
            },
        ],
        [saleTypeForFloor, t],
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
            ...(saleTypeForFloor ? { sale_type: saleTypeForFloor } : {}),
        }),
        [buildingInfo.uuid, catalogFilter, saleTypeForFloor],
    );
    const premisesInfiniteQ = usePremisesInfinite(otherPremisesParams);

    const floorQ = useFloor(buildingInfo.uuid, saleTypeForFloor, currentFloor);
    const selectedPremiseQ = usePremiseDetail(selectedPremise);

    useEffect(() => {
        if (selectedPremiseQ.data?.data && selectedPremiseQ.data?.data.floor !== currentFloor) {
            setSearchParams(
                toSearchParams({
                    ...params,
                    floor: selectedPremiseQ.data?.data.floor ?? 0,
                    selectedPremise: undefined,
                }),
            );
        }
        return;
    }, [selectedPremiseQ.data?.data, currentFloor, setSearchParams, params]);

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

    const gadget = useGadget();

    return (
        <>
            <Helmet>
                <title>{buildingInfo.title}</title>
            </Helmet>
            <Flex direction="row" gap={24} fullWidth align="start">
                {selectedPremise && (
                    <>
                        {gadget === 'desktop' && (
                            <Card
                                withShadow
                                gap={12}
                                className={classNames(styles.officeCard)}
                                align="start"
                            >
                                <QueryBoundary
                                    query={selectedPremiseQ}
                                    render={data => (
                                        <PremiseDetailsCardContent
                                            data={data}
                                            canBook={
                                                saleTypeForFloor === 'sale' &&
                                                (floorQ.data?.data?.premises?.find(
                                                    premise => premise.uuid === selectedPremise,
                                                )?.is_available ??
                                                    false)
                                            }
                                            buildingTitle={buildingInfo.title}
                                        />
                                    )}
                                    onRetry="default"
                                />
                            </Card>
                        )}
                        {gadget === 'mobile' && (
                            <Sheet
                                open={true}
                                onClose={() =>
                                    setSearchParams(
                                        toSearchParams({ ...params, selectedPremise: undefined }),
                                    )
                                }
                                gap={20}
                            >
                                <QueryBoundary
                                    query={selectedPremiseQ}
                                    render={data => (
                                        <PremiseDetailsCardContent
                                            data={data}
                                            canBook={
                                                saleTypeForFloor === 'sale' &&
                                                (floorQ.data?.data?.premises?.find(
                                                    premise => premise.uuid === selectedPremise,
                                                )?.is_available ??
                                                    false)
                                            }
                                            buildingTitle={buildingInfo.title}
                                        />
                                    )}
                                    onRetry="default"
                                />
                            </Sheet>
                        )}
                    </>
                )}
                <Card size="xl" background="gray" className={styles.floorSchema} gap={65}>
                    <>
                        <Flex
                            direction="row"
                            justify="between"
                            align="start"
                            fullWidth
                            className={breakpointStyles.desktopOnly}
                        >
                            <Text variant="h2" className={styles.floorSchema__header__text}>
                                {buildingInfo?.title}
                            </Text>
                            <SingleSelect<SaleType>
                                options={[
                                    { label: { title: t('common.sale') }, value: 'sale' },
                                    { label: { title: t('common.rent') }, value: 'rent' },
                                ]}
                                onChange={val => setSaleType(val || 'sale')}
                                value={saleTypeForFloor}
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
                                value={saleTypeForFloor}
                            />
                            <Text variant="h2" className={styles.floorSchema__header__text}>
                                {buildingInfo?.title}
                            </Text>
                        </Flex>
                    </>

                    <Flex gap={40} fullWidth className={styles.a}>
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
                                        type={saleTypeForFloor || 'any'}
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
                <Flex
                    direction="row"
                    gap={12}
                    fullWidth
                    className={styles.infrastructure__categories}
                >
                    {buildingInfo?.media_categories.map((category, index) => (
                        <Button
                            key={category}
                            variant={category === currentMediaCategory ? 'primary' : 'outlined'}
                            onClick={() => setCurrentMediaCategoryIndex(index)}
                        >
                            {category}
                        </Button>
                    ))}
                </Flex>
                <Gallery
                    type="full"
                    size="l"
                    media={selectedMedia}
                    className={styles.infrastructure__gallery}
                    key={currentMediaCategory}
                />
            </Container>
        </>
    );
};
