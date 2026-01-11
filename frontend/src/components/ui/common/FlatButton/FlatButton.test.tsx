import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlatButton } from './FlatButton';

describe('FlatButton', () => {
    it('рендерится с children', () => {
        render(<FlatButton>Нажми меня</FlatButton>);
        expect(screen.getByRole('button', { name: 'Нажми меня' })).toBeInTheDocument();
    });

    it('вызывает onClick при клике', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();

        render(<FlatButton onClick={handleClick}>Кнопка</FlatButton>);

        await user.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('не вызывает onClick когда disabled', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();

        render(
            <FlatButton onClick={handleClick} disabled>
                Кнопка
            </FlatButton>,
        );

        await user.click(screen.getByRole('button'));
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('применяет дополнительный className', () => {
        render(<FlatButton className="custom-class">Кнопка</FlatButton>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('custom-class');
    });

    it('передает дополнительные props', () => {
        render(
            <FlatButton data-testid="test-button" aria-label="Тестовая кнопка">
                Кнопка
            </FlatButton>,
        );
        const button = screen.getByTestId('test-button');
        expect(button).toHaveAttribute('aria-label', 'Тестовая кнопка');
    });

    it('имеет type="button" по умолчанию', () => {
        render(<FlatButton>Кнопка</FlatButton>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('может иметь type="submit"', () => {
        render(<FlatButton type="submit">Отправить</FlatButton>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
});
