import type { ObjectCardProps } from './ObjectCard';

// Изображения из Figma макета
const image1 = 'http://localhost:3845/assets/8b1d8d0a8a556c61473300f0de9ad6299b208fee.png';
const image2 = 'http://localhost:3845/assets/8cbb14dfe37c196def742a90d44759e09e5a9ffb.png';
const image3 = 'http://localhost:3845/assets/b0cacff29e39d1ac758819e22fe5e0813201b466.png';
const image4 = 'http://localhost:3845/assets/8d879e575a22308a335a8a0b1297cde0e3b280be.png';
const image5 = 'http://localhost:3845/assets/faee4f1213c9c3ae4f0bf3f8d2255e31f16f2300.png';

export const mockObjectCards: Omit<ObjectCardProps, 'onButtonClick'>[] = [
    {
        id: 1,
        title: 'Роторная 1д',
        description:
            'Двух-этажный бизнес-центр со своим паркингом в приволжском районе г. Казань рядом с ТРЦ "KazanMall"',
        imagesUrl: [image1],
        priceFrom: 2550000,
    },
    {
        id: 2,
        title: 'ул. Аделя Кутуя, 68A',
        description:
            'Многофункциональный трехэтажный бизнес-центр со своим паркингом в Советском г. Казани',
        imagesUrl: [image2],
        priceFrom: 1000000,
        monthlyPayment: 17500,
    },
    {
        id: 3,
        title: 'ул. Татарстана 20',
        description: 'Офисное здание в центре города г. Казани',
        imagesUrl: [image3],
        priceFrom: 3322200,
    },
    {
        id: 4,
        title: 'ул. Зилантовская 22/15',
        description: 'Коммерческая недвижимость в ЖК«Салават Купере»',
        imagesUrl: [image4],
        priceFrom: 2550000,
        monthlyPayment: 17500,
    },
    {
        id: 5,
        title: 'Фрунзе 5',
        description: 'Многофункциональный бизнес-центр с паркингом в Кировском районе г. Казани',
        imagesUrl: [image5],
        priceFrom: 2588500,
        monthlyPayment: 25000,
    },
    {
        id: 6,
        title: 'Маршутная 12А',
        description: 'Многофункциональный бизнес-центр с паркингом в Кировском районе г. Казани',
        imagesUrl: [image5],
        priceFrom: 1130000,
        monthlyPayment: 8100,
    },
];
