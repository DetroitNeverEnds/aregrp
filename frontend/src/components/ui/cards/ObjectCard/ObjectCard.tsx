import React from 'react';
import classNames from 'classnames';
import { Button } from '../../common/Button';
import { Flex } from '../../common/Flex';
import { Divider } from '../../common/Divider';
import { Text } from '../../common/Text';
import styles from './ObjectCard.module.scss';
import { Column } from '../../layout/TwoColumnsContainer';

export interface ObjectCardProps {
    /** ID объекта */
    id: string | number;
    /** Название/адрес объекта */
    title: string;
    /** Описание объекта */
    description: string;
    /** Массив URL изображений */
    imagesUrl: string[];
    /** Цена "от" в рублях */
    priceFrom?: number;
    /** Ежемесячный платеж в рублях */
    monthlyPayment?: number;
    /** Клик по кнопке */
    onButtonClick?: () => void;
    /** Alt текст для изображения */
    imageAlt?: string;
    /** Дополнительный CSS класс */
    className?: string;
}

/**
 * Компонент карточки объекта недвижимости
 */
export const ObjectCard: React.FC<ObjectCardProps> = ({
    // id,
    title,
    description,
    imagesUrl,
    priceFrom,
    monthlyPayment,
    onButtonClick,
    imageAlt = '',
    className = '',
}) => {
    const cardClassNames = classNames(styles.objectCard, className);

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
        <Flex justify="between" gap={30} className={cardClassNames}>
            <Flex gap={20} fullWidth align="start">
                {/* Изображение */}
                {imagesUrl.length > 0 && (
                    <div className={styles.objectCard__imageWrapper}>
                        <img
                            src={imagesUrl[0]}
                            alt={imageAlt || title}
                            className={styles.objectCard__image}
                        />
                    </div>
                )}

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
                        {title}
                    </Text>
                    {(priceFrom || monthlyPayment) && (
                        <Flex gap={4} align="end">
                            {priceFrom && (
                                <Text variant="20-reg" color="gray-70">
                                    от {formatPrice(priceFrom)}
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
                    {description}
                </Text>
            </Flex>

            {/* Кнопки */}
            <Flex direction="row" gap={10} fullWidth>
                <Column>
                    {priceFrom && (
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
