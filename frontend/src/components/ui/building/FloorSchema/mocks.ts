import svgRaw from './data.svg?raw';
import roomsData from './data.json';
import type { FloorRoom } from './FloorSchema';

export const fetchFloorSvgMock = (): string => {
    return svgRaw;
};

export const fetchFloorRoomsMock = (): FloorRoom[] => {
    return roomsData as FloorRoom[];
};
