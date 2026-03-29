// import { useEffect, useRef } from 'react';
import styles from './YandexMap.module.scss';

// import { YMaps, Map } from '@pbe/react-yandex-maps';
import {
    YMap,
    YMapDefaultFeaturesLayer,
    YMapDefaultSchemeLayer,
    YMapMarker,
    // reactify,
} from '../../../../lib/yamaps';
import { YaMapsCustomization } from './customization';
import classNames from 'classnames';
import { useMemo, type PropsWithChildren } from 'react';
import _ from 'lodash';
import { CoordinateToMapCoordinates, type Coordinate } from '@/lib/map/types';
import Config from '@/config';
// import { YMapDefaultMarker } from '@yandex/ymaps3-default-ui-theme';

// import type { YMap } from '@yandex/ymaps3-types';

export type MarkerItem = {
    key?: string;
    coordinates: Coordinate;
    content: React.ReactNode;
};

export type YandexMapProps = {
    markers?: MarkerItem[];
    zoom?: number;
    center?: Coordinate;
    staticMap?: boolean;
    apiKey?: string;
    className?: string;
} & PropsWithChildren;

export const YandexMap = ({
    markers = [],
    // zoom = 10,
    staticMap = false,
    apiKey,
    className,
}: YandexMapProps) => {
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
    return (
        <div className={classNames(styles.wrapper, className)}>
            <YMap
                location={{
                    bounds: [
                        CoordinateToMapCoordinates({ lat: bounds.lat.min, lon: bounds.lon.min }),
                        CoordinateToMapCoordinates({ lat: bounds.lat.max, lon: bounds.lon.max }),
                    ],
                }}
                className={classNames(styles.map)}
                key={apiKey}
                behaviors={staticMap ? [] : undefined}
            >
                <YMapDefaultSchemeLayer customization={YaMapsCustomization} />
                <YMapDefaultFeaturesLayer />
                {markers.map((marker, index) => (
                    <YMapMarker
                        key={marker.key || index}
                        coordinates={CoordinateToMapCoordinates(marker.coordinates)}
                    >
                        <div className={styles.marker}>{marker.content}</div>
                    </YMapMarker>
                ))}
            </YMap>
        </div>
    );
};
