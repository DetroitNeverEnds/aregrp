import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
    siteInvestorSettings,
    type InvestorSettingsOut,
} from '../api/handlers/siteSettings/investors';
import { wrapApiCall, type QueryResult } from '../lib/queryHelpers';

export const useInvestorSettings = (): UseQueryResult<QueryResult<InvestorSettingsOut>, Error> => {
    return useQuery({
        queryKey: ['site-settings', 'investors'],
        queryFn: () => wrapApiCall(siteInvestorSettings)(),
    });
};
