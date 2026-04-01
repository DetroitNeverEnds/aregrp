import { api } from '../../base/api';
import type {
    BuildingDetailOut,
    BuildingsCatalogueResponse,
    BuildingCatalogueParams,
} from './types';

/**
 * Получить каталог зданий
 */
export const getBuildingsCatalogue = api.get<BuildingCatalogueParams, BuildingsCatalogueResponse>(
    '/buildings/',
);

/**
 * Здание по UUID
 */
export const getBuildingDetail = (buildingUuid: string): Promise<BuildingDetailOut> => {
    const client = api.get<void, BuildingDetailOut>(`/buildings/${buildingUuid}`);
    return client();
};

// Экспорт типов
export type * from './types';
