import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';

const meta = {
    title: 'UI/Common/Text',
    component: Text,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: [
                'h2',
                'h3',
                'h4',
                'h5',
                '12-reg',
                '12-med',
                '14-reg',
                '14-med',
                '16-reg',
                '16-med',
                '18-reg',
                '18-med',
                '20-reg',
                '20-med',
                '24-reg',
                '24-med',
            ],
            description: 'Вариант текста (размер-вес или заголовок)',
        },
        color: {
            control: 'select',
            options: [
                'gray-100',
                'primary-200',
                'primary-300',
                'primary-400',
                'primary-500',
                'primary-600',
                'primary-700',
                'primary-800',
                'primary-900',
                'primary-1000',
                'error-default',
            ],
            description: 'Цвет текста',
        },
        children: {
            control: 'text',
            description: 'Содержимое текста',
        },
        ellipsis: {
            control: 'boolean',
            description: 'Отображать многоточие',
        },
    },
    args: {
        children: 'Пример текста',
    },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: 'Некоторый текст',
    },
};

export const AllVariants: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Text variant="h2">H2 - 46px Medium</Text>
            <Text variant="h3">H3 - 40px Medium</Text>
            <Text variant="h4">H4 - 34px Medium</Text>
            <Text variant="h5">H5 - 24px Medium</Text>
            <hr />
            <Text variant="12-reg">12px Regular</Text>
            <Text variant="12-med">12px Medium</Text>
            <Text variant="14-reg">14px Regular</Text>
            <Text variant="14-med">14px Medium</Text>
            <Text variant="16-reg">16px Regular</Text>
            <Text variant="16-med">16px Medium</Text>
            <Text variant="18-reg">18px Regular</Text>
            <Text variant="18-med">18px Medium</Text>
            <Text variant="20-reg">20px Regular</Text>
            <Text variant="20-med">20px Medium</Text>
            <Text variant="24-reg">24px Regular</Text>
            <Text variant="24-med">24px Medium</Text>
        </div>
    ),
};

export const AllColors: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Text variant="16-med" color="gray-100">
                Gray 100 (по умолчанию)
            </Text>
            <Text variant="16-med" color="primary-200">
                Primary 200
            </Text>
            <Text variant="16-med" color="primary-300">
                Primary 300
            </Text>
            <Text variant="16-med" color="primary-400">
                Primary 400
            </Text>
            <Text variant="16-med" color="primary-500">
                Primary 500
            </Text>
            <Text variant="16-med" color="primary-600">
                Primary 600
            </Text>
            <Text variant="16-med" color="primary-700">
                Primary 700
            </Text>
            <Text variant="16-med" color="primary-800">
                Primary 800
            </Text>
            <Text variant="16-med" color="primary-900">
                Primary 900
            </Text>
            <Text variant="16-med" color="primary-1000">
                Primary 1000
            </Text>
            <Text variant="16-med" color="error-default">
                Error Default
            </Text>
        </div>
    ),
};

export const Ellipsis: Story = {
    render: () => (
        <div style={{ width: '200px' }}>
            <Text ellipsis>
                Это очень длинный текст, который должен обрезаться с многоточием, когда не
                помещается в контейнер
            </Text>
        </div>
    ),
};
