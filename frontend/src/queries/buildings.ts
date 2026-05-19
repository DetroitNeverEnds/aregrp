import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
    getBuildingsCatalogue,
    type BuildingCatalogueParams,
    type BuildingsCatalogueResponse,
} from '@/api';
import { wrapApiCall, type QueryResult } from '@/lib/queryHelpers';
import Config from '@/config';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { BuildingCatalogue } from '@/api/handlers/buildings/types';
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

/** Совпадает с le=100 в GET /api/v1/buildings/ — максимум записей за один запрос */
const BUILDINGS_CATALOGUE_CHUNK_SIZE = 100;

/**
 * Полный каталог зданий: последовательно запрашивает все страницы (до total_pages).
 */
export function useBuildingsCatalogueAll(
    baseParams?: Omit<BuildingCatalogueParams, 'page' | 'page_size'>,
): UseQueryResult<QueryResult<{ items: BuildingCatalogue[] }>, Error> {
    return useQuery({
        queryKey: ['buildings', 'catalogue', 'all', baseParams],
        queryFn: async () => {
            const wrappedGet = wrapApiCall(getBuildingsCatalogue);
            const items: BuildingCatalogue[] = [];
            let page = 1;

            while (true) {
                const result = await wrappedGet({
                    ...baseParams,
                    page_size: BUILDINGS_CATALOGUE_CHUNK_SIZE,
                    page,
                });

                if (result.error) {
                    return { error: result.error };
                }

                const data = result.data;
                if (!data) {
                    return { data: { items: [] } };
                }

                items.push(...data.items);

                if (page >= data.total_pages) {
                    return { data: { items } };
                }

                page += 1;
            }
        },
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
