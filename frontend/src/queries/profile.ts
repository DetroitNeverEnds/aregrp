import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { UserData } from '../api';
import type { QueryResult } from '../lib/queryHelpers';

/**
 * Временный мок пользователя (убрать после починки авторизации и вернуть wrapApiCall(getUser)).
 * Соответствует примеру из макета личного кабинета.
 */
const MOCK_USER: UserData = {
    id: 1,
    username: 'borodinskaya_va',
    email: 'test@test.ru',
    user_type: 'agent',
    full_name: 'Бородинская В. А.',
    phone: '+7 961 123 45 67',
    organization_name: 'ИП Бородинская В. А.',
    inn: '123456789123',
};

/**
 * Хук для получения данных текущего пользователя
 */
export function useUser(): UseQueryResult<QueryResult<UserData>, Error> {
    return useQuery({
        queryKey: ['profile', 'user'],
        queryFn: async (): Promise<QueryResult<UserData>> => ({ data: MOCK_USER }),
    });
}
