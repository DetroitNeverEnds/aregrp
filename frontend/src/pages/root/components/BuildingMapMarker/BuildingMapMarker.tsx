import classNames from 'classnames';
import type { BuildingCatalogue } from '@/api';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';
import { useFilterSearchParams } from '@/components/ui/forms/ObjectsFilter/useFilterSearchParams';
// import MarkerPinIcon from '@/icons/other/marker-pin.svg?react';
import styles from './BuildingMapMarker.module.scss';
import { Link } from '@/components/ui/common/Link';
import PinIcon from './pin.svg?react';
import { useSyncExternalStore } from 'react';
import {
    getActiveBuildingMarkerUuid,
    setActiveBuildingMarkerUuid,
    subscribeActiveBuildingMarker,
} from '@/lib/buildingMapMarkerActiveStore';

export type BuildingMapMarkerProps = {
    item: BuildingCatalogue;
    /** Вызывается после переключения открытого тултипа (клик по маркеру). */
    onMarkerClick?: (detail: { uuid: string; open: boolean }) => void;
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);

export const BuildingMapMarker = ({ item, onMarkerClick }: BuildingMapMarkerProps) => {
    const { getLinkToCatalogue } = useFilterSearchParams();
    const {
        uuid,
        title,
        address,
        min_sale_price: minSalePrice,
        min_rent_price: minRentPrice,
        media,
    } = item;
    const previewUrl = media.find(m => m.type === 'photo')?.url;

    const active = useSyncExternalStore(
        subscribeActiveBuildingMarker,
        () => getActiveBuildingMarkerUuid() === uuid,
        () => false,
    );

    const handleMarkerClick = () => {
        if (active) {
            setActiveBuildingMarkerUuid(undefined);
            onMarkerClick?.({ uuid, open: false });
        } else {
            setActiveBuildingMarkerUuid(uuid);
            onMarkerClick?.({ uuid, open: true });
        }
    };

    return (
        <div className={styles.root}>
            <Flex
                direction="row"
                align="center"
                className={styles.marker}
                onClick={handleMarkerClick}
            >
                {/* <MarkerPinIcon className={classNames(styles.icon, active && styles.iconActive)} /> */}
                <Flex
                    align="center"
                    justify="center"
                    className={classNames(
                        styles.marker__icon__wrapper,
                        active
                            ? styles.marker__icon__wrapper__active
                            : styles.marker__icon__wrapper__inactive,
                    )}
                >
                    <PinIcon
                        className={classNames(
                            styles.marker__icon,
                            active ? styles.marker__icon__active : styles.marker__icon__inactive,
                        )}
                    />
                </Flex>
                <Flex direction="row" align="center" className={styles.marker__label}>
                    <Text variant="14-med" color="primary-700" className={styles.label}>
                        {title || address}
                    </Text>
                </Flex>
            </Flex>

            {active && (
                <div className={styles.tooltip}>
                    <Flex align="start" gap={6} className={styles.tooltip__card}>
                        <Text variant="14-med" color="gray-100">
                            {address}
                        </Text>
                        {minSalePrice && (
                            <Text variant="12-reg" color="gray-70">
                                от {formatPrice(Number(minSalePrice))}
                            </Text>
                        )}
                        {minRentPrice && (
                            <Text variant="12-reg" color="gray-70">
                                {minSalePrice && 'или '} {formatPrice(Number(minRentPrice))}/мес.
                            </Text>
                        )}
                        {previewUrl && (
                            <img
                                src={previewUrl}
                                alt=""
                                className={styles.tooltip__card__image}
                                draggable={false}
                            />
                        )}
                        {minSalePrice && (
                            <Link
                                to={getLinkToCatalogue({
                                    sale_type: 'sale',
                                    building_uuids: uuid,
                                })}
                            >
                                <Text variant="12-med" color="primary-700">
                                    Каталог продажи
                                </Text>
                            </Link>
                        )}
                        {minRentPrice && (
                            <Link
                                to={getLinkToCatalogue({
                                    sale_type: 'rent',
                                    building_uuids: uuid,
                                })}
                            >
                                <Text variant="12-med" color="primary-700">
                                    Каталог аренды
                                </Text>
                            </Link>
                        )}
                    </Flex>
                    <div className={styles.tooltip__arrow} />
                </div>
            )}
        </div>
    );
};
