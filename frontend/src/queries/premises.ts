import { useInfiniteQuery, useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
    getBuildings,
    getBuildingsCatalogue,
    getBuildingDetail,
    getFloor,
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
    type FloorResponseOut,
} from '../api';
import { wrapApiCall, type QueryResult } from '../lib/queryHelpers';
import Config from '@/config';

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
 * Хук для получения каталога зданий с пагинацией «Показать еще»
 */
export function useBuildingsCatalogueInfinite(baseParams?: Omit<BuildingCatalogueParams, 'page'>) {
    const pageSize = Config.pageSizeMain;
    return useInfiniteQuery({
        queryKey: ['buildings', 'catalogue', 'infinite', baseParams],
        queryFn: async ({ pageParam = 1 }) => {
            const result = await wrapApiCall(getBuildingsCatalogue)({
                page_size: pageSize,
                page: pageParam,
                ...baseParams,
            });
            return result;
        },
        getNextPageParam: lastResult => {
            const data = lastResult?.data;
            if (!data || data.page >= data.total_pages) return undefined;
            return data.page + 1;
        },
        initialPageParam: 1,
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
 * Хук для получения списка помещений с пагинацией «Показать еще»
 */
export function usePremisesInfinite(baseParams?: Omit<PremiseFilterParams, 'page'>) {
    const pageSize = 6;
    return useInfiniteQuery({
        queryKey: ['premises', 'infinite', baseParams],
        queryFn: async ({ pageParam = 1 }) => {
            const result = await wrapApiCall(getPremises)({
                page_size: pageSize,
                page: pageParam,
                ...baseParams,
            });
            return result;
        },
        getNextPageParam: lastResult => {
            const data = lastResult?.data;
            if (!data || data.page >= data.total_pages) return undefined;
            return data.page + 1;
        },
        initialPageParam: 1,
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
export function usePremiseDetail(uuid?: string): UseQueryResult<QueryResult<PremiseDetail>, Error> {
    return useQuery({
        queryKey: ['premises', 'detail', uuid],
        queryFn: () => wrapApiCall(getPremiseDetail)(uuid || ''),
        enabled: uuid !== undefined,
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
        queryKey: ['floors', 'premises', buildingUuid, floorNumber],
        queryFn: () => wrapApiCall(getFloorPremises)(buildingUuid, floorNumber as number),
        enabled: !!buildingUuid && typeof floorNumber === 'number',
    });
}

/**
 * Хук для получения данных этажа (schema_svg + premises)
 */
export function useFloor(
    buildingUuid: string,
    floorNumber?: number,
): UseQueryResult<QueryResult<FloorResponseOut>, Error> {
    return useQuery({
        queryKey: ['floors', 'detail', buildingUuid, floorNumber],
        queryFn: () => wrapApiCall(getFloor)(buildingUuid, floorNumber as number),
        enabled: !!buildingUuid && typeof floorNumber === 'number',
    });
}
