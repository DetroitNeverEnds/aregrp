import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from './Switch';

describe('Switch', () => {
    const defaultOptions = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
    ] as [{ value: string; label: string }, { value: string; label: string }];

    it('рендерит компонент с двумя опциями', () => {
        render(<Switch options={defaultOptions} value="option1" />);

        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('вызывает onChange при клике на неактивную опцию', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();

        render(<Switch options={defaultOptions} value="option1" onChange={handleChange} />);

        const button2 = screen.getByRole('radio', { name: /Option 2/i });
        await user.click(button2);

        expect(handleChange).toHaveBeenCalledWith('option2');
    });

    it('не вызывает onChange при клике на активную опцию', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();

        render(<Switch options={defaultOptions} value="option1" onChange={handleChange} />);

        const button1 = screen.getByRole('radio', { name: /Option 1/i });
        await user.click(button1);

        expect(handleChange).not.toHaveBeenCalled();
    });

    it('не вызывает onChange когда disabled', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();

        render(
            <Switch options={defaultOptions} value="option1" onChange={handleChange} disabled />,
        );

        const button2 = screen.getByRole('radio', { name: /Option 2/i });
        await user.click(button2);

        expect(handleChange).not.toHaveBeenCalled();
    });

    it('поддерживает навигацию с клавиатуры (Enter)', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();

        render(<Switch options={defaultOptions} value="option1" onChange={handleChange} />);

        const button2 = screen.getByRole('radio', { name: /Option 2/i });
        button2.focus();
        await user.keyboard('{Enter}');

        expect(handleChange).toHaveBeenCalledWith('option2');
    });

    it('поддерживает навигацию с клавиатуры (Space)', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();

        render(<Switch options={defaultOptions} value="option1" onChange={handleChange} />);

        const button2 = screen.getByRole('radio', { name: /Option 2/i });
        button2.focus();
        await user.keyboard(' ');

        expect(handleChange).toHaveBeenCalledWith('option2');
    });

    it('применяет дополнительный className', () => {
        const { container } = render(
            <Switch options={defaultOptions} value="option1" className="custom-class" />,
        );

        const switchContainer = container.firstChild;
        expect(switchContainer).toHaveClass('custom-class');
    });

    it('отключает кнопки когда disabled', () => {
        render(<Switch options={defaultOptions} value="option1" disabled />);

        const button1 = screen.getByRole('radio', { name: /Option 1/i });
        const button2 = screen.getByRole('radio', { name: /Option 2/i });

        expect(button1).toBeDisabled();
        expect(button2).toBeDisabled();
    });
});
