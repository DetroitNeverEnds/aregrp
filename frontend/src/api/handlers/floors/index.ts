import { api } from '../../base/api';
import type { FloorPremiseOut, FloorResponseOut } from './types';

/**
 * Данные этажа (включая SVG-схему и список помещений)
 */
export const getFloor = (buildingUuid: string, floorNumber: number): Promise<FloorResponseOut> => {
    const client = api.get<void, FloorResponseOut>(`/floors/${buildingUuid}/${floorNumber}`);
    return client();
};

/**
 * Помещения на этаже
 */
export const getFloorPremises = async (
    buildingUuid: string,
    floorNumber: number,
): Promise<FloorPremiseOut[]> => {
    const floor = await getFloor(buildingUuid, floorNumber);
    return floor.premises;
};

// Экспорт типов
export type * from './types';
