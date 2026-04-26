import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
    getMyBookings,
    type BookingOut,
    type ProfilePremisesListResponse,
    type ProfilePremisesQueryParams,
    type UserData,
} from '@/api';
import { getProfilePremises, getUser } from '@/api/handlers/profile';
import { wrapApiCall, type QueryResult } from '@/lib/queryHelpers';

export function useUser(): UseQueryResult<QueryResult<UserData>, Error> {
    return useQuery({
        queryKey: ['profile', 'user'],
        queryFn: () => wrapApiCall(getUser)(),
    });
}

export function useMyBookings(options?: {
    enabled?: boolean;
}): UseQueryResult<QueryResult<BookingOut[]>, Error> {
    return useQuery({
        queryKey: ['profile', 'bookings'],
        queryFn: () => wrapApiCall(getMyBookings)(),
        enabled: options?.enabled ?? true,
    });
}
export function useProfilePremises(
    params: ProfilePremisesQueryParams,
    options?: { enabled?: boolean },
): UseQueryResult<QueryResult<ProfilePremisesListResponse>, Error> {
    return useQuery({
        queryKey: ['profile', 'premises', params],
        queryFn: () => wrapApiCall(getProfilePremises)(params),
        enabled: options?.enabled ?? true,
    });
}
