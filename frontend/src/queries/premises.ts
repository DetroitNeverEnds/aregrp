import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
    getBuildings,
    getBuildingsCatalogue,
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
