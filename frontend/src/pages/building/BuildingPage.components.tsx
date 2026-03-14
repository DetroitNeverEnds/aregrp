import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { FloorSchema, type FloorRoom } from '@/components/ui/building/FloorSchema';
import { fetchFloorSvgMock } from '@/components/ui/building/FloorSchema/mocks';
import { Benefits } from '@/components/ui/cards/Benefits/Benefits';
import { OfficeCard } from '@/components/ui/cards/OfficeCard';
import { Button } from '@/components/ui/common/Button';
import { Card } from '@/components/ui/common/Card/Card';
import { Flex } from '@/components/ui/common/Flex';
import { Gallery, type GalleryMedia } from '@/components/ui/common/Gallery/Gallery';
import { Loader } from '@/components/ui/common/Loader';
import Text from '@/components/ui/common/Text';
import { CardContainer } from '@/components/ui/layout/CardsContainer';
import Container from '@/components/ui/layout/Container';
import { FeedbackFormRow } from '@/components/ui/layout/FeedbackFormRow';
import type { HeaderProps } from '@/components/ui/layout/MainLayout/Header';
import { Page } from '@/components/ui/layout/Page/Page';
import { QueryBoundary } from '@/components/ui/layout/QueryBoundary/QueryBoundary';
import { Column } from '@/components/ui/layout/TwoColumnsContainer';
import { VerticalMainContainer } from '@/components/ui/layout/VerticalMainContainer';
import { useHeaderSettings } from '@/hooks/useHeaderSettings';
import { useFloor, usePremiseDetail, usePremises } from '@/queries';
import type {
    BuildingDetailOut,
    FloorResponseOut,
    PremiseDetail,
    PremiseListResponse,
} from '@/api';

import styles from './BuildingPage.module.scss';

type BuildingInfo = BuildingDetailOut;

type PremiseDetailsCardProps = {
    data: PremiseDetail;
};

const PremiseDetailsCard = (props: PremiseDetailsCardProps) => {
    const premise = props.data;

    const { t } = useTranslation();

    return (
        <Card withShadow gap={12} className={styles.officeCard} align="start">
            <Gallery premise={premise} fit="contain" className={styles.premiseDetails__gallery} />
            <Card background="gray" gap={40} align="start" fullWidth>
                <Flex gap={6} align="start">
                    <Text variant="24-med">{premise.name}</Text>
                    <Text variant="24-med" color="primary-800">
                        {premise.price} ₽
                    </Text>
                </Flex>
                <Flex gap={8} align="start">
                    <Text variant="14-reg" color="gray-70">
                        Адрес: {premise.address}
                    </Text>
                    <Text variant="14-reg" color="gray-70">
                        Площадь: {premise.area}
                    </Text>

                    <Text variant="14-reg" color="gray-70">
                        Этаж: {premise.floor}
                    </Text>

                    <Text variant="14-reg" color="gray-70">
                        Арендатор:{' '}
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
                <Column>
                    <Button variant="outlined" width="max">
                        {t('pages.building.details')}
                    </Button>
                </Column>
            </Flex>
        </Card>
    );
};

type FloorSchemaContentProps = {
    data: FloorResponseOut;
};

const FloorSchemaContent = (props: FloorSchemaContentProps) => {
    const floorData = props.data;

    const [searchParams, setSearchParams] = useSearchParams();
    const searchParamsObj = useMemo(
        () => Object.fromEntries(searchParams.entries()),
        [searchParams],
    );

    const onPremiseSelect = useCallback(
        (room: FloorRoom) => {
            setSearchParams({
                ...searchParamsObj,
                selectedPremise: room.uuid,
            });
        },
        [searchParamsObj, setSearchParams],
    );

    return (
        <FloorSchema
            svg={fetchFloorSvgMock()}
            rooms={floorData.premises ?? []}
            onRoomSelect={onPremiseSelect}
        />
    );
};

type OtherPremisesCardsProps = {
    data: PremiseListResponse;
};

