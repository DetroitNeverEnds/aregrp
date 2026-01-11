import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, type IconSize } from './Icon';
import { iconNames } from './iconConfig';

const meta = {
    title: 'Components/Icon',
    component: Icon,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        name: {
            control: 'select',
            options: [
                'arrow-button',
                'arrow-narrow-down',
                'arrow-narrow-left',
                'arrow-narrow-right',
                'benefit-1',
                'benefit-2',
                'benefit-3',
                'benefit-4',
                'benefit-5',
                'benefit-6',
                'benefit-7',
                'benefit-8',
                'benefit-9',
                'benefit-10',
                'benefit-11',
                'benefit-12',
                'sample',
                'chevron-down',
                'chevron-left',
                'chevron-right',
                'chevron-up',
                'dots-menu',
                'dots-tag',
                'download-rounded',
                'eye-slash',
                'eye',
                'loader',
                'mail-simple',
                'marker-pin',
                'menu',
                'minus',
                'plus',
                'refresh',
                'regulator',
                'sample',
                'search',
                'settings',
                'switch-vertical',
                'user-simple',
                'wallet-buy',
                'x-close',
                'xmark-gray-circle',
            ],
            description: 'Название иконки',
        },
        size: {
            control: 'select',
            options: [16, 20, 24, 32],
            description: 'Размер иконки в пикселях',
        },
    },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

// Базовые примеры
export const Default: Story = {
    args: {
        name: 'sample',
    },
};

export const WithCustomSize: Story = {
    args: {
        name: 'search',
        size: 32,
    },
};

export const WithCustomColor: Story = {
    args: {
        name: 'sample',
    },
    render: () => (
        <span style={{ color: 'red' }}>
            <Icon name="sample" />
        </span>
    ),
};

// Все размеры
export const AllSizes: Story = {
    args: { name: 'sample' },
    render: () => (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {([16, 20, 24, 32] as IconSize[]).map(size => (
                <Icon name="check" size={size} />
            ))}
        </div>
    ),
};

// Все иконки
export const AllIcons: Story = {
    args: { name: 'sample' },
    render: () => (
        <div
            style={{
                display: 'flex',
                width: '100%',
                gap: '16px',
                flexWrap: 'wrap',
            }}
        >
            {iconNames.map(iconName => (
                <Icon key={iconName} name={iconName} size={24} />
            ))}
        </div>
    ),
};
