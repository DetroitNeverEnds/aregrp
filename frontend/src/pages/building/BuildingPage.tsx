import { FloorSchema, type FloorRoom } from '@/components/ui/building/FloorSchema';
import { fetchFloorRoomsMock, fetchFloorSvgMock } from '@/components/ui/building/FloorSchema/mocks';
import { Benefits } from '@/components/ui/cards/Benefits/Benefits';
import { OfficeCard } from '@/components/ui/cards/OfficeCard';
import { Button } from '@/components/ui/common/Button';
import { Flex } from '@/components/ui/common/Flex';
import { Gallery, type GalleryMedia } from '@/components/ui/common/Gallery/Gallery';
import { Loader } from '@/components/ui/common/Loader';
import Text from '@/components/ui/common/Text';
import { CardContainer } from '@/components/ui/layout/CardsContainer';
import Container from '@/components/ui/layout/Container';
import { FeedbackFormRow } from '@/components/ui/layout/FeedbackFormRow';
import { Page } from '@/components/ui/layout/Page/Page';
import { VerticalMainContainer } from '@/components/ui/layout/VerticalMainContainer';
import { useHeaderSettings } from '@/hooks/useHeaderSettings';
import { useBuildingDetail, useFloor, usePremiseDetail, usePremises } from '@/queries';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';

import styles from './BuildingPage.module.scss';
import { Card } from '@/components/ui/common/Card/Card';
import type { HeaderProps } from '@/components/ui/layout/MainLayout/Header';
import _ from 'lodash';
import { Column } from '@/components/ui/layout/TwoColumnsContainer';

type Params = { buildingUuid: string };
type SearchParams = {
    floor?: number;
    selectedPremise?: string;
};

const BuildingContent = () => {
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

    const { buildingUuid } = useParams<Params>();
    const buildingInfo = useBuildingDetail(buildingUuid || '').data?.data;

    // Header settings
    const headerSettings: HeaderProps = useMemo(
        () => ({
            breadcrumbs: [
                {
                    label: t('bc.main'),
                    to: '/',
                },
                {
                    label: buildingInfo?.title || '',
                    to: `/building/${buildingUuid}`,
                },
            ],
            theme: 'light',
        }),
        [buildingInfo?.title, buildingUuid, t],
    );
    useHeaderSettings(headerSettings);

    // Building info
    const [currentMediaCategotyIndex, setCurrentMediaCategoryIndex] = useState(0);
    const currentMediaCategoty = useMemo(
        () => buildingInfo?.media_categories[currentMediaCategotyIndex] || '',
        [buildingInfo?.media_categories, currentMediaCategotyIndex],
    );
    const selectedMedia: GalleryMedia[] | undefined = useMemo(
        () => buildingInfo?.media.filter(media => media.category === currentMediaCategoty),
        [buildingInfo?.media, currentMediaCategoty],
    );

    const otherPremisesQ = usePremises({ building_uuids: buildingUuid || '' });
    const otherPremises = otherPremisesQ.data?.data;

    // Floor and selected premise (selected)
    const [searchParams, setSearchParams] = useSearchParams();
    const searchParamsObj = useMemo(
        () => Object.fromEntries(searchParams.entries()),
        [searchParams],
    );
    const { floor: currentFloor, selectedPremise } = useMemo<SearchParams>(
        () => ({
            floor: Number(searchParams.get('floor')) || 1,
            selectedPremise: searchParams.get('selectedPremise') || undefined,
        }),
        [searchParams],
    );
    const floorInfo = useFloor(buildingInfo?.uuid || '', currentFloor).data?.data;

    const selectedPremiseQ = usePremiseDetail(selectedPremise);
    const selectedPremiseData = selectedPremiseQ.data?.data;

    const onFloorSelect = useCallback(
        (floor: number) => {
            setSearchParams({ ...searchParamsObj, floor: floor.toString() });
        },
        [searchParamsObj, setSearchParams],
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
        <>
            <Flex direction="row" gap={24} fullWidth>
                {selectedPremise && (
                    <Card withShadow gap={12} className={styles.officeCard} align="start">
                        <Gallery
                            premise={selectedPremiseData}
                            fit="contain"
                            className={styles.premiseDetails__gallery}
                        />
                        <Card background="gray" gap={40} align="start" fullWidth>
                            <Flex gap={6} align="start">
                                <Text variant="24-med">{selectedPremiseData?.name}</Text>
                                <Text variant="24-med" color="primary-800">
                                    {selectedPremiseData?.price} ₽
                                </Text>
                            </Flex>
                            <Flex gap={8} align="start">
                                <Text variant="14-reg" color="gray-70">
                                    Адрес: {selectedPremiseData?.address}
                                </Text>
                                <Text variant="14-reg" color="gray-70">
                                    Площадь: {selectedPremiseData?.area}
                                </Text>

                                <Text variant="14-reg" color="gray-70">
                                    Этаж: {selectedPremiseData?.floor}
                                </Text>

                                <Text variant="14-reg" color="gray-70">
                                    Арендатор:{' '}
                                    {selectedPremiseData?.has_tenant
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
                        {floorInfo ? (
                            <FloorSchema
                                svg={fetchFloorSvgMock()}
                                rooms={floorInfo?.premises || []}
                                onRoomSelect={onPremiseSelect}
                            />
                        ) : (
                            <Loader />
                        )}
                        <Flex direction="row" gap={12}>
                            {_.range(1, buildingInfo?.total_floors || 1 + 1).map(floor => (
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
                {otherPremisesQ.isPending ? (
                    <Loader />
                ) : (
                    <CardContainer>
                        {otherPremises?.items?.map(premiseData => (
                            <OfficeCard key={premiseData.name} item={premiseData} />
                        ))}
                    </CardContainer>
                )}
            </Container>
            <Container>
                <Text variant="h2">Инфраструктура бизнес-центра</Text>
                <Flex direction="row" gap={12}>
                    {buildingInfo?.media_categories.map((category, index) => (
                        <Button
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

export const BuildingPage = () => {
    const { t } = useTranslation('pages.building');
    const { buildingUuid } = useParams<Params>();
    const { isPending } = useBuildingDetail(buildingUuid || '');

    return (
        <Page>
            <VerticalMainContainer>
                {buildingUuid ? (
                    isPending ? (
                        <Loader />
                    ) : (
                        <BuildingContent />
                    )
                ) : (
                    <Text>{t('noUuid')}</Text>
                )}
                <Benefits variant="sale" />
                <FeedbackFormRow />
            </VerticalMainContainer>
        </Page>
    );
};
