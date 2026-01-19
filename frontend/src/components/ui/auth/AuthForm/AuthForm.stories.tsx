import type { Meta, StoryObj } from '@storybook/react';
import { AuthForm } from './AuthForm';
import { TextInput } from '../../common/input/TextInput';
import { Checkbox } from '../../common/input/Checkbox';
import { Link } from '../../common/Link';
import { Text } from '../../common/Text';
import { Flex } from '../../common/Flex';

const meta = {
    title: 'Auth/AuthForm',
    component: AuthForm,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof AuthForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Login: Story = {
    args: {
        title: 'Вход',
        submitText: 'Войти',
        onSubmit: e => {
            e.preventDefault();
            console.log('Form submitted');
        },
        children: (
            <Flex gap={10}>
                <TextInput size="lg" type="email" placeholder="Email" />
                <TextInput size="lg" type="password" placeholder="Пароль" />
            </Flex>
        ),
        additionalOptions: (
            <>
                <Checkbox size="lg" label="Запомнить меня" />
                <Link to="/auth/forgot-password" size="lg" theme="black">
                    Забыли пароль?
                </Link>
            </>
        ),
        footer: (
            <Flex align="end">
                <Text variant="16-reg" color="gray-50">
                    Нет аккаунта?{' '}
                    <Link to="/auth/register" size="lg" theme="black">
                        Зарегистрироваться
                    </Link>
                </Text>
            </Flex>
        ),
    },
};

export const ForgotPassword: Story = {
    args: {
        title: 'Восстановление пароля',
        description: 'Введите email, указанный при регистрации',
        submitText: 'Отправить',
        onSubmit: e => {
            e.preventDefault();
            console.log('Form submitted');
        },
        children: <TextInput size="lg" type="email" placeholder="Email" />,
        footer: (
            <Flex gap={10} align="end">
                <Text variant="16-reg" color="gray-50">
                    Вспомнили пароль?{' '}
                    <Link to="/auth/login" size="lg" theme="black">
                        Войти
                    </Link>
                </Text>
                <Text variant="16-reg" color="gray-50">
                    Нет аккаунта?{' '}
                    <Link to="/auth/register" size="lg" theme="black">
                        Зарегистрироваться
                    </Link>
                </Text>
            </Flex>
        ),
    },
};

export const Register: Story = {
    args: {
        title: 'Регистрация',
        submitText: 'Зарегистрироваться',
        onSubmit: e => {
            e.preventDefault();
            console.log('Form submitted');
        },
        children: (
            <Flex gap={10}>
                <TextInput size="lg" type="text" placeholder="Имя" />
                <TextInput size="lg" type="email" placeholder="Email" />
                <TextInput size="lg" type="tel" placeholder="Телефон" />
                <TextInput size="lg" type="password" placeholder="Пароль" />
                <TextInput size="lg" type="password" placeholder="Подтвердите пароль" />
            </Flex>
        ),
        additionalOptions: (
            <Checkbox
                size="lg"
                label={
                    <Text variant="14-reg">
                        Я согласен с{' '}
                        <Link to="/policy" size="md">
                            политикой конфиденциальности
                        </Link>
                    </Text>
                }
            />
        ),
        footer: (
            <Flex align="end">
                <Text variant="16-reg" color="gray-50">
                    Уже есть аккаунт?{' '}
                    <Link to="/auth/login" size="lg" theme="black">
                        Войти
                    </Link>
                </Text>
            </Flex>
        ),
    },
};

export const WithoutFooter: Story = {
    args: {
        title: 'Простая форма',
        submitText: 'Отправить',
        onSubmit: e => {
            e.preventDefault();
            console.log('Form submitted');
        },
        children: (
            <Flex gap={10}>
                <TextInput size="lg" type="email" placeholder="Email" />
                <TextInput size="lg" type="password" placeholder="Пароль" />
            </Flex>
        ),
    },
};

export const WithoutDescription: Story = {
    args: {
        title: 'Форма без описания',
        submitText: 'Отправить',
        onSubmit: e => {
            e.preventDefault();
            console.log('Form submitted');
        },
        children: <TextInput size="lg" type="email" placeholder="Email" />,
        footer: (
            <Flex align="end">
                <Text variant="16-reg" color="gray-50">
                    Дополнительная информация
                </Text>
            </Flex>
        ),
    },
};

export const Submitting: Story = {
    args: {
        title: 'Отправка формы',
        submitText: 'Отправка...',
        isSubmitting: true,
        onSubmit: e => {
            e.preventDefault();
            console.log('Form submitted');
        },
        children: (
            <Flex gap={10}>
                <TextInput size="lg" type="email" placeholder="Email" />
                <TextInput size="lg" type="password" placeholder="Пароль" />
            </Flex>
        ),
    },
};
