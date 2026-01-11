import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';

const meta = {
    title: 'Components/Text',
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
    },
    args: {
        children: 'Пример текста',
    },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H2: Story = {
    args: {
        variant: 'h2',
        children: 'Заголовок H2',
    },
};

export const H3: Story = {
    args: {
        variant: 'h3',
        children: 'Заголовок H3',
    },
};

export const H4: Story = {
    args: {
        variant: 'h4',
        children: 'Заголовок H4',
    },
};

export const H5: Story = {
    args: {
        variant: 'h5',
        children: 'Заголовок H5',
    },
};

export const Size12Regular: Story = {
    args: {
        variant: '12-reg',
        children: '12px Regular',
    },
};

export const Size12Medium: Story = {
    args: {
        variant: '12-med',
        children: '12px Medium',
    },
};

export const Size14Regular: Story = {
    args: {
        variant: '14-reg',
        children: '14px Regular',
    },
};

export const Size14Medium: Story = {
    args: {
        variant: '14-med',
        children: '14px Medium',
    },
};

export const Size16Regular: Story = {
    args: {
        variant: '16-reg',
        children: '16px Regular',
    },
};

export const Size16Medium: Story = {
    args: {
        variant: '16-med',
        children: '16px Medium',
    },
};

export const Size18Regular: Story = {
    args: {
        variant: '18-reg',
        children: '18px Regular',
    },
};

export const Size18Medium: Story = {
    args: {
        variant: '18-med',
        children: '18px Medium',
    },
};

export const Size20Regular: Story = {
    args: {
        variant: '20-reg',
        children: '20px Regular',
    },
};

export const Size20Medium: Story = {
    args: {
        variant: '20-med',
        children: '20px Medium',
    },
};

export const Size24Regular: Story = {
    args: {
        variant: '24-reg',
        children: '24px Regular',
    },
};

export const Size24Medium: Story = {
    args: {
        variant: '24-med',
        children: '24px Medium',
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

export const Typography: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
            <div>
                <Text variant="h2">H2 / Montserrat / 46px / Medium</Text>
                <Text variant="12-reg" style={{ color: '#6c757d' }}>
                    Font Size: 46px, Line Height: 110%, Letter Spacing: 0%, Weight: 500
                </Text>
            </div>
            <div>
                <Text variant="h3">H3 / Montserrat / 40px / Medium</Text>
                <Text variant="12-reg" style={{ color: '#6c757d' }}>
                    Font Size: 40px, Line Height: 110%, Letter Spacing: 0%, Weight: 500
                </Text>
            </div>
            <div>
                <Text variant="h4">H4 / Montserrat / 34px / Medium</Text>
                <Text variant="12-reg" style={{ color: '#6c757d' }}>
                    Font Size: 34px, Line Height: 110%, Letter Spacing: 0%, Weight: 500
                </Text>
            </div>
            <div>
                <Text variant="h5">H5 / Montserrat / 24px / Medium</Text>
                <Text variant="12-reg" style={{ color: '#6c757d' }}>
                    Font Size: 24px, Line Height: 110%, Letter Spacing: 0%, Weight: 500
                </Text>
            </div>
            <hr />
            <div>
                <Text variant="12-reg">12 regular / Montserrat / 12px / Regular</Text>
                <Text variant="12-reg" style={{ color: '#6c757d' }}>
                    Font Size: 12px, Line Height: 120%, Letter Spacing: 0%, Weight: 400
                </Text>
            </div>
            <div>
                <Text variant="12-med">12 medium / Montserrat / 12px / Medium</Text>
                <Text variant="12-reg" style={{ color: '#6c757d' }}>
                    Font Size: 12px, Line Height: 120%, Letter Spacing: 0%, Weight: 500
                </Text>
            </div>
            <div>
                <Text variant="14-reg">14 regular / Montserrat / 14px / Regular</Text>
                <Text variant="12-reg" style={{ color: '#6c757d' }}>
                    Font Size: 14px, Line Height: 120%, Letter Spacing: 0%, Weight: 400
                </Text>
            </div>
            <div>
                <Text variant="14-med">14 medium / Montserrat / 14px / Medium</Text>
                <Text variant="12-reg" style={{ color: '#6c757d' }}>
                    Font Size: 14px, Line Height: 120%, Letter Spacing: 0%, Weight: 500
                </Text>
            </div>
            <div>
                <Text variant="16-reg">16 regular / Montserrat / 16px / Regular</Text>
                <Text variant="12-reg" style={{ color: '#6c757d' }}>
                    Font Size: 16px, Line Height: 140%, Letter Spacing: 0%, Weight: 400
                </Text>
            </div>
            <div>
                <Text variant="16-med">16 medium / Montserrat / 16px / Medium</Text>
                <Text variant="12-reg" style={{ color: '#6c757d' }}>
                    Font Size: 16px, Line Height: 140%, Letter Spacing: 0%, Weight: 500
                </Text>
            </div>
            <div>
                <Text variant="18-reg">18 regular / Montserrat / 18px / Regular</Text>
                <Text variant="12-reg" style={{ color: '#6c757d' }}>
                    Font Size: 18px, Line Height: 120%, Letter Spacing: 0%, Weight: 400
                </Text>
            </div>
            <div>
                <Text variant="18-med">18 medium / Montserrat / 18px / Medium</Text>
                <Text variant="12-reg" style={{ color: '#6c757d' }}>
                    Font Size: 18px, Line Height: 120%, Letter Spacing: 0%, Weight: 500
                </Text>
            </div>
            <div>
                <Text variant="20-reg">20 regular / Montserrat / 20px / Regular</Text>
                <Text variant="12-reg" style={{ color: '#6c757d' }}>
                    Font Size: 20px, Line Height: 120%, Letter Spacing: 0%, Weight: 400
                </Text>
            </div>
            <div>
                <Text variant="20-med">20 medium / Montserrat / 20px / Medium</Text>
                <Text variant="12-reg" style={{ color: '#6c757d' }}>
                    Font Size: 20px, Line Height: 120%, Letter Spacing: 0%, Weight: 500
                </Text>
            </div>
            <div>
                <Text variant="24-reg">24 regular / Montserrat / 24px / Regular</Text>
                <Text variant="12-reg" style={{ color: '#6c757d' }}>
                    Font Size: 24px, Line Height: 120%, Letter Spacing: 0%, Weight: 400
                </Text>
            </div>
            <div>
                <Text variant="24-med">24 medium / Montserrat / 24px / Medium</Text>
                <Text variant="12-reg" style={{ color: '#6c757d' }}>
                    Font Size: 24px, Line Height: 120%, Letter Spacing: 0%, Weight: 500
                </Text>
            </div>
        </div>
    ),
};
