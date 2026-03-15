import type { PremiseFilterParams } from '@/api';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTypedSearchParams } from '@/hooks/useTypedSearchParams';

const parseFilterSearchParams = (raw: Record<string, string | undefined>) => ({
    filter: JSON.parse(raw.filter ?? '{}') as PremiseFilterParams,
});

export const useFilterSearchParams = (): {
    filter: PremiseFilterParams;
    setFilter: (filter: PremiseFilterParams) => void;
    gotoFilter: (filter: PremiseFilterParams) => void;
    getLinkToCatalogue: (filter: PremiseFilterParams) => string;
} => {
    const [params, rawParams, setSearchParams] = useTypedSearchParams(parseFilterSearchParams);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const setFilter = useCallback(
        async (filter: PremiseFilterParams) => {
            setSearchParams({ ...rawParams, filter: JSON.stringify(filter) });
            await queryClient.invalidateQueries({ queryKey: ['premises', filter] });
        },
        [rawParams, setSearchParams, queryClient],
    );
    const gotoFilter = useCallback(
        async (filter: PremiseFilterParams) => {
            navigate(`/catalogue?filter=${JSON.stringify(filter)}`);
            await queryClient.invalidateQueries({ queryKey: ['premises', filter] });
        },
        [navigate, queryClient],
    );
    const filter = params.filter;
    const getLinkToCatalogue = useCallback(
        (filter: PremiseFilterParams) => `/catalogue?filter=${JSON.stringify(filter)}`,
        [],
    );
    return { filter, setFilter, gotoFilter, getLinkToCatalogue };
};
