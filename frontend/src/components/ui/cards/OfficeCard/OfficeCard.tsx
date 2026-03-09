import React, { useMemo } from 'react';
import { Button } from '../../common/Button';
import { Flex } from '../../common/Flex';
import { Text } from '../../common/Text';
import { Gallery } from '../../common/Gallery/Gallery';
import styles from './OfficeCard.module.scss';
import type { PremiseListItem } from '@/api';
import { Divider } from '@/components/ui/common/Divider';
import { useTranslation } from 'react-i18next';

export interface OfficeCardProps {
    item: PremiseListItem;
}

/**
 * Компонент карточки офиса
 * Отображает информацию о помещении с галереей изображений и кнопкой перехода
 */
export const OfficeCard: React.FC<OfficeCardProps> = ({ item }) => {
    const { t } = useTranslation();

    const { price, address, area, floor, has_tenant } = item;

    // Форматирование цены
    const formatPrice = (price: string) => {
        const numPrice = Number(price);
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numPrice);
    };

    const traits = useMemo(() => {
        return [
            { label: 'Адрес', value: address },
            { label: 'Этаж', value: floor },
            { label: 'Площадь', value: `${area} м²` },
            {
                label: 'Арендатор',
                value: has_tenant
                    ? t(`components.OfficeCard.hasTennant`)
                    : t(`components.OfficeCard.noTennant`),
            },
        ];
    }, [address, area, floor, has_tenant, t]);

    return (
        <div className={styles.officeCard}>
            <Gallery premise={item} className={styles.officeCard__gallery} />

            <Flex direction="column" gap={20} className={styles.officeCard__content}>
                <Flex direction="row" justify="between" fullWidth>
                    <Text variant="24-med">{address}</Text>
                    <Text variant="20-med" color="gray-70" align="right">
                        {formatPrice(price)} / месяц
                    </Text>
                </Flex>
                <Divider />

                <Flex direction="row" justify="between" align="start" gap={40} fullWidth>
                    <Flex gap={20} align="start">
                        {traits.map(trait => (
                            <Flex key={trait.label} direction="row">
                                <Text variant="20-reg">
                                    {trait.label}: {trait.value}
                                </Text>
                            </Flex>
                        ))}
                    </Flex>
                    <Button
                        href="TODO"
                        size="lg"
                        variant="primary"
                        icon="arrow-button"
                        iconColor="primary-yellow"
                        onlyIcon
                    />
                </Flex>
            </Flex>
        </div>
    );
};

export default OfficeCard;
