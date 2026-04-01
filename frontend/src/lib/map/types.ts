import type { LngLat } from '@yandex/ymaps3-types';

export type Coordinate = {
    lon: number;
    lat: number;
};

export const CoordinateToMapCoordinates = (coordinate: Coordinate): LngLat => [
    coordinate.lon,
    coordinate.lat,
];
