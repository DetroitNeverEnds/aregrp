import { useTranslation } from 'react-i18next';
import { Flex } from '../components/ui/common/Flex';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';
import { useMemo } from 'react';
import { ObjectsFilter } from '../components/ui/forms/ObjectsFilter';
import Text from '../components/ui/common/Text';
import { YandexMap } from '../components/ui/common/YandexMap';
import { ObjectCard } from '../components/ui/cards/ObjectCard';
import { mockObjectCards } from '../components/ui/cards/ObjectCard/ObjectCard.mock';

import styles from './Root.module.scss';

type Data = {
    coordinates: [number, number][];
};

export const Root = () => {
    const { t } = useTranslation();

    const bc = useMemo(() => [{ to: '/', label: t('bc.main') }], [t]);
    useBreadcrumbs(bc);

    const data: Data = {
        coordinates: [[44.650540230512846, 42.65871198485353]],
    };

    const handleCardClick = (id: string | number) => {
        console.log('Card clicked:', id);
        // TODO: Добавить навигацию на страницу объекта
    };

    return (
        <Flex justify="center" align="center" fullWidth gap={60}>
            <ObjectsFilter onSubmit={data => console.log(data)} />
            <Flex align="start" gap={20} fullWidth>
                <Text variant="18-reg" color="gray-50">
                    Расположение
                </Text>
                <Flex direction="row" justify="between" fullWidth>
                    <Text variant="h2" color="primary-900">
                        Наши бизнес-центры
                    </Text>
                    <Text variant="20-reg" style={{ maxWidth: '520px' }}>
                        У нас широкий выбор офисов для выгодного инвестирования в коммерческую
                        недвижимость
                    </Text>
                </Flex>
            </Flex>
            <YandexMap markerCoordinates={data.coordinates[0]} className={styles.map} />

            {/* Секция с карточками объектов */}
            <Flex align="start" gap={40} fullWidth>
                <Text variant="h2" color="primary-900">
                    Доступные объекты
                </Text>
                <div className={styles.cardsGrid}>
                    {mockObjectCards.map(card => (
                        <ObjectCard
                            key={card.id}
                            {...card}
                            onButtonClick={() => handleCardClick(card.id)}
                        />
                    ))}
                </div>
            </Flex>
        </Flex>
    );
};
