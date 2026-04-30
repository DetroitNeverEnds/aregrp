/**
 * Типы для Floors handlers
 */

/**
 * Помещение на этаже
 * OpenAPI: uuid, name, label_area, label_price, is_occupied
 */
export type FloorPremiseOut = {
    uuid: string;
    name: string;
    label_area: string;
    label_price: string;
    is_available: boolean;
    is_occupied: boolean;
};

/**
 * Данные этажа
 * OpenAPI: building_uuid, floor_number, schema_svg (SVG текст) и premises[]
 */
export type FloorResponseOut = {
    building_uuid: string;
    floor_number: number;
    schema_svg?: string | null;
    premises: FloorPremiseOut[];
};
