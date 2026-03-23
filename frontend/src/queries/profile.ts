import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { UserData } from '../api';
import { getUser } from '../api/handlers/profile';
import { wrapApiCall, type QueryResult } from '../lib/queryHelpers';

/**
 * Хук для получения данных текущего пользователя
 */
export function useUser(): UseQueryResult<QueryResult<UserData>, Error> {
    return useQuery({
        queryKey: ['profile', 'user'],
        queryFn: () => wrapApiCall(getUser)(),
    });
}
