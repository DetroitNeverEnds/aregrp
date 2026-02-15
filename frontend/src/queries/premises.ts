import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
    getBuildings,
    getPremises,
    getPremisesForRent,
    getPremisesForSale,
    getPremiseDetail,
    type BuildingOption,
    type PremiseListResponse,
    type PremiseFilterParams,
    type BuildingFilterParams,
    type PremiseDetail,
} from '../api';

/**
 * Хук для получения списка зданий
 */
export function useBuildings(
    params?: BuildingFilterParams,
): UseQueryResult<BuildingOption[], Error> {
    return useQuery({
        queryKey: ['buildings', params],
        queryFn: () => getBuildings(params),
    });
}

/**
 * Хук для получения списка помещений
 */
export function usePremises(
    params?: PremiseFilterParams,
): UseQueryResult<PremiseListResponse, Error> {
    return useQuery({
        queryKey: ['premises', params],
        queryFn: () => getPremises(params),
    });
}

/**
 * Хук для получения списка помещений для аренды
 */
export function usePremisesForRent(
    params?: Omit<PremiseFilterParams, 'sale_type'>,
): UseQueryResult<PremiseListResponse, Error> {
    return useQuery({
        queryKey: ['premises', 'rent', params],
        queryFn: () => getPremisesForRent(params),
    });
}

/**
 * Хук для получения списка помещений для продажи
 */
export function usePremisesForSale(
    params?: Omit<PremiseFilterParams, 'sale_type'>,
): UseQueryResult<PremiseListResponse, Error> {
    return useQuery({
        queryKey: ['premises', 'sale', params],
        queryFn: () => getPremisesForSale(params),
    });
}

/**
 * Хук для получения детальной информации о помещении
 */
export function usePremiseDetail(uuid: string): UseQueryResult<PremiseDetail, Error> {
    return useQuery({
        queryKey: ['premises', uuid],
        queryFn: () => getPremiseDetail(uuid),
        enabled: !!uuid,
    });
}
