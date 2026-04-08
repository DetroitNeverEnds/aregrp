/**
 * Типы для premises handlers
 */

import type { BaseMediaItem } from '@/api/handlers/types';

export type SaleType = 'rent' | 'sale';

/** Помещение в списке (OpenAPI: PremiseListOut) */
export interface PremiseListItem {
    uuid: string;
    name: string;
    /** совместимость; при наличии см. sale_price / rent_price */
    price: number | null;
    sale_price?: number | null;
    rent_price?: number | null;
    address: string;
    floor?: number | null;
    area: string;
    has_tenant: boolean;
    media: BaseMediaItem[];
    building_uuid: string;
}

/**
 * Детальная информация о помещении
 */
export interface PremiseDetail extends PremiseListItem {
    description?: string | null;
    price_per_sqm?: number | null;
    ceiling_height?: string | null;
    has_windows?: boolean;
    has_parking?: boolean;
    is_furnished?: boolean;
}

/**
 * Ответ списка помещений
 */
export interface PremiseListResponse {
    items: PremiseListItem[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export type OrderBy = 'default' | 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc';

/**
 * Параметры фильтрации помещений
 */
export interface PremiseFilterParams {
    sale_type?: SaleType;
    available?: boolean;
    building?: string;
    building_uuids?: string;
    min_price?: number;
    max_price?: number;
    min_area?: number;
    max_area?: number;
    order_by?: OrderBy;
    page?: number;
    page_size?: number;
}

/**
 * Здание для фильтра
 */
export interface BuildingOption {
    uuid: string;
    name: string;
    address: string;
}

/**
 * Параметры для получения списка зданий
 */
export interface BuildingFilterParams {
    sale_type?: SaleType;
    available?: boolean;
}
