/**
 * Типы для бронирований (OpenAPI: BookingOut, BookingCreateIn)
 */

export interface BookingOut {
    id: number;
    premise_uuid: string;
    premise_name: string;
    building_name: string;
    building_address: string;
    building_uuid: string;
    deal_type: string;
    expires_at: string;
    created_at: string;
}

export interface BookingCreateIn {
    premise_uuid: string;
    deal_type: string;
}
