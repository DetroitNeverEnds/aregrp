import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';

const meta = {
    title: 'Components/Divider',
    component: Divider,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        orientation: {
            control: 'select',
            options: ['horizontal', 'vertical'],
            description: 'Ориентация разделителя',
        },
        className: {
            control: 'text',
            description: 'Дополнительный CSS класс',
        },
    },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        orientation: 'horizontal',
    },
    render: args => (
        <div style={{ width: '400px' }}>
            <Divider {...args} />
        </div>
    ),
};

export const Horizontal: Story = {
    args: {
        orientation: 'horizontal',
    },
    render: () => (
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>Текст сверху</div>
            <Divider orientation="horizontal" />
            <div>Текст снизу</div>
        </div>
    ),
};

export const Vertical: Story = {
    args: {
        orientation: 'vertical',
    },
    render: () => (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', height: '100px' }}>
            <div>Текст слева</div>
            <Divider orientation="vertical" />
            <div>Текст справа</div>
        </div>
    ),
};

export const InList: Story = {
    render: () => (
        <div style={{ width: '300px' }}>
            <div style={{ padding: '12px' }}>Элемент списка 1</div>
            <Divider />
            <div style={{ padding: '12px' }}>Элемент списка 2</div>
            <Divider />
            <div style={{ padding: '12px' }}>Элемент списка 3</div>
            <Divider />
            <div style={{ padding: '12px' }}>Элемент списка 4</div>
        </div>
    ),
};

export const InCard: Story = {
    render: () => (
        <div
            style={{
                width: '400px',
                border: '1px solid #dadde2',
                borderRadius: '8px',
                padding: '16px',
            }}
        >
            <h3 style={{ margin: '0 0 16px 0' }}>Заголовок карточки</h3>
            <Divider />
            <p style={{ margin: '16px 0' }}>
                Содержимое карточки с текстом и другой информацией.
            </p>
            <Divider />
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <button>Действие 1</button>
                <button>Действие 2</button>
            </div>
        </div>
    ),
};