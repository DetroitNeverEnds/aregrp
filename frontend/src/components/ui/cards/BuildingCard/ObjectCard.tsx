import { Button } from '../../common/Button';
import { Flex } from '../../common/Flex';
import { Divider } from '../../common/Divider';
import { Text } from '../../common/Text';
import styles from './ObjectCard.module.scss';
import { Column } from '../../layout/TwoColumnsContainer';
import { type BuildingCatalogue } from '@/api';
import { Gallery } from '@/components/ui/common/Gallery/Gallery';

export interface BuildingCardProps {
    item: BuildingCatalogue;
}

/**
 * Компонент карточки здания (building)
 */
export const BuildingCard: React.FC<BuildingCardProps> = ({ item }) => {
    const {
        // title,
        description,
        address,
        min_rent_price: minRentPrice,
        min_sale_price: minSalePrice,
    } = item;

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
        <Flex justify="between" gap={30} className={styles.buildingCard}>
            <Flex gap={20} fullWidth align="start">
                {/* Изображение */}
                <Gallery building={item} className={styles.buildingCard__imageWrapper} />

                {/* Заголовок и цена */}
                <Flex
                    direction="row"
                    justify="between"
                    align="center"
                    fullWidth
                    className={styles.buildingCard__name}
                >
                    <Text
                        variant="24-med"
                        color="primary-900"
                        className={styles.buildingCard__name__title}
                    >
                        {address}
                    </Text>
                    {(minRentPrice || minSalePrice) && (
                        <Flex gap={4} align="end">
                            {minSalePrice && (
                                <Text variant="20-reg" color="gray-70">
                                    от {formatPrice(Number(minSalePrice))}
                                </Text>
                            )}
                            {minSalePrice && minRentPrice && <Text> или </Text>}
                            {minRentPrice && (
                                <Text variant="14-reg" color="gray-70">
                                    от {formatPrice(minRentPrice)}/месяц
                                </Text>
                            )}
                        </Flex>
                    )}
                </Flex>

                {/* Разделитель */}
                <Divider />

                {/* Описание */}
                <Text
                    variant="20-reg"
                    color="gray-100"
                    className={styles.buildingCard__description}
                >
                    {description}
                </Text>
            </Flex>

            {/* Кнопки */}
            <Flex direction="row" gap={10} fullWidth>
                <Column>
                    {minSalePrice && (
                        <Button href="TODO" variant="primary" size="md" width="max">
                            Каталог продажи
                        </Button>
                    )}
                </Column>
                <Column>
                    {minRentPrice && (
                        <Button href="TODO" variant="primary" size="md" width="max">
                            Каталог аренды
                        </Button>
                    )}
                </Column>
            </Flex>
        </Flex>
    );
};

export default BuildingCard;
