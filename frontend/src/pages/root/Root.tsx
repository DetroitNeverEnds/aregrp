import { useTranslation } from 'react-i18next';
import { Flex } from '../../components/ui/common/Flex';
import { useHeaderSettings } from '../../hooks/useHeaderSettings';
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
import { useBuildingsCatalogue, usePremises } from '../../queries/premises';
import type { HeaderProps } from '../../components/ui/layout/MainLayout/Header';
import { Welcome } from './components/Welcome';
import { VerticalMainContainer } from '../../components/ui/layout/VerticalMainContainer';
import { CardContainer } from '@/components/ui/layout/CardsContainer/CardContainer';
import { OfficeCard } from '@/components/ui/cards/OfficeCard';
import { BenifitsWorking } from '@/components/ui/cards/Benefits';
import { Page } from '@/components/ui/layout/Page/Page';
import _ from 'lodash';
import Config from '@/config';
import { useNavigate } from 'react-router-dom';
import { useFilterSearchParams } from '@/components/ui/forms/ObjectsFilter/useFilterSearchParams';

type Data = {
    coordinates: [number, number][];
};

const headerSettings: HeaderProps = {
    theme: 'dark',
    breadcrumbs: [],
};

export const Root = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { getLinkToCatalogue } = useFilterSearchParams();

    useHeaderSettings(headerSettings);

    const data: Data = {
        coordinates: [[44.650540230512846, 42.65871198485353]],
    };

    // const buildingsData = useBuildingsCatalogue({ page_size: Config.pageSizeMain }).data?.data;
    const premises = usePremises({ page_size: Config.pageSizeMain }).data?.data;
    const buildings = useBuildingsCatalogue({ page_size: Config.pageSizeMain }).data?.data;

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
                    <YandexMap markerCoordinates={data.coordinates[0]} className={styles.map} />

                    <CardContainer
                        loadMore={() => navigate(getLinkToCatalogue({ sale_type: 'sale' }))}
                    >
                        {buildings?.items.map(item => (
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
                    <Button
                        variant="outlined"
                        to={getLinkToCatalogue({ sale_type: 'sale' })}
                    >
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
