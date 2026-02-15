import type { Meta, StoryObj } from '@storybook/react-vite';
import { ObjectCard } from './ObjectCard';

const meta = {
    title: 'UI/Cards/ObjectCard',
    component: ObjectCard,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof ObjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockImage =
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop';

export const Default: Story = {
    args: {
        id: 1,
        title: 'Роторная 1д',
        description:
            'Двух-этажный бизнес-центр со своим паркингом в приволжском районе г. Казань рядом с ТРЦ "KazanMall"',
        imagesUrl: [mockImage],
        priceFrom: 2550000,
        onButtonClick: () => console.log('Button clicked'),
    },
};

export const WithMonthlyPayment: Story = {
    args: {
        id: 2,
        title: 'ул. Аделя Кутуя, 68A',
        description:
            'Многофункциональный трехэтажный бизнес-центр со своим паркингом в Советском г. Казани',
        imagesUrl: [mockImage],
        priceFrom: 1000000,
        monthlyPayment: 17500,
        onButtonClick: () => console.log('Button clicked'),
    },
};

export const LongTitle: Story = {
    args: {
        id: 3,
        title: 'Очень длинное название объекта недвижимости которое должно обрезаться',
        description: 'Современный бизнес-центр класса А с развитой инфраструктурой',
        imagesUrl: [mockImage],
        priceFrom: 5000000,
        onButtonClick: () => console.log('Button clicked'),
    },
};

export const LongDescription: Story = {
    args: {
        id: 4,
        title: 'Бизнес-центр "Премиум"',
        description:
            'Очень длинное описание объекта недвижимости, которое должно обрезаться после двух строк. Современный бизнес-центр класса А с развитой инфраструктурой, собственной парковкой, системой безопасности и круглосуточной охраной. Расположен в центре города с удобной транспортной доступностью.',
        imagesUrl: [mockImage],
        priceFrom: 3500000,
        monthlyPayment: 50000,
        onButtonClick: () => console.log('Button clicked'),
    },
};

export const WithoutPrice: Story = {
    args: {
        id: 5,
        title: 'Офисное здание',
        description: 'Современное офисное здание в центре города',
        imagesUrl: [mockImage],
        onButtonClick: () => console.log('Button clicked'),
    },
};

export const MultipleImages: Story = {
    args: {
        id: 6,
        title: 'Торговый центр',
        description: 'Крупный торговый центр с большой проходимостью',
        imagesUrl: [
            mockImage,
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
        ],
        priceFrom: 15000000,
        monthlyPayment: 250000,
        onButtonClick: () => console.log('Button clicked'),
    },
};

export const Interactive: Story = {
    args: {
        id: 7,
        title: 'Интерактивная карточка',
        description: 'Нажмите на кнопку, чтобы увидеть действие в консоли',
        imagesUrl: [mockImage],
        priceFrom: 4200000,
        monthlyPayment: 70000,
        onButtonClick: () => {
            alert('Переход в каталог продажи');
            console.log('Button clicked for object #7');
        },
    },
};
