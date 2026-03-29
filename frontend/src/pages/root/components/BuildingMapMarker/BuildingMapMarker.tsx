import { Link } from 'react-router-dom';
import classNames from 'classnames';
import type { BuildingCatalogue } from '@/api';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';
import { useFilterSearchParams } from '@/components/ui/forms/ObjectsFilter/useFilterSearchParams';
import MarkerPinIcon from '@/icons/other/marker-pin.svg?react';
import styles from './BuildingMapMarker.module.scss';

export type BuildingMapMarkerProps = {
    item: BuildingCatalogue;
    active: boolean;
    onToggle: () => void;
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);

export const BuildingMapMarker = ({ item, active, onToggle }: BuildingMapMarkerProps) => {
    const { getLinkToCatalogue } = useFilterSearchParams();
    const { uuid, title, min_sale_price: minSalePrice, min_rent_price: minRentPrice, media } = item;
    const previewUrl = media.find(m => m.type === 'photo')?.url;

    return (
        <div
            className={classNames(styles.root, active && styles.rootActive)}
            role="button"
            tabIndex={0}
            onClick={e => {
                e.stopPropagation();
                onToggle();
            }}
            onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggle();
                }
            }}
        >
            {active && (
                <div className={styles.tooltip}>
                    <div
                        className={styles.tooltipCard}
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => e.stopPropagation()}
                    >
                        <Text variant="14-med" color="gray-100" className={styles.tooltipTitle}>
                            {title}
                        </Text>
                        {minSalePrice != null && (
                            <div className={styles.tooltipPrice}>
                                <Text variant="12-reg" color="gray-70">
                                    от {formatPrice(Number(minSalePrice))}
                                </Text>
                            </div>
                        )}
                        {previewUrl && (
                            <div className={styles.tooltipImageWrap}>
                                <img
                                    src={previewUrl}
                                    alt=""
                                    className={styles.tooltipImage}
                                    draggable={false}
                                />
                            </div>
                        )}
                        <div className={styles.tooltipLinks}>
                            {minSalePrice != null && (
                                <Link
                                    to={getLinkToCatalogue({
                                        sale_type: 'sale',
                                        building_uuids: uuid,
                                    })}
                                    className={styles.tooltipLink}
                                >
                                    <Text variant="12-med" color="primary-700">
                                        Каталог продажи
                                    </Text>
                                </Link>
                            )}
                            {minRentPrice != null && (
                                <Link
                                    to={getLinkToCatalogue({
                                        sale_type: 'rent',
                                        building_uuids: uuid,
                                    })}
                                    className={styles.tooltipLink}
                                >
                                    <Text variant="12-med" color="primary-700">
                                        Каталог аренды
                                    </Text>
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className={styles.tooltipArrow} aria-hidden />
                </div>
            )}

            <Flex direction="row" className={styles.pin}>
                <Flex justify="center" className={classNames(styles.iconWrapper, active && styles.iconWrapperActive)}>
                    <MarkerPinIcon className={classNames(styles.icon, active && styles.iconActive)} />
                </Flex>
                <Text variant="14-med" color="primary-700" className={styles.label}>
                    {title}
                </Text>
            </Flex>
        </div>
    );
};
