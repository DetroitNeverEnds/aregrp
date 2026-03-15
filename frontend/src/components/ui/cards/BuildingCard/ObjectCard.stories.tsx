import type { Meta, StoryObj } from '@storybook/react-vite';
import type { BuildingCatalogue } from '@/api';
import { BuildingCard } from './ObjectCard';

const mockImage =
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop';

const buildBuilding = (overrides: Partial<BuildingCatalogue> = {}): BuildingCatalogue => ({
    uuid: 'mock-uuid',
    title: 'Бизнес-центр',
    address: 'ул. Пример, 1',
    description: 'Описание бизнес-центра',
    min_sale_price: 2550000,
    min_rent_price: 17500,
    media: [{ type: 'photo', link: mockImage }],
    ...overrides,
});

const meta = {
    title: 'UI/Cards/BuildingCard',
    component: BuildingCard,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof BuildingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        item: buildBuilding({ uuid: '1', address: 'Роторная 1д' }),
    },
};

export const OnlySale: Story = {
    args: {
        item: buildBuilding({ uuid: '2', min_rent_price: null }),
    },
};

export const OnlyRent: Story = {
    args: {
        item: buildBuilding({ uuid: '3', min_sale_price: null, min_rent_price: 35000 }),
    },
};

export const LongAddress: Story = {
    args: {
        item: buildBuilding({
            uuid: '4',
            address: 'Очень длинный адрес здания, который должен обрезаться в одну строку',
        }),
    },
};

export const LongDescription: Story = {
    args: {
        item: buildBuilding({
            uuid: '5',
            description:
                'Очень длинное описание объекта недвижимости, которое должно обрезаться после трёх строк. Современный бизнес-центр класса А с развитой инфраструктурой, собственной парковкой, системой безопасности и круглосуточной охраной. Расположен в центре города с удобной транспортной доступностью.',
        }),
    },
};
