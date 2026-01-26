import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthForm } from './AuthForm';

describe('AuthForm', () => {
    it('рендерит заголовок', () => {
        render(
            <AuthForm title="Тестовый заголовок" submitText="Отправить" onSubmit={vi.fn()}>
                <div>Контент</div>
            </AuthForm>,
        );

        expect(screen.getByText('Тестовый заголовок')).toBeInTheDocument();
    });

    it('рендерит описание, если оно передано', () => {
        render(
            <AuthForm
                title="Заголовок"
                description="Тестовое описание"
                submitText="Отправить"
                onSubmit={vi.fn()}
            >
                <div>Контент</div>
            </AuthForm>,
        );

        expect(screen.getByText('Тестовое описание')).toBeInTheDocument();
    });

    it('не рендерит описание, если оно не передано', () => {
        render(
            <AuthForm title="Заголовок" submitText="Отправить" onSubmit={vi.fn()}>
                <div>Контент</div>
            </AuthForm>,
        );

        expect(screen.queryByText('Тестовое описание')).not.toBeInTheDocument();
    });

    it('рендерит children', () => {
        render(
            <AuthForm title="Заголовок" submitText="Отправить" onSubmit={vi.fn()}>
                <div>Тестовый контент</div>
            </AuthForm>,
        );

        expect(screen.getByText('Тестовый контент')).toBeInTheDocument();
    });

    it('рендерит additionalOptionsUpper, если они переданы', () => {
        render(
            <AuthForm
                title="Заголовок"
                submitText="Отправить"
                onSubmit={vi.fn()}
                additionalOptionsUpper={<div>Дополнительные опции сверху</div>}
            >
                <div>Контент</div>
            </AuthForm>,
        );

        expect(screen.getByText('Дополнительные опции сверху')).toBeInTheDocument();
    });

    it('рендерит additionalOptionsLower, если они переданы', () => {
        render(
            <AuthForm
                title="Заголовок"
                submitText="Отправить"
                onSubmit={vi.fn()}
                additionalOptionsLower={<div>Дополнительные опции снизу</div>}
            >
                <div>Контент</div>
            </AuthForm>,
        );

        expect(screen.getByText('Дополнительные опции снизу')).toBeInTheDocument();
    });

    it('не рендерит additionalOptions, если они не переданы', () => {
        render(
            <AuthForm title="Заголовок" submitText="Отправить" onSubmit={vi.fn()}>
                <div>Контент</div>
            </AuthForm>,
        );

        expect(screen.queryByText('Дополнительные опции сверху')).not.toBeInTheDocument();
        expect(screen.queryByText('Дополнительные опции снизу')).not.toBeInTheDocument();
    });

    it('рендерит кнопку отправки с правильным текстом', () => {
        render(
            <AuthForm title="Заголовок" submitText="Войти" onSubmit={vi.fn()}>
                <div>Контент</div>
            </AuthForm>,
        );

        expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
    });

    it('вызывает onSubmit при отправке формы', async () => {
        const handleSubmit = vi.fn(e => e.preventDefault());
        const user = userEvent.setup();

        render(
            <AuthForm title="Заголовок" submitText="Отправить" onSubmit={handleSubmit}>
                <div>Контент</div>
            </AuthForm>,
        );

        const button = screen.getByRole('button', { name: 'Отправить' });
        await user.click(button);

        expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('отключает кнопку при isSubmitting=true', () => {
        render(
            <AuthForm title="Заголовок" submitText="Отправить" onSubmit={vi.fn()} isSubmitting>
                <div>Контент</div>
            </AuthForm>,
        );

        const button = screen.getByRole('button', { name: 'Отправить' });
        expect(button).toBeDisabled();
    });

    it('рендерит футер, если он передан', () => {
        render(
            <AuthForm
                title="Заголовок"
                submitText="Отправить"
                onSubmit={vi.fn()}
                footer={<div>Тестовый футер</div>}
            >
                <div>Контент</div>
            </AuthForm>,
        );

        expect(screen.getByText('Тестовый футер')).toBeInTheDocument();
    });

    it('не рендерит футер, если он не передан', () => {
        render(
            <AuthForm title="Заголовок" submitText="Отправить" onSubmit={vi.fn()}>
                <div>Контент</div>
            </AuthForm>,
        );

        expect(screen.queryByText('Тестовый футер')).not.toBeInTheDocument();
    });
});
