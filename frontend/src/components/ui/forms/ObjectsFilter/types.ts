import type { SaleType } from '@/api';

export type ObjectsFilterSearchParams = {
    type: SaleType;
    businessCenters?: string[];
    priceFrom?: number;
    priceTo?: number;
    areaFrom?: number;
    areaTo?: number;
};
