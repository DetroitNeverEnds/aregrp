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
            <div style={{ position: 'relative', width: '300px', height: '300px' }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};

export const WithText: Story = {
    args: {
        text: 'Загрузка данных...',
    },
};

export const CustomColor: Story = {
    args: {
        spinnerColor: '#e53740',
        text: 'Загрузка с кастомным цветом',
    },
};
