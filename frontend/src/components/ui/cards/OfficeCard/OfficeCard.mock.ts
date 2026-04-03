import type { PremiseListItem } from '@/api';

// Изображения из Figma макета
const image1 = 'http://localhost:3845/assets/8b1d8d0a8a556c61473300f0de9ad6299b208fee.png';
const image2 = 'http://localhost:3845/assets/8cbb14dfe37c196def742a90d44759e09e5a9ffb.png';
const image3 = 'http://localhost:3845/assets/b0cacff29e39d1ac758819e22fe5e0813201b466.png';
const image4 = 'http://localhost:3845/assets/8d879e575a22308a335a8a0b1297cde0e3b280be.png';
const image5 = 'http://localhost:3845/assets/faee4f1213c9c3ae4f0bf3f8d2255e31f16f2300.png';

export const mockOfficeCards: PremiseListItem[] = [
    {
        uuid: '1',
        building_uuid: '',
        name: 'Двух-этажный бизнес-центр со своим паркингом в приволжском районе г. Казань рядом с ТРЦ "KazanMall"',
        address: 'Роторная 1д',
        price: 2_550_000,
        area: '150',
        floor: 2,
        has_tenant: false,
        media: [{ type: 'photo', url: image1 }],
    },
    {
        uuid: '2',
        building_uuid: '',
        name: 'Многофункциональный трехэтажный бизнес-центр со своим паркингом в Советском г. Казани',
        address: 'ул. Аделя Кутуя, 68A',
        price: 1_000_000,
        area: '85',
        floor: 1,
        has_tenant: false,
        media: [{ type: 'photo', url: image2 }],
    },
    {
        uuid: '3',
        building_uuid: '',
        name: 'Офисное здание в центре города г. Казани',
        address: 'ул. Татарстана 20',
        price: 3_322_200,
        area: '200',
        floor: 3,
        has_tenant: false,
        media: [{ type: 'photo', url: image3 }],
    },
    {
        uuid: '4',
        building_uuid: '',
        name: 'Коммерческая недвижимость в ЖК«Салават Купере»',
        address: 'ул. Зилантовская 22/15',
        price: 2_550_000,
        area: '120',
        floor: 1,
        has_tenant: false,
        media: [{ type: 'photo', url: image4 }],
    },
    {
        uuid: '5',
        building_uuid: '',
        name: 'Многофункциональный бизнес-центр с паркингом в Кировском районе г. Казани',
        address: 'Фрунзе 5',
        price: 2_588_500,
        area: '180',
        floor: 2,
        has_tenant: false,
        media: [{ type: 'photo', url: image5 }],
    },
    {
        uuid: '6',
        building_uuid: '',
        name: 'Многофункциональный бизнес-центр с паркингом в Кировском районе г. Казани',
        address: 'Маршутная 12А',
        price: 1_130_000,
        area: '95',
        floor: 1,
        has_tenant: false,
        media: [{ type: 'photo', url: image5 }],
    },
];
