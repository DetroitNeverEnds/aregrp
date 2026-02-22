import React, { useCallback } from 'react';
import { Button } from '../../common/Button';
import { Flex } from '../../common/Flex';
import { Divider } from '../../common/Divider';
import { Text } from '../../common/Text';
import styles from './ObjectCard.module.scss';
import { Column } from '../../layout/TwoColumnsContainer';
import type { PremiseListItem } from '../../../../api';
import { Gallery } from '@/components/ui/common/Gallery/Gallery';

export interface ObjectCardProps {
    item: PremiseListItem;
}

/**
 * Компонент карточки объекта недвижимости
 */
export const ObjectCard: React.FC<ObjectCardProps> = ({ item }) => {
    const { uuid, name, price, address } = item;
    const monthlyPayment = 1;

    const onButtonClick = useCallback(() => {
        alert(`TODO: ${uuid}`);
    }, [uuid]);

    // Форматирование цены
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <Flex justify="between" gap={30} className={styles.objectCard}>
            <Flex gap={20} fullWidth align="start">
                {/* Изображение */}
                <Gallery premise={item} className={styles.objectCard__imageWrapper} />

                {/* Заголовок и цена */}
                <Flex
                    direction="row"
                    justify="between"
                    align="center"
                    fullWidth
                    className={styles.objectCard__name}
                >
                    <Text
                        variant="24-med"
                        color="primary-900"
                        className={styles.objectCard__name__title}
                    >
                        {address}
                    </Text>
                    {(price || monthlyPayment) && (
                        <Flex gap={4} align="end">
                            {price && (
                                <Text variant="20-reg" color="gray-70">
                                    от {formatPrice(Number(price))}
                                </Text>
                            )}
                            {monthlyPayment && (
                                <Text variant="14-reg" color="gray-70">
                                    или от {formatPrice(monthlyPayment)}/месяц
                                </Text>
                            )}
                        </Flex>
                    )}
                </Flex>

                {/* Разделитель */}
                <Divider />

                {/* Описание */}
                <Text variant="20-reg" color="gray-100" className={styles.objectCard__description}>
                    {name}
                </Text>
            </Flex>

            {/* Кнопки */}
            <Flex direction="row" gap={10} fullWidth>
                <Column>
                    {price && (
                        <Button variant="primary" size="md" width="max" onClick={onButtonClick}>
                            Каталог продажи
                        </Button>
                    )}
                </Column>
                <Column>
                    {monthlyPayment && (
                        <Button variant="primary" size="md" width="max" onClick={onButtonClick}>
                            Каталог аренды
                        </Button>
                    )}
                </Column>
            </Flex>
        </Flex>
    );
};

export default ObjectCard;
