import { FloorSchema, type FloorRoom } from '@/components/ui/building/FloorSchema';
import { fetchFloorRoomsMock, fetchFloorSvgMock } from '@/components/ui/building/FloorSchema/mocks';
import { Benefits } from '@/components/ui/cards/Benefits/Benefits';
import { OfficeCard } from '@/components/ui/cards/OfficeCard';
import { Button } from '@/components/ui/common/Button';
import { Flex } from '@/components/ui/common/Flex';
import { Gallery } from '@/components/ui/common/Gallery/Gallery';
import { Loader } from '@/components/ui/common/Loader';
import Text from '@/components/ui/common/Text';
import { CardContainer } from '@/components/ui/layout/CardsContainer';
import Container from '@/components/ui/layout/Container';
import { FeedbackFormRow } from '@/components/ui/layout/FeedbackFormRow';
import { Page } from '@/components/ui/layout/Page/Page';
import { VerticalMainContainer } from '@/components/ui/layout/VerticalMainContainer';
import { useHeaderSettings } from '@/hooks/useHeaderSettings';
import { useBuildingDetail, usePremises } from '@/queries';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';

import styles from './BuildingPage.module.scss';
import { Card } from '@/components/ui/common/Card/Card';
import { Link } from '@/components/ui/common/Link';
import type { HeaderProps } from '@/components/ui/layout/MainLayout/Header';
import _ from 'lodash';

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

    const [searchParams, setSearchParams] = useSearchParams();
    const { floor: currentFloor, selectedPremise } = useMemo<SearchParams>(
        () => ({
            floor: Number(searchParams.get('floor')) || 1,
            selectedPremise: searchParams.get('selectedPremise') || undefined,
        }),
        [searchParams],
    );
    const otherPremisesQ = usePremises({ building_uuids: buildingUuid || '' });
    const otherPremises = otherPremisesQ.data?.data;

    const onFloorSelect = (floor: number) => {
        setSearchParams({ ...searchParams, floor: floor.toString() });
    };
    const onPremiseSelect = (room: FloorRoom) => {
        setSearchParams({ ...searchParams, selectedPremise: room.name });
    };

    const [currentCategoty, setCurrentCategory] = useState(1);

    return (
        <>
            <Flex direction="row" gap={24} fullWidth>
                <Flex className={styles.officeCard}>{selectedPremise}</Flex>
                <Card size="xl" background="gray" className={styles.floorSchema} gap={65}>
                    <Flex direction="row" justify="between" align="start">
                        <Text variant="h2" className={styles.floorchema__header__text}>
                            {buildingInfo?.title} ({buildingInfo?.address})
                        </Text>
                        <Link
                            theme="black"
                            trailingIcon="download-rounded"
                            to="TODO"
                            className={styles.floorchema__header__link}
                        >
                            {t('pages.building.downloadPresentation')}
                        </Link>
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
                        <FloorSchema
                            svg={fetchFloorSvgMock()}
                            rooms={fetchFloorRoomsMock()}
                            onRoomSelect={onPremiseSelect}
                        />
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
                <Flex gap={12}>
                    {buildingInfo?.media_categories.map((category, index) => (
                        <Button
                            variant={index === currentCategoty ? 'primary' : 'secondary'}
                            onClick={() => setCurrentCategory(index)}
                        >
                            {t(`pages.building.category.${category}`)}
                        </Button>
                    ))}
                </Flex>
                <Gallery />
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
