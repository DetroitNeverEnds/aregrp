import type { BaseMediaItem, SaleType } from '@/api/handlers/types';
import type { OrderBy } from '@/api/handlers/premises/types';

/**
 * Параметры для получения каталога зданий
 */
export interface BuildingCatalogueParams {
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
 * Здание в каталоге (OpenAPI: BuildingListOut)
 */
export interface BuildingCatalogue {
    uuid: string;
    title: string;
    address: string;
    description: string;
    geo_point: {
        lat: number;
        lon: number;
    };
    min_sale_price?: number | null;
    min_rent_price?: number | null;
    media: BaseMediaItem[];
}

export type BuildingsCatalogueResponse = {
    items: BuildingCatalogue[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
};

export type BuildingMediaItem = {
    type: 'photo' | 'video';
    url: string;
    full_url: string;
    category?: string;
    title?: string | null;
};

export type BuildingMediaCategory = string;

export type BuildingFloorOut = {
    key: string;
    title: string;
    has_sale: boolean;
    has_rent: boolean;
};

export interface BuildingDetailOut {
    uuid: string;
    title: string;
    address: string;
    description: string;
    total_floors?: number | null;
    floors?: BuildingFloorOut[];
    year_built?: number | null;
    geo_point?: {
        lat: number;
        lon: number;
    };
    min_sale_price?: number | null;
    min_rent_price?: number | null;
    media_categories: BuildingMediaCategory[];
    media: BuildingMediaItem[];
}
