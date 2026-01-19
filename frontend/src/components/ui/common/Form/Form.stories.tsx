import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form } from './Form';
import { TextInput } from '../input/TextInput';
import { Button } from '../Button';
import { Checkbox } from '../input/Checkbox';
import { Text } from '../Text';

const meta = {
    title: 'UI/Common/Form',
    component: Form,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: (
            <>
                <TextInput size="lg" placeholder="Email" type="email" />
                <TextInput size="lg" placeholder="Password" type="password" />
                <Button variant="primary" size="lg" width="max" type="submit">
                    Отправить
                </Button>
            </>
        ),
    },
};

export const LoginForm: Story = {
    args: {
        children: (
            <>
                <Text variant="h3">Вход</Text>
                <TextInput size="lg" placeholder="Email" type="email" />
                <TextInput size="lg" placeholder="Пароль" type="password" />
                <Checkbox size="md" label="Запомнить меня" />
                <Button variant="primary" size="lg" width="max" type="submit">
                    Войти
                </Button>
            </>
        ),
    },
};

export const RegisterForm: Story = {
    args: {
        children: (
            <>
                <Text variant="h3">Регистрация</Text>
                <TextInput size="lg" placeholder="Имя" type="text" />
                <TextInput size="lg" placeholder="Email" type="email" />
                <TextInput size="lg" placeholder="Пароль" type="password" />
                <TextInput size="lg" placeholder="Подтвердите пароль" type="password" />
                <Checkbox size="md" label="Я согласен с условиями использования" />
                <Button variant="primary" size="lg" width="max" type="submit">
                    Зарегистрироваться
                </Button>
            </>
        ),
    },
};

export const WithErrors: Story = {
    args: {
        children: (
            <>
                <Text variant="h3">Форма с ошибками</Text>
                <TextInput
                    size="lg"
                    placeholder="Email"
                    type="email"
                    errorMessage="Введите корректный email"
                />
                <TextInput
                    size="lg"
                    placeholder="Пароль"
                    type="password"
                    errorMessage="Пароль должен содержать минимум 8 символов"
                />
                <Button variant="primary" size="lg" width="max" type="submit">
                    Отправить
                </Button>
            </>
        ),
    },
};

export const CustomStyles: Story = {
    args: {
        className: 'custom-form',
        style: { maxWidth: '400px', padding: '24px', border: '1px solid #dadde2' },
        children: (
            <>
                <Text variant="h3">Кастомная форма</Text>
                <TextInput size="md" placeholder="Поле 1" />
                <TextInput size="md" placeholder="Поле 2" />
                <Button variant="outlined" size="md" width="max" type="submit">
                    Отправить
                </Button>
            </>
        ),
    },
};
