import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';

const meta = {
    title: 'Components/Card',
    component: Card,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'outlined', 'elevated'],
            description: 'Вариант отображения карточки',
        },
        title: {
            control: 'text',
            description: 'Заголовок карточки',
        },
        description: {
            control: 'text',
            description: 'Описание карточки',
        },
        imageUrl: {
            control: 'text',
            description: 'URL изображения',
        },
    },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Заголовок карточки',
        description: 'Это описание карточки с базовым вариантом отображения.',
        variant: 'default',
    },
};

export const WithImage: Story = {
    args: {
        title: 'Карточка с изображением',
        description: 'Карточка с красивым изображением сверху.',
        imageUrl:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
        variant: 'default',
    },
};

export const Outlined: Story = {
    args: {
        title: 'Outlined карточка',
        description: 'Карточка с выделенной рамкой.',
        variant: 'outlined',
    },
};

export const Elevated: Story = {
    args: {
        title: 'Elevated карточка',
        description: 'Карточка с тенью для создания эффекта возвышения.',
        imageUrl:
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=200&fit=crop',
        variant: 'elevated',
    },
};

export const Clickable: Story = {
    args: {
        title: 'Кликабельная карточка',
        description: 'Эта карточка реагирует на клик.',
        variant: 'elevated',
        onClick: () => alert('Карточка нажата!'),
    },
};

export const WithCustomContent: Story = {
    args: {
        title: 'Карточка с кастомным контентом',
        description: 'Карточка может содержать дополнительные элементы.',
        variant: 'elevated',
        children: (
            <div style={{ marginTop: '16px' }}>
                <button
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#1ea7fd',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Действие
                </button>
            </div>
        ),
    },
};