const OtherPremisesCards = (props: OtherPremisesCardsProps) => {
    const premises = props.data;

    return (
        <CardContainer>
            {premises.items?.map(premiseData => (
                <OfficeCard key={premiseData.name} item={premiseData} />
            ))}
        </CardContainer>
    );
};

type BuildingContentProps = {
    buildingInfo: BuildingInfo;
};

export const BuildingContent = (props: BuildingContentProps) => {
    const { buildingInfo } = props;

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

    // Header settings
    const headerSettings: HeaderProps = useMemo(
        () => ({
            breadcrumbs: [
                {
                    label: t('bc.main'),
                    to: '/',
                },
                {
                    label: buildingInfo.title,
                    to: `/building/${buildingInfo.uuid}`,
                },
            ],
            theme: 'light',
        }),
        [buildingInfo.title, buildingInfo.uuid, t],
    );
    useHeaderSettings(headerSettings);

    // Building info
    const [currentMediaCategotyIndex, setCurrentMediaCategoryIndex] = useState(0);
    const currentMediaCategoty = useMemo(
        () => buildingInfo.media_categories[currentMediaCategotyIndex] || '',
        [buildingInfo.media_categories, currentMediaCategotyIndex],
    );
    const selectedMedia: GalleryMedia[] | undefined = useMemo(
        () => buildingInfo.media.filter(media => media.category === currentMediaCategoty),
        [buildingInfo.media, currentMediaCategoty],
    );

    const otherPremisesParams = useMemo(
        () => ({ building_uuids: buildingInfo.uuid }),
        [buildingInfo.uuid],
    );
    const otherPremisesQ = usePremises(otherPremisesParams);

    // Floor and selected premise (selected)
    const [searchParams, setSearchParams] = useSearchParams();
    const searchParamsObj = useMemo(
        () => Object.fromEntries(searchParams.entries()),
        [searchParams],
    );
    const { floor: currentFloor, selectedPremise } = useMemo(
        () => ({
            floor: Number(searchParams.get('floor')) || 1,
            selectedPremise: searchParams.get('selectedPremise') || undefined,
        }),
        [searchParams],
    );

    const floorQ = useFloor(buildingInfo.uuid, currentFloor);
    const selectedPremiseQ = usePremiseDetail(selectedPremise);

    const onFloorSelect = useCallback(
        (floor: number) => {
            setSearchParams({ ...searchParamsObj, floor: floor.toString() });
        },
        [searchParamsObj, setSearchParams],
    );

    return (
        <>
            <Flex direction="row" gap={24} fullWidth>
                {selectedPremise && (
                    <QueryBoundary
                        query={selectedPremiseQ}
                        Component={PremiseDetailsCard}
                        onRetry="default"
                    />
                )}
                <Card size="xl" background="gray" className={styles.floorSchema} gap={65}>
                    <Flex direction="row" justify="between" align="start">
                        <Text variant="h2" className={styles.floorchema__header__text}>
                            {buildingInfo?.title} ({buildingInfo?.address})
                        </Text>
                    </Flex>
                    <Flex gap={40}>
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
            <Container>
                <QueryBoundary
                    query={otherPremisesQ}
                    Component={OtherPremisesCards}
                    loadingFallback={<Loader />}
                    onRetry="default"
                />
            </Container>
            <Container>
                <Text variant="h2">Инфраструктура бизнес-центра</Text>
                <Flex direction="row" gap={12}>
                    {buildingInfo?.media_categories.map((category, index) => (
                        <Button
                            key={category}
                            variant={category === currentMediaCategoty ? 'primary' : 'secondary'}
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
                    key={currentMediaCategoty}
                />
            </Container>
        </>
    );
};

type BuildingDetailBoundaryContentProps = {
    data: BuildingInfo;
};

export const BuildingDetailBoundaryContent = (props: BuildingDetailBoundaryContentProps) => {
    return (
        <Page>
            <VerticalMainContainer>
                <BuildingContent buildingInfo={props.data} />
                <Benefits variant="sale" />
                <FeedbackFormRow />
            </VerticalMainContainer>
        </Page>
    );
};
