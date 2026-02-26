import type { Meta, StoryObj } from '@storybook/react-vite';
import { OfficeCard } from './OfficeCard';
import { mockOfficeCards } from './OfficeCard.mock';

const meta = {
    title: 'UI/Cards/OfficeCard',
    component: OfficeCard,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        onNavigate: { action: 'navigate' },
    },
} satisfies Meta<typeof OfficeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Базовая карточка офиса с одним изображением
 */
export const Default: Story = {
    args: {
        item: mockOfficeCards[0],
    },
};

/**
 * Карточка с длинным названием
 */
export const LongName: Story = {
    args: {
        item: mockOfficeCards[1],
    },
};

/**
 * Карточка с высокой ценой
 */
export const HighPrice: Story = {
    args: {
        item: mockOfficeCards[2],
    },
};

/**
 * Карточка без этажа
 */
export const WithoutFloor: Story = {
    args: {
        item: {
            ...mockOfficeCards[0],
            floor: undefined,
        },
    },
};

/**
 * Несколько карточек в ряд
 */
export const Multiple: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', maxWidth: '1200px' }}>
            {mockOfficeCards.slice(0, 3).map(item => (
                <OfficeCard key={item.uuid} item={item} />
            ))}
        </div>
    ),
};

/**
 * Все карточки из мок-данных
 */
export const AllCards: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', maxWidth: '1200px' }}>
            {mockOfficeCards.map(item => (
                <OfficeCard key={item.uuid} item={item} />
            ))}
        </div>
    ),
};