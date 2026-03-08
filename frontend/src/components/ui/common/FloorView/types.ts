export type FloorRoom = {
    uuid: string;
    id_area: string;
    name?: string;
    label_area: string;
    label_price: string;
    is_occupied: boolean;
};

export type FloorViewProps = {
    svg: string;
    rooms: FloorRoom[];
    className?: string;
};
