import type { Meta, StoryObj } from '@storybook/react-vite';
import { BrowserRouter } from 'react-router-dom';
import { Button, type ButtonSize, type ButtonWidth } from './Button';
import { iconNames } from '../Icon';

const meta = {
    title: 'Components/Button',
    component: Button,
    decorators: [
        Story => (
            <BrowserRouter>
                <Story />
            </BrowserRouter>
        ),
    ],
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'outlined', 'secondary'],
            description: 'Тип кнопки (определяет визуальный стиль)',
        },
        size: {
            control: 'select',
            options: ['lg', 'md'],
            description: 'Размер кнопки',
        },
        width: {
            control: 'select',
            options: ['auto', 'max'],
            description: 'Ширина кнопки: auto - по содержимому, max - на всю ширину контейнера',
        },
        disabled: {
            control: 'boolean',
            description: 'Состояние disabled',
        },
        children: {
            control: 'text',
            description: 'Текст кнопки',
        },
        icon: {
            control: 'select',
            description: 'Название иконки для отображения',
            options: [...iconNames, undefined],
            required: false,
        },
        onlyIcon: {
            control: 'boolean',
            description: 'Показывать только иконку без текста',
        },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        variant: 'primary',
        size: 'md',
        icon: 'sample',
        children: 'Button',
    },
};

// Primary варианты
export const Primary: Story = {
    args: {
        variant: 'primary',
        size: 'md',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(['lg', 'md'] as ButtonSize[]).map(size => (
                <div key={size} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Button variant="primary" size={size} icon="sample">
                        Button
                    </Button>
                    <Button variant="primary" size={size} icon="sample" disabled>
                        Button
                    </Button>
                </div>
            ))}
        </div>
    ),
};
export const Outlined: Story = {
    args: {
        variant: 'primary',
        size: 'md',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(['lg', 'md'] as ButtonSize[]).map(size => (
                <div key={size} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Button variant="outlined" size={size} icon="sample">
                        Button
                    </Button>
                    <Button variant="outlined" size={size} icon="sample" disabled>
                        Button
                    </Button>
                </div>
            ))}
        </div>
    ),
};
export const Secondary: Story = {
    args: {
        variant: 'primary',
        size: 'md',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(['lg', 'md'] as ButtonSize[]).map(size => (
                <div key={size} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Button variant="secondary" size={size} icon="sample">
                        Button
                    </Button>
                    <Button variant="secondary" size={size} icon="sample" disabled>
                        Button
                    </Button>
                </div>
            ))}
        </div>
    ),
};

// С иконкой
export const NoIcon: Story = {
    args: {
        variant: 'primary',
        size: 'md',
        children: 'Button',
    },
};

// Только иконки разных размеров
export const IconOnly: Story = {
    args: {
        variant: 'primary',
        size: 'md',
    },
    render: () => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button variant="primary" size="lg" icon="sample" onlyIcon />
            <Button variant="primary" size="md" icon="sample" onlyIcon />
            <Button variant="outlined" size="lg" icon="sample" onlyIcon />
            <Button variant="outlined" size="md" icon="sample" onlyIcon />
            <Button variant="secondary" size="lg" icon="sample" onlyIcon />
            <Button variant="secondary" size="md" icon="sample" onlyIcon />
        </div>
    ),
};

// Варианты ширины
export const WidthVariants: Story = {
    args: {
        variant: 'primary',
        size: 'md',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '400px' }}>
            <div>
                <h3 style={{ marginBottom: '8px' }}>Width: auto (по умолчанию)</h3>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        alignItems: 'center',
                    }}
                >
                    <Button variant="primary" size="md" width="auto">
                        Короткий текст
                    </Button>
                    <Button variant="primary" size="md" width="auto" icon="plus">
                        С иконкой
                    </Button>
                </div>
            </div>
            <div>
                <h3 style={{ marginBottom: '8px' }}>Width: max (на всю ширину)</h3>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        alignItems: 'center',
                    }}
                >
                    <Button variant="primary" size="md" width="max">
                        Кнопка на всю ширину
                    </Button>
                    <Button variant="outlined" size="md" width="max" icon="download-rounded">
                        Скачать файл
                    </Button>
                    <Button variant="secondary" size="lg" width="max">
                        Большая кнопка на всю ширину
                    </Button>
                </div>
            </div>
            <div>
                <h3 style={{ marginBottom: '8px' }}>Сравнение</h3>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        alignItems: 'center',
                    }}
                >
                    {(['auto', 'max'] as ButtonWidth[]).map(width => (
                        <Button key={width} variant="primary" size="md" width={width}>
                            {width === 'auto' ? 'Auto' : 'Max'}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    ),
};

export const LongText: Story = {
    args: {
        variant: 'primary',
        size: 'md',
    },
    render: () => (
        <div style={{ width: '500px' }}>
            <Button variant="primary" size="md" icon="sample">
                {'Очень длинный текст. '.repeat(100)}
            </Button>
        </div>
    ),
};

// Примеры с разными иконками
export const WithDifferentIcons: Story = {
    args: {
        variant: 'primary',
        size: 'md',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Button variant="primary" size="md" icon="plus">
                    Добавить
                </Button>
                <Button variant="primary" size="md" icon="search">
                    Поиск
                </Button>
                <Button variant="primary" size="md" icon="download-rounded">
                    Скачать
                </Button>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Button variant="outlined" size="md" icon="settings">
                    Настройки
                </Button>
                <Button variant="outlined" size="md" icon="refresh">
                    Обновить
                </Button>
                <Button variant="outlined" size="md" icon="x-close">
                    Закрыть
                </Button>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Button variant="secondary" size="md" icon="chevron-left">
                    Назад
                </Button>
                <Button variant="secondary" size="md" icon="chevron-right">
                    Вперёд
                </Button>
            </div>
        </div>
    ),
};

// Все варианты в одном
export const AllVariants: Story = {
    args: {
        variant: 'primary',
        size: 'md',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Button variant="primary" size="lg">
                    Primary Large
                </Button>
                <Button variant="primary" size="md">
                    Primary Medium
                </Button>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Button variant="outlined" size="lg">
                    Outlined Large
                </Button>
                <Button variant="outlined" size="md">
                    Outlined Medium
                </Button>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Button variant="secondary" size="lg">
                    Secondary Large
                </Button>
                <Button variant="secondary" size="md">
                    Secondary Medium
                </Button>
            </div>
        </div>
    ),
};

// Кнопки-ссылки
export const AsLink: Story = {
    args: {
        variant: 'primary',
        size: 'md',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Button variant="primary" size="md" to="/" icon="sample">
                    Главная
                </Button>
                <Button variant="outlined" size="md" to="/about">
                    О нас
                </Button>
                <Button variant="secondary" size="md" to="/contacts" icon="phone">
                    Контакты
                </Button>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Button variant="primary" size="lg" to="/" icon="chevron-left">
                    Назад
                </Button>
                <Button variant="outlined" size="lg" to="/next" icon="chevron-right">
                    Далее
                </Button>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Button variant="primary" size="md" to="/" icon="plus" onlyIcon />
                <Button variant="outlined" size="md" to="/search" icon="search" onlyIcon />
                <Button variant="secondary" size="md" to="/settings" icon="settings" onlyIcon />
            </div>
        </div>
    ),
};
