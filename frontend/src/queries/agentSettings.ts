import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { siteAgentSettings, type AgentSettingsOut } from '@/api/handlers/siteSettings/agents';
import { wrapApiCall, type QueryResult } from '@/lib/queryHelpers';

export const useAgentSettings = (): UseQueryResult<QueryResult<AgentSettingsOut>, Error> => {
    return useQuery({
        queryKey: ['site-settings', 'agents'],
        queryFn: () => wrapApiCall(siteAgentSettings)(),
    });
};
