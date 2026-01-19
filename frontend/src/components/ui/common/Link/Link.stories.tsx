import type { Meta, StoryObj } from '@storybook/react-vite';
import { BrowserRouter } from 'react-router-dom';
import { Link } from './Link';
import { iconNames } from '../Icon';

const meta = {
    title: 'Components/Link',
    component: Link,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    decorators: [
        Story => (
            <BrowserRouter>
                <Story />
            </BrowserRouter>
        ),
    ],
    argTypes: {
        to: {
            control: 'text',
            description: 'Путь для навигации',
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
            description: 'Размер ссылки',
        },
        theme: {
            control: 'select',
            options: ['blue', 'black'],
            description: 'Тема ссылки',
        },
        children: {
            control: 'text',
            description: 'Содержимое ссылки',
        },
        leadingIcon: {
            control: 'select',
            options: [undefined, ...iconNames],
            description: 'Иконка слева от текста',
        },
        trailingIcon: {
            control: 'select',
            options: [undefined, ...iconNames],
            description: 'Иконка справа от текста',
        },
    },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        to: '/example',
        children: 'Ссылка по умолчанию',
    },
};

export const AllSizes: Story = {
    args: {
        to: '',
        children: '',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link to="/example" size="sm">
                Маленькая ссылка (small)
            </Link>
            <Link to="/example" size="md">
                Средняя ссылка (medium, по умолчанию)
            </Link>
            <Link to="/example" size="lg">
                Большая ссылка (large)
            </Link>
        </div>
    ),
};

export const AllThemes: Story = {
    args: {
        to: '',
        children: '',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link to="/example" theme="blue">
                Синяя тема (blue, по умолчанию)
            </Link>
            <Link to="/example" theme="black">
                Черная тема (black)
            </Link>
        </div>
    ),
};

export const WithIcons: Story = {
    args: {
        to: '',
        children: '',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link to="/example" leadingIcon="arrow-narrow-left">
                Ссылка с иконкой слева
            </Link>
            <Link to="/example" trailingIcon="arrow-narrow-right">
                Ссылка с иконкой справа
            </Link>
            <Link to="/example" leadingIcon="arrow-narrow-left" trailingIcon="arrow-narrow-right">
                Ссылка с двумя иконками
            </Link>
        </div>
    ),
};

export const SizesWithIcons: Story = {
    args: {
        to: '',
        children: '',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link to="/example" size="sm" leadingIcon="settings">
                Маленькая ссылка с иконкой
            </Link>
            <Link to="/example" size="md" leadingIcon="settings">
                Средняя ссылка с иконкой
            </Link>
            <Link to="/example" size="lg" leadingIcon="settings">
                Большая ссылка с иконкой
            </Link>
        </div>
    ),
};

export const ThemesComparison: Story = {
    args: {
        to: '',
        children: '',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h4 style={{ marginBottom: '8px' }}>Синяя тема (blue)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Link to="/example" size="sm" theme="blue">
                        Маленькая синяя ссылка
                    </Link>
                    <Link to="/example" size="md" theme="blue">
                        Средняя синяя ссылка
                    </Link>
                    <Link to="/example" size="lg" theme="blue">
                        Большая синяя ссылка
                    </Link>
                </div>
            </div>
            <div>
                <h4 style={{ marginBottom: '8px' }}>Черная тема (black)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Link to="/example" size="sm" theme="black">
                        Маленькая черная ссылка
                    </Link>
                    <Link to="/example" size="md" theme="black">
                        Средняя черная ссылка
                    </Link>
                    <Link to="/example" size="lg" theme="black">
                        Большая черная ссылка
                    </Link>
                </div>
            </div>
        </div>
    ),
};
