import { api } from '../../base/api';
import type { FloorPremiseOut } from './types';

/**
 * Помещения на этаже
 */
export const getFloorPremises = (
    buildingUuid: string,
    floorNumber: number,
): Promise<FloorPremiseOut[]> => {
    const client = api.get<void, FloorPremiseOut[]>(`/floors/${buildingUuid}/${floorNumber}`);
    return client();
};

// Экспорт типов
export type * from './types';
