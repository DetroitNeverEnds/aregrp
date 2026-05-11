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
import { useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import {
    getActiveBuildingMarkerUuid,
    subscribeActiveBuildingMarker,
} from '@/lib/buildingMapMarkerActiveStore';
import _ from 'lodash';
import { CoordinateToMapCoordinates, type Coordinate } from '@/lib/map/types';
import Config from '@/config';
import type { LngLat } from '@yandex/ymaps3-types';
import Text from '../Text';
import { Flex } from '../Flex';

const FOCUS_MARKER_VERTICAL_OFFSET_PX = 140;
const WEB_MERCATOR_TILE_SIZE = 256;
const MAX_WEB_MERCATOR_LAT = 85.05112878;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const shiftCenterByVerticalPixels = (target: LngLat, zoom: number, offsetPx: number): LngLat => {
    const worldSize = WEB_MERCATOR_TILE_SIZE * 2 ** zoom;
    const [lng, lat] = target;
    const safeLat = clamp(lat, -MAX_WEB_MERCATOR_LAT, MAX_WEB_MERCATOR_LAT);
    const latRad = (safeLat * Math.PI) / 180;
    const sinLat = Math.sin(latRad);
    const targetWorldY = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * worldSize;
    const centerWorldY = targetWorldY - offsetPx;
    const n = Math.PI - (2 * Math.PI * centerWorldY) / worldSize;
    const centerLat = (180 / Math.PI) * Math.atan(Math.sinh(n));
    return [lng, clamp(centerLat, -MAX_WEB_MERCATOR_LAT, MAX_WEB_MERCATOR_LAT)];
};

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
    const { t } = useTranslation();
    const [mapActive, setMapActive] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<React.ElementRef<typeof YMap> | null>(null);
    const markersRef = useRef(markers);
    const markerEntitiesRef = useRef<Record<string, React.ElementRef<typeof YMapMarker> | null>>(
        {},
    );
    const markerBaseZIndexRef = useRef<Record<string, number>>({});
    const activeMarkerKeyRef = useRef<string | null>(null);
    markersRef.current = markers;

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

        const result = {
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
        console.log(result);

        return result;
    }, [markers]);

    const boundsLocation: { bounds: [LngLat, LngLat] } = useMemo(
        () => ({
            bounds: [
                CoordinateToMapCoordinates({ lat: bounds.lat.min, lon: bounds.lon.min }),
                CoordinateToMapCoordinates({ lat: bounds.lat.max, lon: bounds.lon.max }),
            ],
        }),
        [bounds],
    );
    const initialMapLocationRef = useRef<{ bounds: [LngLat, LngLat] } | null>(null);
    if (!initialMapLocationRef.current) {
        initialMapLocationRef.current = boundsLocation;
    }
    useEffect(() => {
        const currentMarkerKeys = new Set(
            markers.map((marker, index) => String(marker.key ?? index)),
        );
        Object.keys(markerEntitiesRef.current).forEach(key => {
            if (!currentMarkerKeys.has(key)) {
                delete markerEntitiesRef.current[key];
                delete markerBaseZIndexRef.current[key];
                if (activeMarkerKeyRef.current === key) {
                    activeMarkerKeyRef.current = null;
                }
            }
        });
    }, [markers]);

    useEffect(() => {
        if (staticMap) return;
        const unsubscribe = subscribeActiveBuildingMarker(() => {
            const nextActiveKey = getActiveBuildingMarkerUuid();
            const previousActiveKey = activeMarkerKeyRef.current;
            if (previousActiveKey && previousActiveKey !== nextActiveKey) {
                markerEntitiesRef.current[previousActiveKey]?.update({
                    zIndex: markerBaseZIndexRef.current[previousActiveKey] ?? 0,
                });
            }
            activeMarkerKeyRef.current = nextActiveKey ?? null;
            if (!nextActiveKey) {
                return;
            }
            markerEntitiesRef.current[nextActiveKey]?.update({ zIndex: 10 });
            const activeMarker = markersRef.current.find(
                marker => marker.key != null && marker.key === nextActiveKey,
            );
            if (!activeMarker) return;
            const markerCoordinates = CoordinateToMapCoordinates(activeMarker.coordinates);
            const mapZoom = mapRef.current?.zoom ?? 12;
            const center = shiftCenterByVerticalPixels(
                markerCoordinates,
                mapZoom,
                FOCUS_MARKER_VERTICAL_OFFSET_PX,
            );
            mapRef.current?.setLocation({ center, duration: 250 });
        });
        return () => {
            unsubscribe();
        };
    }, [staticMap]);

    useEffect(() => {
        if (staticMap) {
            setMapActive(false);
            return;
        }
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target;
            if (!(target instanceof Node)) return;
            if (!wrapperRef.current?.contains(target)) {
                setMapActive(false);
            }
        };
        document.addEventListener('pointerdown', onPointerDown, true);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown, true);
        };
    }, [staticMap]);

    const mapContent = useMemo(
        () => (
            <YMap
                ref={mapRef}
                location={initialMapLocationRef.current!}
                className={classNames(styles.map)}
                key={apiKey}
                behaviors={staticMap ? [] : undefined}
            >
                <YMapDefaultSchemeLayer customization={YaMapsCustomization} />
                <YMapDefaultFeaturesLayer />
                <YMapListener layer="any" onClick={e => e?.type !== 'marker' && onMapClick?.()} />
                {markers.map((marker, index) => {
                    const zIndex = marker.zIndex ?? 0;
                    const markerKey = String(marker.key ?? index);
                    return (
                        <YMapMarker
                            zIndex={zIndex}
                            key={markerKey}
                            coordinates={CoordinateToMapCoordinates(marker.coordinates)}
                            ref={entity => {
                                markerEntitiesRef.current[markerKey] = entity;
                                markerBaseZIndexRef.current[markerKey] = zIndex;
                                if (activeMarkerKeyRef.current === markerKey) {
                                    entity?.update({ zIndex: 10 });
                                }
                            }}
                        >
                            <div className={styles.marker} style={{ zIndex }}>
                                {marker.content}
                            </div>
                        </YMapMarker>
                    );
                })}
            </YMap>
        ),
        [apiKey, markers, onMapClick, staticMap],
    );

    return (
        <div className={classNames(styles.wrapper, className)} ref={wrapperRef}>
            {mapContent}
            {!staticMap && !mapActive && (
                <div
                    className={styles.interactionOverlay}
                    onPointerDown={() => {
                        setMapActive(true);
                    }}
                >
                    <Flex className={styles.interactionHint}>
                        <Text variant="12-reg">{t('components.YandexMap.interactionHint')}</Text>
                    </Flex>
                </div>
            )}
        </div>
    );
};
