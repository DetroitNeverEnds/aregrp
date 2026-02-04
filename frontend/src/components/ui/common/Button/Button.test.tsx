import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { Button, type ButtonSize, type ButtonVariant } from './Button';
import styles from './Button.module.scss';

const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Button', () => {
    it('рендерится с текстом', () => {
        render(
            <Button variant="primary" size="md">
                Click me
            </Button>,
        );
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('применяет правильные классы для variant и size', () => {
        const { container } = render(
            <Button variant="primary" size="lg">
                Button
            </Button>,
        );
        const button = container.querySelector('button');
        expect(button?.className).toContain(styles.button);
        expect(button?.className).toContain(styles['button--primary']);
        expect(button?.className).toContain(styles['button--lg']);
    });

    it('рендерится с иконкой', () => {
        render(
            <Button variant="primary" size="md">
                <span data-testid="test-icon">Icon</span>
                Button
            </Button>,
        );
        expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('обрабатывает клик', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();

        render(
            <Button variant="primary" size="md" onClick={handleClick}>
                Click me
            </Button>,
        );

        await user.click(screen.getByText('Click me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('не обрабатывает клик когда disabled', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();

        render(
            <Button variant="primary" size="md" onClick={handleClick} disabled>
                Click me
            </Button>,
        );

        await user.click(screen.getByText('Click me'));
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('применяет disabled атрибут', () => {
        const { container } = render(
            <Button variant="primary" size="md" disabled>
                Button
            </Button>,
        );
        const button = container.querySelector('button');
        expect(button).toBeDisabled();
    });

    it('применяет кастомный className', () => {
        const { container } = render(
            <Button variant="primary" size="md" className="custom-class">
                Button
            </Button>,
        );
        const button = container.querySelector('button');
        expect(button).toHaveClass('custom-class');
    });

    it('использует type="button" по умолчанию', () => {
        const { container } = render(
            <Button variant="primary" size="md">
                Button
            </Button>,
        );
        const button = container.querySelector('button');
        expect(button).toHaveAttribute('type', 'button');
    });

    it('применяет кастомный type', () => {
        const { container } = render(
            <Button variant="primary" size="md" type="submit">
                Button
            </Button>,
        );
        const button = container.querySelector('button');
        expect(button).toHaveAttribute('type', 'submit');
    });

    it('рендерится без текста (только иконка)', () => {
        render(
            <Button variant="primary" size="md">
                <span data-testid="test-icon">Icon</span>
            </Button>,
        );
        expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('рендерится с иконкой через проп icon', () => {
        const { container } = render(
            <Button variant="primary" size="md" icon="check">
                Button
            </Button>,
        );
        const icon = container.querySelector('[class*="icon"]');
        expect(icon).toBeInTheDocument();
        expect(screen.getByText('Button')).toBeInTheDocument();
    });

    it('рендерится только с иконкой через onlyIcon', () => {
        const { container } = render(
            <Button variant="primary" size="md" icon="plus" onlyIcon>
                Button text
            </Button>,
        );
        const icon = container.querySelector('[class*="icon"]');
        expect(icon).toBeInTheDocument();
        expect(screen.queryByText('Button text')).not.toBeInTheDocument();
    });

    it('применяет класс button--only-icon когда onlyIcon=true', () => {
        const { container } = render(<Button variant="primary" size="md" icon="plus" onlyIcon />);
        const button = container.querySelector('button');
        expect(button?.className).toContain(styles['button--only-icon']);
    });

    it('использует правильный размер иконки для size="lg"', () => {
        const { container } = render(
            <Button variant="primary" size="lg" icon="check">
                Button
            </Button>,
        );
        const icon = container.querySelector('[class*="icon--size-24"]');
        expect(icon).toBeInTheDocument();
    });

    it('использует правильный размер иконки для size="md"', () => {
        const { container } = render(
            <Button variant="primary" size="md" icon="check">
                Button
            </Button>,
        );
        const icon = container.querySelector('[class*="icon--size-24"]');
        expect(icon).toBeInTheDocument();
    });

    it('не рендерит иконку если проп icon не передан', () => {
        const { container } = render(
            <Button variant="primary" size="md">
                Button
            </Button>,
        );
        const icon = container.querySelector('[class*="icon"]');
        expect(icon).not.toBeInTheDocument();
    });

    describe('варианты кнопок', () => {
        it.each([
            ['primary', 'button--primary'],
            ['outlined', 'button--outlined'],
            ['secondary', 'button--secondary'],
        ])('применяет класс для варианта %s', (variant, expectedClass) => {
            const { container } = render(
                <Button variant={variant as ButtonVariant} size="md">
                    Button
                </Button>,
            );
            const button = container.querySelector('button');
            expect(button?.className).toContain(styles[expectedClass]);
        });
    });

    describe('размеры кнопок', () => {
        it.each([
            ['lg', 'button--lg'],
            ['md', 'button--md'],
        ])('применяет класс для размера %s', (size, expectedClass) => {
            const { container } = render(
                <Button variant="primary" size={size as ButtonSize}>
                    Button
                </Button>,
            );
            const button = container.querySelector('button');
            expect(button?.className).toContain(styles[expectedClass]);
        });
    });

    describe('состояния кнопок', () => {
        it('применяет focus стили', () => {
            const { container } = render(
                <Button variant="primary" size="md">
                    Button
                </Button>,
            );
            const button = container.querySelector('button');
            button?.focus();
            expect(document.activeElement).toBe(button);
        });

        it('не применяет focus когда disabled', () => {
            const { container } = render(
                <Button variant="primary" size="md" disabled>
                    Button
                </Button>,
            );
            const button = container.querySelector('button');
            button?.focus();
            expect(document.activeElement).not.toBe(button);
        });

        describe('кнопка как ссылка', () => {
            it('рендерится как Link когда передан проп to', () => {
                const { container } = renderWithRouter(
                    <Button variant="primary" size="md" to="/test">
                        Link Button
                    </Button>,
                );
                const link = container.querySelector('a');
                expect(link).toBeInTheDocument();
                expect(link).toHaveAttribute('href', '/test');
                expect(screen.getByText('Link Button')).toBeInTheDocument();
            });

            it('применяет правильные классы для Link', () => {
                const { container } = renderWithRouter(
                    <Button variant="outlined" size="lg" to="/test" className="custom-class">
                        Link Button
                    </Button>,
                );
                const link = container.querySelector('a');
                expect(link?.className).toContain(styles.button);
                expect(link?.className).toContain(styles['button--outlined']);
                expect(link?.className).toContain(styles['button--lg']);
                expect(link).toHaveClass('custom-class');
            });

            it('рендерится с иконкой как Link', () => {
                const { container } = renderWithRouter(
                    <Button variant="primary" size="md" to="/test" icon="check">
                        Link with Icon
                    </Button>,
                );
                const link = container.querySelector('a');
                const icon = container.querySelector('[class*="icon"]');
                expect(link).toBeInTheDocument();
                expect(icon).toBeInTheDocument();
                expect(screen.getByText('Link with Icon')).toBeInTheDocument();
            });

            it('рендерится только с иконкой как Link', () => {
                const { container } = renderWithRouter(
                    <Button variant="primary" size="md" to="/test" icon="plus" onlyIcon>
                        Hidden text
                    </Button>,
                );
                const link = container.querySelector('a');
                const icon = container.querySelector('[class*="icon"]');
                expect(link).toBeInTheDocument();
                expect(icon).toBeInTheDocument();
                expect(screen.queryByText('Hidden text')).not.toBeInTheDocument();
            });

            it('не рендерится как button когда передан to', () => {
                const { container } = renderWithRouter(
                    <Button variant="primary" size="md" to="/test">
                        Link Button
                    </Button>,
                );
                const button = container.querySelector('button');
                expect(button).not.toBeInTheDocument();
            });
        });
    });
});
