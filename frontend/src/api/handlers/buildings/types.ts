/**
 * Типы для Buildings handlers
 */

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
    min_sale_price?: number | null;
    min_rent_price?: number | null;
    media_categories: BuildingMediaCategory[];
    media: BuildingMediaItem[];
}
