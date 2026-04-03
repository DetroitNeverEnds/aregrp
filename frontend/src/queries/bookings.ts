import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getMyBookings, type BookingOut } from '../api';
import { wrapApiCall, type QueryResult } from '../lib/queryHelpers';

export function useMyBookings(options?: {
    enabled?: boolean;
}): UseQueryResult<QueryResult<BookingOut[]>, Error> {
    return useQuery({
        queryKey: ['profile', 'bookings'],
        queryFn: () => wrapApiCall(getMyBookings)(),
        enabled: options?.enabled ?? true,
    });
}
