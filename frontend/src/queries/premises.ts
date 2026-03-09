import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
    getBuildings,
    getBuildingsCatalogue,
    getBuildingDetail,
    getFloorPremises,
    getPremises,
    getPremisesForRent,
    getPremisesForSale,
    getPremiseDetail,
    type BuildingOption,
    type PremiseListResponse,
    type PremiseFilterParams,
    type BuildingFilterParams,
    type PremiseDetail,
    type BuildingCatalogueParams,
    type BuildingsCatalogueResponse,
    type BuildingDetailOut,
    type FloorPremiseOut,
} from '../api';
import { wrapApiCall, type QueryResult } from '../lib/queryHelpers';

/**
 * Хук для получения списка зданий
 */
export function useBuildings(
    params?: BuildingFilterParams,
): UseQueryResult<QueryResult<BuildingOption[]>, Error> {
    return useQuery({
        queryKey: ['buildings', params],
        queryFn: () => wrapApiCall(getBuildings)(params),
    });
}

/**
 * Хук для получения каталога зданий
 */
export function useBuildingsCatalogue(
    params?: BuildingCatalogueParams,
): UseQueryResult<QueryResult<BuildingsCatalogueResponse>, Error> {
    return useQuery({
        queryKey: ['buildings', 'catalogue', params],
        queryFn: () => wrapApiCall(getBuildingsCatalogue)(params),
    });
}

/**
 * Хук для получения списка помещений
 */
export function usePremises(
    params?: PremiseFilterParams,
): UseQueryResult<QueryResult<PremiseListResponse>, Error> {
    return useQuery({
        queryKey: ['premises', params],
        queryFn: () => wrapApiCall(getPremises)({ page_size: 6, ...params }),
    });
}

/**
 * Хук для получения списка помещений для аренды
 */
export function usePremisesForRent(
    params?: Omit<PremiseFilterParams, 'sale_type'>,
): UseQueryResult<QueryResult<PremiseListResponse>, Error> {
    return useQuery({
        queryKey: ['premises', 'rent', params],
        queryFn: () => wrapApiCall(getPremisesForRent)(params),
    });
}

/**
 * Хук для получения списка помещений для продажи
 */
export function usePremisesForSale(
    params?: Omit<PremiseFilterParams, 'sale_type'>,
): UseQueryResult<QueryResult<PremiseListResponse>, Error> {
    return useQuery({
        queryKey: ['premises', 'sale', params],
        queryFn: () => wrapApiCall(getPremisesForSale)(params),
    });
}

/**
 * Хук для получения детальной информации о помещении
 */
export function usePremiseDetail(uuid: string): UseQueryResult<QueryResult<PremiseDetail>, Error> {
    return useQuery({
        queryKey: ['premises', uuid],
        queryFn: () => wrapApiCall(getPremiseDetail)(uuid),
        enabled: !!uuid,
    });
}

/**
 * Хук для получения детальной информации о здании
 */
export function useBuildingDetail(
    buildingUuid: string,
): UseQueryResult<QueryResult<BuildingDetailOut>, Error> {
    return useQuery({
        queryKey: ['buildings', 'detail', buildingUuid],
        queryFn: () => wrapApiCall(getBuildingDetail)(buildingUuid),
        enabled: !!buildingUuid,
    });
}

/**
 * Хук для получения помещений на этаже
 */
export function useFloorPremises(
    buildingUuid: string,
    floorNumber?: number,
): UseQueryResult<QueryResult<FloorPremiseOut[]>, Error> {
    return useQuery({
        queryKey: ['floors', buildingUuid, floorNumber],
        queryFn: () => wrapApiCall(getFloorPremises)(buildingUuid, floorNumber as number),
        enabled: !!buildingUuid && typeof floorNumber === 'number',
    });
}
