/**
 * Типы для Buildings handlers
 */

export type BuildingMediaItem = {
    type: 'photo' | 'video';
    link: string;
    title?: string | null;
};

export type BuildingMediaCategory = string;

export interface BuildingDetailOut {
    uuid: string;
    title: string;
    address: string;
    description?: string | null;
    total_floors?: number | null;
    year_built?: number | null;
    min_sale_price?: number | null;
    min_rent_price?: number | null;
    media_categories: BuildingMediaCategory[];
    media: BuildingMediaItem[];
}
