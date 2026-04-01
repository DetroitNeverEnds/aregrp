import type { LngLatBounds } from '@yandex/ymaps3-types';

/**
 * В проекте координаты меток задаются как [широта, долгота].
 * Для YMap `bounds` углы задаются как LngLat: [долгота, широта].
 */
export type MapLocationResult =
    | { center: [number, number]; zoom: number }
    | { bounds: LngLatBounds };

const DEFAULT_CENTER: [number, number] = [44.650540230512846, 42.65871198485353];

/** Доля запаса по краям ограничивающего прямоугольника (чтобы метки не упирались в край карты). */
const BOUNDS_PADDING_RATIO = 0.22;
/** Минимальный запас в градусах, если точки очень близко (одна улица). */
const BOUNDS_PADDING_MIN = 0.0025;

/**
 * Подбор области карты по набору точек: для нескольких точек — `bounds` (нативный автозум API 3),
 * для одной — центр и zoom.
 */
export function getMapLocationFromCoordinates(coords: [number, number][]): MapLocationResult {
    if (coords.length === 0) {
        return { center: DEFAULT_CENTER, zoom: 10 };
    }
    if (coords.length === 1) {
        return { center: coords[0], zoom: 11 };
    }

    const lats = coords.map(c => c[0]);
    const lngs = coords.map(c => c[1]);
    let minLat = Math.min(...lats);
    let maxLat = Math.max(...lats);
    let minLng = Math.min(...lngs);
    let maxLng = Math.max(...lngs);

    const latSpan = Math.max(maxLat - minLat, 1e-9);
    const lngSpan = Math.max(maxLng - minLng, 1e-9);
    const padLat = Math.max(latSpan * BOUNDS_PADDING_RATIO, BOUNDS_PADDING_MIN);
    const padLng = Math.max(lngSpan * BOUNDS_PADDING_RATIO, BOUNDS_PADDING_MIN);

    minLat -= padLat;
    maxLat += padLat;
    minLng -= padLng;
    maxLng += padLng;

    const bounds: LngLatBounds = [
        [minLng, minLat],
        [maxLng, maxLat],
    ];
    return { bounds };
}
