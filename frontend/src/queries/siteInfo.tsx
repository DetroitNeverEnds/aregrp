import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { siteInfo, type InfoResponse } from '../api/handlers/siteSettings/info';
import { wrapApiCall, type QueryResult } from '../lib/queryHelpers';

export const useSiteInfo = (): UseQueryResult<QueryResult<InfoResponse>, Error> => {
    return useQuery({
        queryKey: ['site-info'],
        queryFn: () => wrapApiCall(siteInfo)(),
    });
};
