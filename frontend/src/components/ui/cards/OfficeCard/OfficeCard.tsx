import React, { useMemo } from 'react';
import { Flex } from '@/components/ui/common/Flex';
import { Text } from '@/components/ui/common/Text';
import { Gallery } from '@/components/ui/common/Gallery/Gallery';
import styles from './OfficeCard.module.scss';
import type { PremiseListItem } from '@/api';
import type { SaleType } from '@/api/handlers/types';
import { Divider } from '@/components/ui/common/Divider';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export interface OfficeCardProps {
    item: PremiseListItem;
    type: SaleType | 'any';
}

/**
 * Компонент карточки офиса
 * Отображает информацию о помещении с галереей изображений и кнопкой перехода
 */
export const OfficeCard: React.FC<OfficeCardProps> = ({ item, type }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const {
        uuid,
        name,
        address,
        area,
        floor,
        has_tenant,
        building_uuid,
        rent_price,
        sale_price,
        price,
    } = item;

    const formatPrice = (value: number | null) => {
        if (value === null || value === undefined) {
            return '—';
        }
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const link = useMemo(() => {
        const search: Record<string, string> = {
            selectedPremise: uuid,
        };
        if (floor?.id) {
            search.floor = floor.id;
        }
        if (type === 'sale' || type === 'rent') {
            search.sale_type = type;
        }
        return `/building/${building_uuid}?${new URLSearchParams(search)}`;
    }, [building_uuid, floor, type, uuid]);
    const navigateToOffice = () => {
        navigate(link);
        window.scrollTo({ top: 0 });
    };

    const traits = useMemo(() => {
        return [
            { label: 'Адрес', value: address },
            { label: '', value: floor?.title ?? floor?.id ?? '—' },
            { label: 'Площадь', value: `${area} м²` },
            {
                label: 'Арендатор',
                value: has_tenant
                    ? t(`components.OfficeCard.hasTennant`)
                    : t(`components.OfficeCard.noTennant`),
            },
        ];
    }, [address, area, floor?.id, floor?.title, has_tenant, t]);

    return (
        <div className={styles.officeCard}>
            <Gallery
                premise={item}
                className={styles.officeCard__gallery}
                onClick={navigateToOffice}
            />

            <Flex direction="column" gap={20} className={styles.officeCard__content}>
                <Flex
                    direction="row"
                    justify="between"
                    fullWidth
                    className={styles.officeCard__content__namePrice}
                >
                    <Text
                        variant="24-med"
                        className={styles.officeCard__name}
                        onClick={navigateToOffice}
                    >
                        {name}
                    </Text>
                    <Flex align="end" gap={8}>
                        {(type === 'any' || type == 'sale') && sale_price && (
                            <Text variant="20-med" color="gray-70" align="right">
                                {formatPrice(sale_price ?? price)}
                            </Text>
                        )}
                        {(type === 'any' || type == 'rent') && (
                            <Text variant="20-med" color="gray-70" align="right">
                                {type === 'any' && sale_price && 'или '}
                                {formatPrice(rent_price ?? price)} / месяц
                            </Text>
                        )}
                    </Flex>
                </Flex>

                <Divider />

                <Flex direction="row" align="start" gap={40} fullWidth>
                    <Flex gap={20} align="start">
                        {traits.map(trait => (
                            <Flex key={trait.label} direction="row">
                                <Text variant="20-reg">
                                    {trait.label}: {trait.value}
                                </Text>
                            </Flex>
                        ))}
                    </Flex>
                </Flex>
            </Flex>
        </div>
    );
};

export default OfficeCard;
