import { api } from '../../base/api';
import type {
    BuildingOption,
    BuildingFilterParams,
    PremiseListResponse,
    PremiseFilterParams,
    PremiseDetail,
} from './types';

/**
 * Получить список зданий для фильтра
 */
export const getBuildings = api.get<BuildingFilterParams, BuildingOption[]>('/premises/buildings');

/**
 * Получить список помещений с фильтрами
 */
export const getPremises = api.get<PremiseFilterParams, PremiseListResponse>('/premises');

/**
 * Получить список помещений для аренды
 */
export const getPremisesForRent = api.get<
    Omit<PremiseFilterParams, 'sale_type'>,
    PremiseListResponse
>('/premises/rent');

/**
 * Получить список помещений для продажи
 */
export const getPremisesForSale = api.get<
    Omit<PremiseFilterParams, 'sale_type'>,
    PremiseListResponse
>('/premises/sale');

/**
 * Получить детальную информацию о помещении по UUID
 */
export const getPremiseDetail = (uuid: string): Promise<PremiseDetail> => {
    const client = api.get<void, PremiseDetail>(`/premises/${uuid}`);
    return client();
};

// Экспорт типов
export type * from './types';