import { api } from '@/api/base/api';
import type { PaymentCreateIn, PaymentCreateOut } from './types';

/**
 * Создать платеж за бронирование помещения
 */
export const createPayment = api.post<PaymentCreateIn, PaymentCreateOut>('/payments/');

export type * from './types';
