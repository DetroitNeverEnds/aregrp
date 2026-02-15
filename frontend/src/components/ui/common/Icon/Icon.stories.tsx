import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, type IconSize } from './Icon';
import { iconNames } from './iconConfig';
import { Flex } from '../Flex';
import { Text } from '../Text';

const meta = {
    title: 'UI/Common/Icon',
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

// Все цвета палитры
export const AllColors: Story = {
    args: { name: 'sample' },
    render: () => (
        <Flex direction="column" gap={12} align="start">
            <Text variant="16-med">Gray цвета:</Text>
            <Flex gap={8} direction="row" wrap="wrap">
                <Icon name="sample" size={24} color="gray-0" />
                <Icon name="sample" size={24} color="gray-5" />
                <Icon name="sample" size={24} color="gray-10" />
                <Icon name="sample" size={24} color="gray-20" />
                <Icon name="sample" size={24} color="gray-30" />
                <Icon name="sample" size={24} color="gray-50" />
                <Icon name="sample" size={24} color="gray-70" />
                <Icon name="sample" size={24} color="gray-100" />
            </Flex>
            <Text variant="16-med">Primary цвета:</Text>
            <Flex gap={8} direction="row" wrap="wrap">
                <Icon name="sample" size={24} color="primary-200" />
                <Icon name="sample" size={24} color="primary-300" />
                <Icon name="sample" size={24} color="primary-400" />
                <Icon name="sample" size={24} color="primary-500" />
                <Icon name="sample" size={24} color="primary-600" />
                <Icon name="sample" size={24} color="primary-700" />
                <Icon name="sample" size={24} color="primary-800" />
                <Icon name="sample" size={24} color="primary-900" />
                <Icon name="sample" size={24} color="primary-1000" />
                <Icon name="sample" size={24} color="primary-yellow" />
            </Flex>
            <Text variant="16-med">Error цвет:</Text>
            <Flex gap={8} direction="row" wrap="wrap">
                <Icon name="sample" size={24} color="error-default" />
            </Flex>
        </Flex>
    ),
};
