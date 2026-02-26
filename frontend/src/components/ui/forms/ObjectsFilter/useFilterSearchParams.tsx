import type { PremiseFilterParams } from '@/api';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const useFilterSearchParams = (): {
    filter: PremiseFilterParams;
    setFilter: (filter: PremiseFilterParams) => void;
    gotoFilter: (filter: PremiseFilterParams) => void;
    getLinkToCatalogue: (filter: PremiseFilterParams) => string;
} => {
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const setFilter = useCallback(
        async (filter: PremiseFilterParams) => {
            searchParams.set('filter', JSON.stringify(filter));
            await queryClient.invalidateQueries({ queryKey: ['premises', filter] });
        },
        [searchParams, queryClient],
    );
    const gotoFilter = useCallback(
        async (filter: PremiseFilterParams) => {
            navigate(`/catalogue?filter=${JSON.stringify(filter)}`);
            await queryClient.invalidateQueries({ queryKey: ['premises', filter] });
        },
        [navigate, queryClient],
    );
    const filter = useMemo(
        () => JSON.parse(searchParams.get('filter') || '{}') as PremiseFilterParams,
        [searchParams],
    );
    const getLinkToCatalogue = useCallback(
        (filter: PremiseFilterParams) => `/catalogue?filter=${JSON.stringify(filter)}`,
        [],
    );
    return { filter, setFilter, gotoFilter, getLinkToCatalogue };
};
