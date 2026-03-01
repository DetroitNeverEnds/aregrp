import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getUser, type UserData } from '../api';
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
