/**
 * Типы для premises handlers
 */

export type SaleType = 'rent' | 'sale';

/**
 * Фото помещения
 */
export interface MediaPhoto {
    url: string;
    title?: string;
    is_primary: boolean;
}

/**
 * Видео помещения
 */
export interface MediaVideo {
    url: string;
    title?: string;
}

/**
 * Медиа помещения
 */
export interface PremiseMedia {
    photos: MediaPhoto[];
    videos: MediaVideo[];
}

/**
 * Помещение в списке
 */
export interface PremiseListItem {
    uuid: string;
    name: string;
    price: string;
    address: string;
    floor?: number;
    area: string;
    has_tenant: boolean;
    media: PremiseMedia;
}

/**
 * Детальная информация о помещении
 */
export interface PremiseDetail extends PremiseListItem {
    description?: string;
    price_per_sqm?: string;
    ceiling_height?: string;
    has_windows: boolean;
    has_parking: boolean;
    is_furnished: boolean;
}

/**
 * Ответ списка помещений
 */
export interface PremiseListResponse {
    items: PremiseListItem[];
    total: number;
    page: number;
    page_size: number;
}

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
    order_by?: 'default' | 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc';
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
