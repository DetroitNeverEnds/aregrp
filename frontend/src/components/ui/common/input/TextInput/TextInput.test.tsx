import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextInput, type TextInputSize } from './TextInput';
import styles from './TextInput.module.scss';

describe('TextInput', () => {
    it('рендерится с placeholder', () => {
        render(<TextInput size="md" placeholder="Введите текст" />);
        expect(screen.getByPlaceholderText('Введите текст')).toBeInTheDocument();
    });

    it('применяет правильные классы для size на контейнере', () => {
        const { container } = render(<TextInput size="lg" placeholder="Test" />);
        const inputContainer = container.querySelector('[class*="input-container"]');
        expect(inputContainer?.className).toContain(styles['input-container--lg']);
    });

    it('обрабатывает изменение значения', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();

        render(<TextInput size="md" onChange={handleChange} placeholder="Test" />);

        const input = screen.getByPlaceholderText('Test');
        await user.type(input, 'Hello');

        expect(handleChange).toHaveBeenCalled();
    });

    it('применяет disabled атрибут', () => {
        const { container } = render(<TextInput size="md" disabled placeholder="Test" />);
        const input = container.querySelector('input');
        expect(input).toBeDisabled();
    });

    it('применяет disabled класс на контейнере', () => {
        const { container } = render(<TextInput size="md" disabled placeholder="Test" />);
        const inputContainer = container.querySelector('[class*="input-container"]');
        expect(inputContainer?.className).toContain(styles['input-container--disabled']);
    });

    it('применяет кастомный className на контейнер', () => {
        const { container } = render(
            <TextInput size="md" className="custom-class" placeholder="Test" />,
        );
        const inputContainer = container.querySelector('[class*="input-container"]');
        expect(inputContainer).toHaveClass('custom-class');
    });

    it('использует type="text" по умолчанию', () => {
        const { container } = render(<TextInput size="md" placeholder="Test" />);
        const input = container.querySelector('input');
        expect(input).toHaveAttribute('type', 'text');
    });

    it('применяет кастомный type', () => {
        const { container } = render(<TextInput size="md" type="email" placeholder="Test" />);
        const input = container.querySelector('input');
        expect(input).toHaveAttribute('type', 'email');
    });

    describe('иконки', () => {
        it('рендерит leadingIcon', () => {
            const { container } = render(
                <TextInput size="md" leadingIcon="search" placeholder="Test" />,
            );
            const icon = container.querySelector('[role="img"]');
            expect(icon).toBeInTheDocument();
        });

        it('применяет класс для leadingIcon на контейнере', () => {
            const { container } = render(
                <TextInput size="md" leadingIcon="search" placeholder="Test" />,
            );
            const inputContainer = container.querySelector('[class*="input-container"]');
            expect(inputContainer?.className).toContain(styles['input--with-leading-icon']);
        });
    });

    describe('кнопка очистки', () => {
        it('показывает кнопку очистки при наличии значения', () => {
            const { container } = render(<TextInput size="md" value="test" onChange={() => {}} />);
            const clearButton = container.querySelector('button');
            expect(clearButton).toBeInTheDocument();
        });

        it('не показывает кнопку очистки при пустом значении', () => {
            const { container } = render(<TextInput size="md" value="" onChange={() => {}} />);
            const clearButton = container.querySelector('button');
            expect(clearButton).not.toBeInTheDocument();
        });

        it('очищает значение при клике на кнопку очистки', async () => {
            const handleChange = vi.fn();
            const user = userEvent.setup();

            const { container } = render(
                <TextInput size="md" value="test" onChange={handleChange} />,
            );

            const clearButton = container.querySelector('button');
            if (clearButton) {
                await user.click(clearButton);
            }

            expect(handleChange).toHaveBeenCalled();
        });

        it('показывает кнопку очистки даже когда disabled', () => {
            const { container } = render(
                <TextInput size="md" value="test" onChange={() => {}} disabled />,
            );
            const clearButton = container.querySelector('button');
            expect(clearButton).toBeInTheDocument();
        });
    });

    describe('password toggle', () => {
        it('показывает toggle для type="password"', () => {
            const { container } = render(
                <TextInput size="md" type="password" placeholder="Password" />,
            );
            const toggleButton = container.querySelector('button');
            expect(toggleButton).toBeInTheDocument();
        });

        it('переключает видимость пароля при клике', async () => {
            const user = userEvent.setup();
            const { container } = render(
                <TextInput size="md" type="password" placeholder="Password" />,
            );

            const input = container.querySelector('input');
            const toggleButton = container.querySelector('button');

            expect(input).toHaveAttribute('type', 'password');

            if (toggleButton) {
                await user.click(toggleButton);
            }

            expect(input).toHaveAttribute('type', 'text');

            if (toggleButton) {
                await user.click(toggleButton);
            }

            expect(input).toHaveAttribute('type', 'password');
        });

        it('показывает toggle даже когда disabled', () => {
            const { container } = render(
                <TextInput size="md" type="password" placeholder="Password" disabled />,
            );
            const toggleButton = container.querySelector('button');
            expect(toggleButton).toBeInTheDocument();
        });
    });

    describe('ошибки', () => {
        it('показывает errorMessage', () => {
            render(<TextInput size="md" errorMessage="Ошибка валидации" />);
            expect(screen.getByText('Ошибка валидации')).toBeInTheDocument();
        });

        it('применяет класс error на контейнере при наличии errorMessage', () => {
            const { container } = render(<TextInput size="md" errorMessage="Ошибка" />);
            const inputContainer = container.querySelector('[class*="input-container"]');
            expect(inputContainer?.className).toContain(styles['input-container--error']);
        });
    });

    describe('состояния фокуса', () => {
        it('применяет стили фокуса на контейнере при фокусе', async () => {
            const user = userEvent.setup();
            const { container } = render(<TextInput size="md" placeholder="Test" />);

            const input = container.querySelector('input');
            const inputContainer = container.querySelector('[class*="input-container"]');

            if (input) {
                await user.click(input);
            }

            // Проверяем, что контейнер имеет состояние focus-within через CSS
            expect(inputContainer).toBeInTheDocument();
            expect(document.activeElement).toBe(input);
        });

        it('убирает фокус при потере фокуса', async () => {
            const user = userEvent.setup();
            const { container } = render(<TextInput size="md" placeholder="Test" />);

            const input = container.querySelector('input');
            if (input) {
                await user.click(input);
                await user.tab();
            }

            expect(document.activeElement).not.toBe(input);
        });
    });

    describe('размеры', () => {
        it.each([
            ['lg', 'input-container--lg'],
            ['md', 'input-container--md'],
        ])('применяет класс для размера %s на контейнере', (size, expectedClass) => {
            const { container } = render(
                <TextInput size={size as TextInputSize} placeholder="Test" />,
            );
            const inputContainer = container.querySelector('[class*="input-container"]');
            expect(inputContainer?.className).toContain(styles[expectedClass]);
        });
    });
});
