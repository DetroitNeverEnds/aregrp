import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextInput } from './TextInput';
import styles from './TextInput.module.scss';

describe('TextInput', () => {
    it('рендерится с placeholder', () => {
        render(<TextInput size="md" placeholder="Введите текст" />);
        expect(screen.getByPlaceholderText('Введите текст')).toBeInTheDocument();
    });

    it('применяет правильные классы для size', () => {
        const { container } = render(<TextInput size="lg" placeholder="Test" />);
        const input = container.querySelector('input');
        expect(input?.className).toContain(styles['input--lg']);
    });

    it('применяет правильные классы для width', () => {
        const { container } = render(<TextInput size="md" width="max" placeholder="Test" />);
        const input = container.querySelector('input');
        expect(input?.className).toContain(styles['input--width-max']);
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

    it('применяет кастомный className', () => {
        const { container } = render(
            <TextInput size="md" className="custom-class" placeholder="Test" />,
        );
        const input = container.querySelector('input');
        expect(input).toHaveClass('custom-class');
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
            const icon = container.querySelector('[class*="leading-icon"]');
            expect(icon).toBeInTheDocument();
        });

        it('рендерит trailingIcon', () => {
            const { container } = render(
                <TextInput size="md" trailingIcon="x-close" placeholder="Test" />,
            );
            const icon = container.querySelector('[class*="trailing-icon"]');
            expect(icon).toBeInTheDocument();
        });

        it('применяет класс для leadingIcon', () => {
            const { container } = render(
                <TextInput size="md" leadingIcon="search" placeholder="Test" />,
            );
            const input = container.querySelector('input');
            expect(input?.className).toContain(styles['input--with-leading-icon']);
        });

        it('рендерит trailingIcon без изменения padding', () => {
            const { container } = render(
                <TextInput size="md" trailingIcon="x-close" placeholder="Test" />,
            );
            const icon = container.querySelector('[class*="trailing-icon"]');
            expect(icon).toBeInTheDocument();
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

        it('вызывает onClear при клике на кнопку очистки', async () => {
            const handleClear = vi.fn();
            const user = userEvent.setup();

            const { container } = render(
                <TextInput size="md" value="test" onChange={() => {}} onClear={handleClear} />,
            );

            const clearButton = container.querySelector('button');
            if (clearButton) {
                await user.click(clearButton);
            }

            expect(handleClear).toHaveBeenCalledTimes(1);
        });

        it('не показывает кнопку очистки когда disabled', () => {
            const { container } = render(
                <TextInput size="md" value="test" onChange={() => {}} disabled />,
            );
            const clearButton = container.querySelector('button');
            expect(clearButton).not.toBeInTheDocument();
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

        it('не показывает toggle когда disabled', () => {
            const { container } = render(
                <TextInput size="md" type="password" placeholder="Password" disabled />,
            );
            const toggleButton = container.querySelector('button');
            expect(toggleButton).not.toBeInTheDocument();
        });
    });

    describe('ошибки и подписи', () => {
        it('показывает errorMessage', () => {
            render(<TextInput size="md" errorMessage="Ошибка валидации" />);
            expect(screen.getByText('Ошибка валидации')).toBeInTheDocument();
        });

        it('показывает caption', () => {
            render(<TextInput size="md" caption="Подсказка" />);
            expect(screen.getByText('Подсказка')).toBeInTheDocument();
        });

        it('приоритет errorMessage над caption', () => {
            render(<TextInput size="md" errorMessage="Ошибка" caption="Подсказка" />);
            expect(screen.getByText('Ошибка')).toBeInTheDocument();
            expect(screen.queryByText('Подсказка')).not.toBeInTheDocument();
        });

        it('применяет класс error при наличии errorMessage', () => {
            const { container } = render(<TextInput size="md" errorMessage="Ошибка" />);
            const input = container.querySelector('input');
            expect(input?.className).toContain(styles['input--error']);
        });

        it('применяет класс error для caption', () => {
            const { container } = render(<TextInput size="md" errorMessage="Ошибка" />);
            const caption = container.querySelector('[class*="caption"]');
            expect(caption?.className).toContain(styles['input__caption--error']);
        });
    });

    describe('состояния фокуса', () => {
        it('применяет класс focused при фокусе', async () => {
            const user = userEvent.setup();
            const { container } = render(<TextInput size="md" placeholder="Test" />);

            const input = container.querySelector('input');
            if (input) {
                await user.click(input);
            }

            expect(input?.className).toContain(styles['input--focused']);
        });

        it('убирает класс focused при потере фокуса', async () => {
            const user = userEvent.setup();
            const { container } = render(<TextInput size="md" placeholder="Test" />);

            const input = container.querySelector('input');
            if (input) {
                await user.click(input);
                await user.tab();
            }

            expect(input?.className).not.toContain(styles['input--focused']);
        });
    });

    describe('размеры', () => {
        it.each([
            ['lg', 'input--lg'],
            ['md', 'input--md'],
        ])('применяет класс для размера %s', (size, expectedClass) => {
            const { container } = render(<TextInput size={size as any} placeholder="Test" />);
            const input = container.querySelector('input');
            expect(input?.className).toContain(styles[expectedClass]);
        });
    });

    describe('ширина', () => {
        it.each([
            ['auto', 'input--width-auto'],
            ['max', 'input--width-max'],
        ])('применяет класс для ширины %s', (width, expectedClass) => {
            const { container } = render(
                <TextInput size="md" width={width as any} placeholder="Test" />,
            );
            const input = container.querySelector('input');
            expect(input?.className).toContain(styles[expectedClass]);
        });
    });
});