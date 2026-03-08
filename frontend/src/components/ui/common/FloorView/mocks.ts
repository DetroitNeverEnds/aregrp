import svgRaw from './Frame 2043683187.svg?raw';
import roomsData from './data.json';
import type { FloorRoom } from './types';

const delay = (ms: number) => {
    return new Promise<void>(resolve => {
        setTimeout(resolve, ms);
    });
};

export const fetchFloorSvgMock = async (): Promise<string> => {
    await delay(200);
    return svgRaw;
};

export const fetchFloorRoomsMock = async (): Promise<FloorRoom[]> => {
    await delay(200);
    return roomsData as FloorRoom[];
};
