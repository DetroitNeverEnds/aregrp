import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { useSyncExternalStore } from 'react';
import type { BuildingCatalogue } from '@/api';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';
import { Link } from '@/components/ui/common/Link';
import {
    getActiveBuildingMarkerUuid,
    setActiveBuildingMarkerUuid,
    subscribeActiveBuildingMarker,
} from '@/lib/buildingMapMarkerActiveStore';
import { useTapHandler } from '@/hooks';
import PinIcon from './pin.svg?react';
import styles from './BuildingMapMarker.module.scss';
import type { SaleType } from '@/api/handlers/types';

export type BuildingMapMarkerProps = {
    item: BuildingCatalogue;
    saleType?: SaleType;
    showCatalogueLinks?: boolean;
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

export const BuildingMapMarker = ({
    item,
    saleType = 'sale',
    showCatalogueLinks = true,
    onMarkerClick,
}: BuildingMapMarkerProps) => {
    const {
        uuid,
        title,
        address,
        min_sale_price: minSalePrice,
        min_rent_price: minRentPrice,
        media,
    } = item;
    const previewUrl = media.find(m => m.type === 'photo')?.url;
    const getBuildingLink = (type: SaleType) => `/building/${uuid}?sale_type=${type}`;
    const buildingLink = getBuildingLink(saleType);

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

    const markerTapHandlers = useTapHandler(handleMarkerClick);

    return (
        <div className={styles.root}>
            <Flex direction="row" align="center" className={styles.marker} {...markerTapHandlers}>
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
                        <Link
                            size="lg"
                            theme="black"
                            className={styles.tooltip__card__title}
                            to={buildingLink}
                        >
                            {title || address}
                        </Link>
                        {minSalePrice && (
                            <Text variant="12-reg" color="gray-70">
                                от {formatPrice(Number(minSalePrice))}
                            </Text>
                        )}
                        {minRentPrice && (
                            <Text variant="12-reg" color="gray-70">
                                {minSalePrice && 'или '} от {formatPrice(Number(minRentPrice))}/мес.
                            </Text>
                        )}
                        {previewUrl && (
                            <NavLink to={buildingLink}>
                                <img src={previewUrl} className={styles.tooltip__card__image} />
                            </NavLink>
                        )}
                        {showCatalogueLinks && minSalePrice && (
                            <Link to={getBuildingLink('sale')}>
                                <Text variant="12-med" color="primary-700">
                                    Каталог продажи
                                </Text>
                            </Link>
                        )}
                        {showCatalogueLinks && minRentPrice && (
                            <Link to={getBuildingLink('rent')}>
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
