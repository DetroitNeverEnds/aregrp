import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextInput, type TextInputProps, type TextInputSize } from './TextInput';
import { iconNames } from '../Icon';
import { useState } from 'react';

const meta = {
    title: 'Components/TextInput',
    component: TextInput,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'select',
            options: ['lg', 'md'],
            description: 'Размер инпута',
        },
        width: {
            control: 'select',
            options: ['auto', 'max'],
            description: 'Ширина инпута: auto - по содержимому, max - на всю ширину контейнера',
        },
        disabled: {
            control: 'boolean',
            description: 'Состояние disabled',
        },
        placeholder: {
            control: 'text',
            description: 'Текст placeholder',
        },
        leadingIcon: {
            control: 'select',
            description: 'Иконка слева',
            options: [undefined, ...iconNames],
        },
        errorMessage: {
            control: 'text',
            description: 'Сообщение об ошибке',
        },
        type: {
            control: 'select',
            options: ['text', 'password', 'email', 'search'],
            description: 'Тип инпута',
        },
    },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// Контролируемый компонент для stories
const ControlledTextInput = ({ value, ...props }: TextInputProps) => {
    const [val, setVal] = useState(value);
    return <TextInput name="test" {...props} value={val} onChange={e => setVal(e.target.value)} />;
};

export const Default: Story = {
    args: {
        size: 'md',
        placeholder: 'Введите текст',
        leadingIcon: 'sample',
    },
    render: args => <ControlledTextInput {...args} />,
};

// Размеры
export const Sizes: Story = {
    args: {
        size: 'md',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '400px' }}>
            {(['lg', 'md'] as TextInputSize[]).map(size => (
                <ControlledTextInput key={size} size={size} placeholder={`Размер ${size}`} />
            ))}
        </div>
    ),
};

// С иконками
export const WithIcons: Story = {
    args: {
        size: 'md',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '400px' }}>
            <ControlledTextInput size="md" leadingIcon="search" placeholder="Поиск..." />
            <ControlledTextInput
                size="md"
                leadingIcon="mail-simple"
                placeholder="Email"
                type="email"
            />
            <ControlledTextInput
                size="md"
                leadingIcon="user-simple"
                placeholder="Имя пользователя"
            />
        </div>
    ),
};

// Password
export const Password: Story = {
    args: {
        size: 'md',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '400px' }}>
            <ControlledTextInput size="md" type="password" placeholder="Введите пароль" />
            <ControlledTextInput
                size="md"
                type="password"
                placeholder="Введите пароль"
                value="My Password"
            />
            <ControlledTextInput
                size="md"
                type="password"
                placeholder="Пароль с ошибкой"
                value="My Password"
                errorMessage="Неверный пароль"
            />
        </div>
    ),
};

// Состояния
export const States: Story = {
    args: {
        size: 'md',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '400px' }}>
            <ControlledTextInput size="md" placeholder="Обычное состояние" />
            <ControlledTextInput size="md" placeholder="С текстом" value="Введенный текст" />
            <ControlledTextInput size="md" placeholder="Disabled" disabled />
            <ControlledTextInput
                size="md"
                placeholder="Disabled с текстом"
                value="Disabled с текстом"
                disabled
            />
            <ControlledTextInput
                size="md"
                placeholder="Error"
                value="Некорректный ввод"
                errorMessage="Ошибка"
            />
        </div>
    ),
};

// Примеры использования
export const Examples: Story = {
    args: {
        size: 'md',
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '500px' }}>
            <div>
                <h3 style={{ marginBottom: '8px' }}>Форма входа</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <ControlledTextInput
                        size="md"
                        width="max"
                        leadingIcon="mail-simple"
                        placeholder="Email"
                        type="email"
                    />
                    <ControlledTextInput
                        size="md"
                        width="max"
                        type="password"
                        placeholder="Пароль"
                    />
                </div>
            </div>

            <div>
                <h3 style={{ marginBottom: '8px' }}>Поиск</h3>
                <ControlledTextInput
                    size="lg"
                    width="max"
                    leadingIcon="search"
                    placeholder="Поиск по сайту..."
                />
            </div>

            <div>
                <h3 style={{ marginBottom: '8px' }}>Форма с валидацией</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <ControlledTextInput size="md" width="max" placeholder="Имя" />
                    <ControlledTextInput
                        size="md"
                        width="max"
                        leadingIcon="mail-simple"
                        placeholder="Email"
                        type="email"
                        errorMessage="Неверный формат email"
                    />
                    <ControlledTextInput
                        size="md"
                        width="max"
                        type="password"
                        placeholder="Пароль"
                        errorMessage="Пароль должен содержать минимум 8 символов"
                    />
                </div>
            </div>
        </div>
    ),
};
