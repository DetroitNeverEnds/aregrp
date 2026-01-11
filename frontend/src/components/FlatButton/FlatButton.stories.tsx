import type { Meta, StoryObj } from '@storybook/react-vite';
import { FlatButton } from './FlatButton';
import { Icon } from '../Icon';

const meta = {
    title: 'Components/FlatButton',
    component: FlatButton,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        children: {
            control: 'text',
            description: 'Содержимое кнопки',
        },
        disabled: {
            control: 'boolean',
            description: 'Состояние disabled',
        },
        onClick: {
            action: 'clicked',
            description: 'Обработчик клика',
        },
    },
} satisfies Meta<typeof FlatButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: 'Прозрачная кнопка',
    },
};

export const WithText: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FlatButton>Простой текст</FlatButton>
            <FlatButton>Кликабельная ссылка</FlatButton>
            <FlatButton disabled>Отключенная кнопка</FlatButton>
        </div>
    ),
};

export const WithIcon: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <FlatButton>
                <Icon name="x-close" size={24} />
            </FlatButton>
            <FlatButton>
                <Icon name="menu" size={24} />
            </FlatButton>
            <FlatButton>
                <Icon name="settings" size={24} />
            </FlatButton>
        </div>
    ),
};

export const WithIconAndText: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FlatButton>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon name="plus" size={20} />
                    <span>Добавить</span>
                </div>
            </FlatButton>
            <FlatButton>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon name="search" size={20} />
                    <span>Поиск</span>
                </div>
            </FlatButton>
            <FlatButton>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Далее</span>
                    <Icon name="chevron-right" size={20} />
                </div>
            </FlatButton>
        </div>
    ),
};

export const CustomContent: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FlatButton>
                <div style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    Кнопка с кастомным контентом
                </div>
            </FlatButton>
            <FlatButton>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                    }}
                >
                    <Icon name="download-rounded" size={32} />
                    <span style={{ fontSize: '12px' }}>Скачать</span>
                </div>
            </FlatButton>
        </div>
    ),
};

export const InDifferentContexts: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: '#f5f5f5', padding: '16px' }}>
                <p style={{ marginBottom: '8px' }}>На светлом фоне:</p>
                <FlatButton>
                    <span style={{ color: '#333' }}>Текстовая кнопка</span>
                </FlatButton>
            </div>
            <div style={{ background: '#333', padding: '16px' }}>
                <p style={{ marginBottom: '8px', color: '#fff' }}>На темном фоне:</p>
                <FlatButton>
                    <span style={{ color: '#fff' }}>Текстовая кнопка</span>
                </FlatButton>
            </div>
            <div style={{ background: '#007bff', padding: '16px' }}>
                <p style={{ marginBottom: '8px', color: '#fff' }}>На цветном фоне:</p>
                <FlatButton>
                    <span style={{ color: '#fff' }}>Текстовая кнопка</span>
                </FlatButton>
            </div>
        </div>
    ),
};