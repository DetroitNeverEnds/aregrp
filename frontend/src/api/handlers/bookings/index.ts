import { api } from '@/api/base/api';
import type { BookingCreateIn, BookingOut } from './types';

export const getMyBookings = api.get<void, BookingOut[]>('/profile/bookings');

export const createBooking = api.post<BookingCreateIn, BookingOut>('/bookings/');

export type * from './types';
