import svgRaw from './data.svg?raw';
import roomsData from './data.json';
import type { FloorRoom } from './types';

export const fetchFloorSvgMock = (): string => {
    return svgRaw;
};

export const fetchFloorRoomsMock = (): FloorRoom[] => {
    return roomsData as FloorRoom[];
};
