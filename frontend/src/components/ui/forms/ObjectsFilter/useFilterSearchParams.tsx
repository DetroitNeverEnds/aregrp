import type { ObjectsFilterSearchParams } from '@/components/ui/forms/ObjectsFilter/types';
import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const useFilterSearchParams = (): {
    filter: ObjectsFilterSearchParams;
    setFilter: (filter: ObjectsFilterSearchParams) => void;
    gotoFilter: (filter: ObjectsFilterSearchParams) => void;
} => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setFilter = useCallback(
        (filter: ObjectsFilterSearchParams) => {
            searchParams.set('filter', JSON.stringify(filter));
        },
        [searchParams],
    );
    const gotoFilter = useCallback(
        (filter: ObjectsFilterSearchParams) => {
            navigate(`/catalogue?filter=${JSON.stringify(filter)}`);
        },
        [navigate],
    );
    const filter = useMemo(
        () => JSON.parse(searchParams.get('filter') || '{}') as ObjectsFilterSearchParams,
        [searchParams],
    );
    return { filter, setFilter, gotoFilter };
};
