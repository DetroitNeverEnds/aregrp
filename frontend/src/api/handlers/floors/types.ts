/**
 * Типы для Floors handlers
 */

/**
 * Помещения на этаже
 * OpenAPI: name (номер/название), label_area, label_price, is_occupied
 */
export type FloorPremiseOut = {
    name: string;
    label_area: string;
    label_price: string;
    is_occupied: boolean;
};
