import type { Meta, StoryObj } from '@storybook/react-vite';
import { Loader } from './Loader';

const meta = {
    title: 'UI/Common/Loader',
    component: Loader,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['block', 'overlay'],
            description: 'Вариант отображения',
        },
        height: {
            control: 'number',
            description: 'Высота блока (только для variant="block")',
        },
        spinnerSize: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
            description: 'Размер спиннера',
        },
        spinnerColor: {
            control: 'color',
            description: 'Цвет спиннера',
        },
        text: {
            control: 'text',
            description: 'Текст под спиннером',
        },
    },
    decorators: [
        Story => (
            <div style={{ position: 'relative', width: '100%', minHeight: '400px' }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BlockDefault: Story = {
    args: {
        variant: 'block',
    },
};

export const BlockWithHeight: Story = {
    args: {
        variant: 'block',
        height: 300,
    },
};

export const BlockWithText: Story = {
    args: {
        variant: 'block',
        text: 'Загрузка данных...',
        height: 250,
    },
};

export const OverlayDefault: Story = {
    args: {
        variant: 'overlay',
    },
};

export const OverlayWithText: Story = {
    args: {
        variant: 'overlay',
        text: 'Загрузка данных...',
    },
};

export const CustomColor: Story = {
    args: {
        variant: 'block',
        spinnerColor: '#e53740',
        text: 'Загрузка с кастомным цветом',
        height: 250,
    },
};
