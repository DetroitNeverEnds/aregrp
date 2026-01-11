import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox, type CheckboxSize } from './Checkbox';
import styles from './Checkbox.module.scss';

describe('Checkbox', () => {
    it('рендерится с label', () => {
        render(<Checkbox size="md" label="Test label" />);
        expect(screen.getByText('Test label')).toBeInTheDocument();
    });

    it('рендерится без label', () => {
        const { container } = render(<Checkbox size="md" />);
        const label = container.querySelector(`.${styles['checkbox-label-text']}`);
        expect(label).not.toBeInTheDocument();
    });

    it('применяет правильные классы для размера', () => {
        const { container } = render(<Checkbox size="lg" />);
        const checkbox = container.querySelector(`.${styles.checkbox}`);
        expect(checkbox?.className).toContain(styles['checkbox--lg']);
    });

    it('обрабатывает изменение состояния', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();

        render(<Checkbox size="md" label="Test" onChange={handleChange} />);

        const input = screen.getByRole('checkbox');
        await user.click(input);
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('не обрабатывает изменение когда disabled', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();

        render(<Checkbox size="md" label="Test" onChange={handleChange} disabled />);

        const input = screen.getByRole('checkbox');
        await user.click(input);
        expect(handleChange).not.toHaveBeenCalled();
    });

    it('применяет disabled атрибут', () => {
        render(<Checkbox size="md" disabled />);
        const input = screen.getByRole('checkbox');
        expect(input).toBeDisabled();
    });

    it('применяет checked состояние', () => {
        render(<Checkbox size="md" checked />);
        const input = screen.getByRole('checkbox');
        expect(input).toBeChecked();
    });

    it('применяет unchecked состояние', () => {
        render(<Checkbox size="md" checked={false} />);
        const input = screen.getByRole('checkbox');
        expect(input).not.toBeChecked();
    });

    it('применяет кастомный className', () => {
        const { container } = render(<Checkbox size="md" className="custom-class" />);
        const checkboxContainer = container.querySelector(`.${styles['checkbox-container']}`);
        expect(checkboxContainer).toHaveClass('custom-class');
    });

    it('отображает иконку check когда checked', () => {
        const { container } = render(<Checkbox size="md" checked />);
        const icon = container.querySelector(`.${styles['checkbox-icon']}`);
        expect(icon).toBeInTheDocument();
    });

    it('не отображает иконку check когда unchecked', () => {
        const { container } = render(<Checkbox size="md" checked={false} />);
        const icon = container.querySelector(`.${styles['checkbox-icon']}`);
        expect(icon).not.toBeInTheDocument();
    });

    it('отображает сообщение об ошибке', () => {
        render(<Checkbox size="md" errorMessage="Error text" />);
        expect(screen.getByText('Error text')).toBeInTheDocument();
    });

    it('не отображает сообщение об ошибке когда errorMessage не передан', () => {
        const { container } = render(<Checkbox size="md" />);
        const error = container.querySelector(`.${styles['checkbox-error']}`);
        expect(error).not.toBeInTheDocument();
    });

    it('применяет класс error когда есть errorMessage', () => {
        const { container } = render(<Checkbox size="md" errorMessage="Error" />);
        const checkbox = container.querySelector(`.${styles.checkbox}`);
        expect(checkbox?.className).toContain(styles['checkbox--error']);
    });

    it('применяет класс checked когда checked=true', () => {
        const { container } = render(<Checkbox size="md" checked />);
        const checkbox = container.querySelector(`.${styles.checkbox}`);
        expect(checkbox?.className).toContain(styles['checkbox--checked']);
    });

    it('применяет класс disabled когда disabled=true', () => {
        const { container } = render(<Checkbox size="md" disabled />);
        const checkbox = container.querySelector(`.${styles.checkbox}`);
        expect(checkbox?.className).toContain(styles['checkbox--disabled']);
    });

    it('рендерит ReactNode как label', () => {
        render(
            <Checkbox
                size="md"
                label={
                    <span data-testid="custom-label">
                        Custom <strong>Label</strong>
                    </span>
                }
            />,
        );
        expect(screen.getByTestId('custom-label')).toBeInTheDocument();
        expect(screen.getByText('Label')).toBeInTheDocument();
    });

    describe('размеры чекбокса', () => {
        it.each([
            ['lg', 'checkbox--lg'],
            ['md', 'checkbox--md'],
            ['sm', 'checkbox--sm'],
        ])('применяет класс для размера %s', (size, expectedClass) => {
            const { container } = render(<Checkbox size={size as CheckboxSize} />);
            const checkbox = container.querySelector(`.${styles.checkbox}`);
            expect(checkbox?.className).toContain(styles[expectedClass]);
        });
    });

    describe('состояния чекбокса', () => {
        it('применяет focus стили', () => {
            render(<Checkbox size="md" />);
            const input = screen.getByRole('checkbox');
            input.focus();
            expect(document.activeElement).toBe(input);
        });

        it('не применяет focus когда disabled', () => {
            render(<Checkbox size="md" disabled />);
            const input = screen.getByRole('checkbox');
            input.focus();
            expect(document.activeElement).not.toBe(input);
        });
    });

    describe('accessibility', () => {
        it('имеет role checkbox', () => {
            render(<Checkbox size="md" />);
            expect(screen.getByRole('checkbox')).toBeInTheDocument();
        });

        it('связывает label с input через клик', async () => {
            const handleChange = vi.fn();
            const user = userEvent.setup();

            render(<Checkbox size="md" label="Click me" onChange={handleChange} />);

            await user.click(screen.getByText('Click me'));
            expect(handleChange).toHaveBeenCalledTimes(1);
        });

        it('поддерживает name атрибут', () => {
            render(<Checkbox size="md" name="test-name" />);
            const input = screen.getByRole('checkbox');
            expect(input).toHaveAttribute('name', 'test-name');
        });

        it('поддерживает id атрибут', () => {
            render(<Checkbox size="md" id="test-id" />);
            const input = screen.getByRole('checkbox');
            expect(input).toHaveAttribute('id', 'test-id');
        });

        it('поддерживает value атрибут', () => {
            render(<Checkbox size="md" value="test-value" />);
            const input = screen.getByRole('checkbox');
            expect(input).toHaveAttribute('value', 'test-value');
        });
    });
});
