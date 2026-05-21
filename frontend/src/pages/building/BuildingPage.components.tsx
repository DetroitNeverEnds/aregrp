import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import Helmet from 'react-helmet';
import { FloorSchema, type FloorRoom } from '@/components/ui/building/FloorSchema';
import { OfficeCard } from '@/components/ui/cards/OfficeCard';
import { Button } from '@/components/ui/common/Button';
import { Card } from '@/components/ui/common/Card/Card';
import { FlatButton } from '@/components/ui/common/FlatButton';
import { Flex } from '@/components/ui/common/Flex';
import { Gallery } from '@/components/ui/common/Gallery/Gallery';
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
import type { BuildingDetailOut, FloorResponseOut, PremiseDetail, PremiseListItem } from '@/api';
import type { SaleType } from '@/api/handlers/types';
import MedicalCrossIcon from './medical-cross.svg?react';
import { GenerateLinkModal } from './GenerateLinkModal';

import styles from './BuildingPage.module.scss';
import { SingleSelect } from '@/components/ui/common/input/Select';
import breakpointStyles from '@/styles/breakpoint-utilities.module.scss';
import { Sheet } from '@/components/ui/common/Sheet';
import { BetweenRowLayout } from '@/components/ui/layout/BetweenRowLayout';
import { useDevice } from '@/hooks';
import { Link } from '@/components/ui/common/Link';
import { useLoginLink } from '@/lib/getAuthLink';
import { YandexMap } from '@/components/ui/common/YandexMap';
import { MapPin } from '@/components/ui/common/MapPin';
import { useCreatePaymentMutation } from '@/mutations';

type BuildingInfo = BuildingDetailOut;

type BuildingSearchParams = {
    floor?: string;
    selectedPremise?: string;
    sale_type?: 'sale' | 'rent';
};

const parseBuildingSearchParams: SearchParamsParser<BuildingSearchParams> = raw => ({
    floor: raw.floor,
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
    const loginLink = useLoginLink();
    const isAgent = user?.user_type === 'agent';

    const [generateLinkOpen, setGenerateLinkOpen] = useState(false);
    const createPaymentM = useCreatePaymentMutation();

    const onBookClick = useCallback(async () => {
        createPaymentM.reset();

        try {
            const payment = await createPaymentM.mutateAsync({ premise_uuid: premise.uuid });
            const confirmationUrl = payment.confirmation?.confirmation_url;

            if (confirmationUrl) {
                window.location.assign(confirmationUrl);
                return;
            }
        } catch {
            return;
        }
    }, [createPaymentM, premise.uuid]);

    return (
        <>
            <Helmet>
                <title>
                    {premise.name} - {buildingTitle}
                </title>
            </Helmet>
            <Card
                background="gray"
                gap={40}
                align="start"
                fullWidth
                className={styles.premiseDetails}
            >
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
                        {t('pages.building.floor')}: {premise.floor_id}
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
                        <Button
                            variant="primary"
                            width="max"
                            disabled={!isAuthenticated || createPaymentM.isPending}
                            onClick={onBookClick}
                        >
                            {t('pages.building.book')}
                        </Button>
                        {!isAuthenticated && (
                            <Text color="gray-50" variant="12-reg">
                                <Link to={loginLink} size="sm">
                                    {t('pages.building.authToBook.auth')}
                                </Link>
                                {t('pages.building.authToBook.toBook')}
                            </Text>
                        )}
                        {isAuthenticated && createPaymentM.error && (
                            <Text color="error-default" variant="12-reg">
                                {/* {createPaymentM.error.detail || t('errors.somethingWrong')} */}
                                {t(`errors.${createPaymentM.error.code}`)}
                            </Text>
                        )}
                    </Column>
                </Flex>
            )}
            <Gallery premise={premise} orientation="vertical" size="m" type="thumbs" />

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
    const { floor: currentFloorRaw, selectedPremise, sale_type: saleTypeRaw } = params;
    const currentFloor = currentFloorRaw || buildingInfo.floors?.[0]?.key;
    const saleType = saleTypeRaw || 'sale';

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

    // Building info
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
        const premiseFloorId = selectedPremiseQ.data?.data?.floor_id;
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
                                                saleType === 'sale' &&
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
                    >
                        <QueryBoundary
                            query={selectedPremiseQ}
                            render={data => (
                                <PremiseDetailsCardContent
                                    data={data}
                                    canBook={
                                        saleType === 'sale' &&
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
                <Card size="xl" background="gray" className={styles.floorSchema} gap={20}>
                    <>
                        <Flex
                            direction="row"
                            justify="between"
                            align="start"
                            fullWidth
                            className={breakpointStyles.desktopOnly}
                        >
                            <Text variant="h3" className={styles.floorSchema__header__text}>
                                {buildingInfo?.title}
                            </Text>
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
        </>
    );
};
