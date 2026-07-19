import type { SearchParamsParser } from '@/hooks/useTypedSearchParams';

export type BuildingSearchParams = {
    floor?: string;
    selectedPremise?: string;
    sale_type?: 'sale' | 'rent';
};

export const parseBuildingSearchParams: SearchParamsParser<BuildingSearchParams> = raw => ({
    floor: raw.floor,
    selectedPremise: raw.selectedPremise || undefined,
    sale_type: raw.sale_type === 'sale' || raw.sale_type === 'rent' ? raw.sale_type : undefined,
});

export const toSearchParams = (params: BuildingSearchParams): Record<string, string> => {
    const result: Record<string, string> = {};
    if (params.floor) result.floor = String(params.floor);
    if (params.selectedPremise) result.selectedPremise = params.selectedPremise;
    if (params.sale_type) result.sale_type = params.sale_type;
    return result;
};
