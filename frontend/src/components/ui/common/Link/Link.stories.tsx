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
            description: 'Вариант текста (размер и толщина шрифта)',
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

export const AllVariants: Story = {
    args: {
        to: '',
        children: '',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link to="/example" variant="12-reg">
                12-reg: Очень маленькая ссылка
            </Link>
            <Link to="/example" variant="14-reg">
                14-reg: Маленькая ссылка
            </Link>
            <Link to="/example" variant="16-reg">
                16-reg: Обычная ссылка (по умолчанию)
            </Link>
            <Link to="/example" variant="18-reg">
                18-reg: Средняя ссылка
            </Link>
            <Link to="/example" variant="20-med">
                20-med: Большая жирная ссылка
            </Link>
            <Link to="/example" variant="24-med">
                24-med: Очень большая жирная ссылка
            </Link>
        </div>
    ),
};

export const WithComplexChildren: Story = {
    args: {
        to: '',
        children: (
            <>
                Ссылка с <strong>жирным</strong> и <em>курсивным</em> текстом
            </>
        ),
    },
};

export const DifferentSizes: Story = {
    args: {
        to: '',
        children: '',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link to="/example" variant="14-reg" leadingIcon="settings">
                Маленькая ссылка с иконкой
            </Link>
            <Link to="/example" variant="16-reg" leadingIcon="settings">
                Обычная ссылка с иконкой
            </Link>
            <Link to="/example" variant="20-med" leadingIcon="settings">
                Большая ссылка с иконкой
            </Link>
            <Link to="/example" variant="24-med" leadingIcon="settings">
                Очень большая ссылка с иконкой
            </Link>
        </div>
    ),
};
