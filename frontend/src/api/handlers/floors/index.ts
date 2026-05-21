import { api } from '@/api/base/api';
import type { FloorPremiseOut, FloorResponseOut } from './types';
import type { SaleType } from '../types';

export type GetFloorQuery = {
    sale_type?: SaleType;
};

/**
 * Данные этажа (включая SVG-схему и список помещений)
 */
export const getFloor = (
    buildingUuid: string,
    floorId: string,
    query?: GetFloorQuery,
): Promise<FloorResponseOut> => {
    const client = api.get<Record<string, string> | undefined, FloorResponseOut>(
        `/floors/${buildingUuid}/${floorId}`,
    );
    return client(query?.sale_type ? { sale_type: query.sale_type } : undefined);
};

/**
 * Помещения на этаже
 */
export const getFloorPremises = async (
    buildingUuid: string,
    floorId: string,
    query?: GetFloorQuery,
): Promise<FloorPremiseOut[]> => {
    const floor = await getFloor(buildingUuid, floorId, query);
    return floor.premises;
};

// Экспорт типов
export type * from './types';
