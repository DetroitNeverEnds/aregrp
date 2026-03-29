import type { BaseMediaItem } from '@/api/handlers/types';

/**
 * Параметры для получения каталога зданий
 */
export interface BuildingCatalogueParams {
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
    category?: string;
    title?: string | null;
};

export type BuildingMediaCategory = string;

export interface BuildingDetailOut {
    uuid: string;
    title: string;
    address: string;
    description: string;
    total_floors?: number | null;
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
