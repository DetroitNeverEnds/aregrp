import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import type { LayoutSettings } from '@/components/ui/layout/MainLayout/Layout';
import { Page } from '@/components/ui/layout/Page/Page';
import { BreadCrumbs } from '@/components/ui/common/Breadcrumbs/Breadcrumbs';
import { VerticalMainContainer } from '@/components/ui/layout/VerticalMainContainer';
import Container from '@/components/ui/layout/Container';
import { Button } from '@/components/ui/common/Button';
import { FeedbackFormRow } from '@/components/ui/layout/FeedbackFormRow';
import { Link } from '@/components/ui/common/Link';
import { Card } from '@/components/ui/common/Card/Card';
import { YandexMap } from '@/components/ui/common/YandexMap';
import { BenifitsWorking } from '@/components/ui/cards/Benefits';
import { useFilterSearchParams } from '@/components/ui/forms/ObjectsFilter/useFilterSearchParams';
import { useBuildingsCatalogueInfinite } from '@/queries/premises';
import Config from '@/config';
import { BuildingMapMarker } from '@/pages/root/components/BuildingMapMarker/BuildingMapMarker';
import { setActiveBuildingMarkerUuid } from '@/lib/buildingMapMarkerActiveStore';

import CityPic from './assets/city.svg?react';
import ArrowPic from './assets/arrow.svg?react';

import styles from './Investors.module.scss';
import { Column, TwoColumnsContainer } from '@/components/ui/layout/TwoColumnsContainer';
import { Divider } from '@/components/ui/common/Divider';
import { Collapse } from './Collapse';
import { useInvestorSettings } from '@/queries';

type StrategyKey = 'active' | 'passive' | 'individual';

export const Investors = () => {
    const { t } = useTranslation();
    const { getLinkToCatalogue } = useFilterSearchParams();
    const feedbackSectionRef = useRef<HTMLDivElement>(null);

    const layoutSettings = useMemo<LayoutSettings>(
        () => ({
            header: {
                theme: 'dark',
                breadcrumbs: [],
            },
            mainContentBackground: 'gray-0',
        }),
        [],
    );
    useLayoutSettings(layoutSettings);

    const breadcrumbs = useMemo(
        () => [
            { to: '/', label: t('bc.main') },
            { to: '/investors', label: t('header.investors') },
        ],
        [t],
    );

    const investorsData = useInvestorSettings().data?.data;
    const { data: buildingsData } = useBuildingsCatalogueInfinite({
        page_size: Config.pageSizeMain,
    });
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

    const scrollToFeedback = useCallback(() => {
        feedbackSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }, []);

    const strategies: { key: StrategyKey; link: string }[] = [
        { key: 'active', link: investorsData?.document_1 || '' },
        { key: 'passive', link: investorsData?.document_2 || '' },
        { key: 'individual', link: investorsData?.document_3 || '' },
    ];

    const faqItems = useMemo(
        () => [
            {
                question: t('pages.investors.faq.q1.question'),
                answer: t('pages.investors.faq.q1.answer'),
            },
            {
                question: t('pages.investors.faq.q2.question'),
                answer: t('pages.investors.faq.q2.answer'),
            },
        ],
        [t],
    );

    return (
        <Page>
            <VerticalMainContainer className={styles.hero} align="start" fullWidth>
                <Flex direction="column" align="start" gap={40} className={styles.hero__content}>
                    <Flex direction="column" align="start" className={styles.hero__content__text}>
                        <Text variant="h2" color="gray-0" id="investors-hero-title">
                            {t('pages.investors.hero.title')}
                        </Text>
                        <Text variant="h2" color="gray-50">
                            {t('pages.investors.hero.titleAccent')}
                        </Text>
                    </Flex>
                    <Button
                        size="lg"
                        variant="outlined"
                        theme="dark"
                        to={getLinkToCatalogue({ sale_type: 'sale' })}
                    >
                        {t('pages.investors.hero.cta')}
                    </Button>
                </Flex>
                <CityPic className={styles.hero__city} />
                <ArrowPic className={styles.hero__arrow} />
            </VerticalMainContainer>

            <VerticalMainContainer>
                <BreadCrumbs breadcrumbs={breadcrumbs} />

                <Container gap="regular" fullWidth>
                    <Flex align="start" fullWidth>
                        <Text variant="h2">{t('pages.investors.strategies.title')}</Text>
                    </Flex>
                    <TwoColumnsContainer>
                        {strategies.map(({ key, link }) => (
                            <Column>
                                <Card
                                    key={key}
                                    direction="column"
                                    align="stretch"
                                    justify="between"
                                    background="gray"
                                    size="xl"
                                    gap={20}
                                    fullWidth
                                    className={styles.strategyCard}
                                >
                                    {/* Top and content */}
                                    <Flex direction="column" align="stretch" gap={20} fullWidth>
                                        <Flex
                                            direction="row"
                                            align="center"
                                            justify="between"
                                            fullWidth
                                            gap={12}
                                            className={styles.strategyCard__header}
                                        >
                                            <Text variant="h5" color="primary-900">
                                                {t(`pages.investors.strategies.${key}.title`)}
                                            </Text>
                                            <Link
                                                to={link}
                                                size="sm"
                                                theme="black"
                                                trailingIcon="download-rounded"
                                                target="_blank"
                                            >
                                                {t('pages.investors.strategies.casesLink')}
                                            </Link>
                                        </Flex>
                                        <Divider />
                                        <Text variant="20-reg" color="gray-100">
                                            {t(`pages.investors.strategies.${key}.description`)}
                                        </Text>
                                    </Flex>
                                    {/* Bottom */}
                                    <Flex direction="column" align="stretch" gap={20} fullWidth>
                                        <Text variant="12-reg" color="gray-100">
                                            {t(`pages.investors.strategies.${key}.hint`)}
                                        </Text>
                                        <Button width="max" onClick={scrollToFeedback}>
                                            {t(`pages.investors.strategies.${key}.cta`)}
                                        </Button>
                                    </Flex>
                                </Card>
                            </Column>
                        ))}
                    </TwoColumnsContainer>
                </Container>

                <BenifitsWorking variant="sale" />

                <Container justify="center" align="center">
                    <Flex align="start" gap={20} fullWidth>
                        <Text variant="18-reg" color="gray-50">
                            {t('pages.investors.map.label')}
                        </Text>
                        <Flex direction="row" justify="between" fullWidth gap={60}>
                            <Text variant="h2" color="primary-900">
                                {t('pages.investors.map.title')}
                            </Text>
                            <Text variant="20-reg" style={{ maxWidth: '520px' }}>
                                {t('pages.investors.map.descriptionLine1')}{' '}
                                {t('pages.investors.map.descriptionLine2')}
                            </Text>
                        </Flex>
                    </Flex>
                    <YandexMap
                        markers={mapsMarkers}
                        className={styles.map}
                        onMapClick={() => setActiveBuildingMarkerUuid(undefined)}
                    />
                </Container>

                <FeedbackFormRow ref={feedbackSectionRef} originKey="investors" />

                <Container gap="regular" fullWidth>
                    <Text variant="h2" color="gray-100">
                        {t('pages.investors.faq.title')}
                    </Text>
                    <Flex
                        direction="column"
                        align="stretch"
                        gap={12}
                        fullWidth
                        className={styles.faq}
                    >
                        {faqItems.map(item => (
                            <Collapse title={item.question} collapsed={true}>
                                <Text variant="14-reg">{item.answer}</Text>
                            </Collapse>
                        ))}
                    </Flex>
                </Container>
            </VerticalMainContainer>
        </Page>
    );
};
