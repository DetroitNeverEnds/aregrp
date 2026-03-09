import { api } from '../../base/api';
import type { BuildingDetailOut } from './types';

/**
 * Здание по UUID
 */
export const getBuildingDetail = (buildingUuid: string): Promise<BuildingDetailOut> => {
    const client = api.get<void, BuildingDetailOut>(`/buildings/${buildingUuid}`);
    return client();
};

// Экспорт типов
export type * from './types';
