import styles from './YandexMap.module.scss';

import {
    YMap,
    YMapListener,
    YMapDefaultFeaturesLayer,
    YMapDefaultSchemeLayer,
    YMapMarker,
} from '@/lib/yamaps';
import { YaMapsCustomization } from './customization';
import classNames from 'classnames';
import { useMemo, useSyncExternalStore, type PropsWithChildren } from 'react';
import {
    getActiveBuildingMarkerUuid,
    subscribeActiveBuildingMarker,
} from '@/lib/buildingMapMarkerActiveStore';
import _ from 'lodash';
import { CoordinateToMapCoordinates, type Coordinate } from '@/lib/map/types';
import Config from '@/config';
import type { LngLat } from '@yandex/ymaps3-types';

export type MarkerItem = {
    key?: string;
    coordinates: Coordinate;
    content: React.ReactNode;
    zIndex?: number;
};

export type YandexMapProps = {
    markers?: MarkerItem[];
    staticMap?: boolean;
    onMapClick?: () => void;
    apiKey?: string;
    className?: string;
} & PropsWithChildren;

export const YandexMap = ({
    markers = [],
    staticMap = false,
    onMapClick,
    apiKey,
    className,
}: YandexMapProps) => {
    const activeMarkerKey = useSyncExternalStore(
        subscribeActiveBuildingMarker,
        getActiveBuildingMarkerUuid,
        () => null,
    );

    const bounds = useMemo(() => {
        const rawBounds = {
            lon: {
                min: _.min(markers.map(marker => marker.coordinates.lon)) ?? 0,
                max: _.max(markers.map(marker => marker.coordinates.lon)) ?? 0,
            },
            lat: {
                min: _.min(markers.map(marker => marker.coordinates.lat)) ?? 0,
                max: _.max(markers.map(marker => marker.coordinates.lat)) ?? 0,
            },
        };
        const diff = {
            lat: rawBounds.lat.max - rawBounds.lat.min,
            lon: rawBounds.lon.max - rawBounds.lon.min,
        };

        return {
            lat: {
                min:
                    rawBounds.lat.min -
                    _.max([Config.map.minBound, diff.lat * Config.map.boundRatio]),
                max:
                    rawBounds.lat.max +
                    _.max([Config.map.minBound, diff.lat * Config.map.boundRatio]),
            },
            lon: {
                min:
                    rawBounds.lon.min -
                    _.max([Config.map.minBound, diff.lon * Config.map.boundRatio]),
                max:
                    rawBounds.lon.max +
                    _.max([Config.map.minBound, diff.lon * Config.map.boundRatio]),
            },
        };
    }, [markers]);

    /** Стабильная ссылка, иначе при любом ререндере (клик по маркеру, z-index) YMap снова применяет bounds и сбрасывает камеру. */
    const mapLocation: { bounds: [LngLat, LngLat] } = useMemo(
        () => ({
            bounds: [
                CoordinateToMapCoordinates({ lat: bounds.lat.min, lon: bounds.lon.min }),
                CoordinateToMapCoordinates({ lat: bounds.lat.max, lon: bounds.lon.max }),
            ],
        }),
        [bounds],
    );

    // const listener = useMemo(() => new YMapListener({ onClick: onMapClick }), [onMapClick]);
    return (
        <div className={classNames(styles.wrapper, className)}>
            <YMap
                location={mapLocation}
                className={classNames(styles.map)}
                key={apiKey}
                behaviors={staticMap ? [] : undefined}
            >
                <YMapDefaultSchemeLayer customization={YaMapsCustomization} />
                <YMapDefaultFeaturesLayer />
                <YMapListener
                    layer="any"
                    // onClick={onMapClick}
                    onClick={e => e === undefined && onMapClick?.()}
                />
                {markers.map((marker, index) => {
                    const zIndex =
                        marker.key != null && marker.key === activeMarkerKey
                            ? 10
                            : (marker.zIndex ?? 0);
                    return (
                        <YMapMarker
                            zIndex={zIndex}
                            key={marker.key || index}
                            coordinates={CoordinateToMapCoordinates(marker.coordinates)}
                        >
                            <div className={styles.marker} style={{ zIndex }}>
                                {marker.content}
                            </div>
                        </YMapMarker>
                    );
                })}
            </YMap>
        </div>
    );
};
