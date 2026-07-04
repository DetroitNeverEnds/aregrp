/**
 * Типы для платежей (OpenAPI: PaymentCreateIn/Out)
 */
export interface PaymentCreateIn {
    premise_uuid: string;
    deal_type: 'sale' | 'rent';
}

export interface PaymentAmountOut {
    value: string;
    currency: string;
}

export interface PaymentConfirmationOut {
    type: string;
    confirmation_url: string | null;
}

export interface PaymentCreateOut {
    id: string;
    status: string;
    paid: boolean;
    amount: PaymentAmountOut;
    description: string;
    premise_id: number;
    confirmation: PaymentConfirmationOut;
    created_at?: string | null;
}
