import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
    it('рендерится с дефолтными пропсами', () => {
        render(<Spinner />);
        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();
    });

    it('применяет правильный размер', () => {
        const { container } = render(<Spinner size="lg" />);
        const spinner = container.querySelector('svg');
        // Проверяем, что класс размера применен (CSS модули добавляют хеш)
        const classAttr = spinner?.getAttribute('class') || '';
        expect(classAttr).toContain('spinner--lg');
    });

    it('применяет кастомный className', () => {
        const { container } = render(<Spinner className="custom-class" />);
        const spinner = container.querySelector('svg');
        expect(spinner).toHaveClass('custom-class');
    });

    it('применяет кастомный цвет', () => {
        const { container } = render(<Spinner color="#ff0000" />);
        const spinner = container.querySelector('svg');
        expect(spinner).toHaveStyle({ color: '#ff0000' });
    });

    it('использует кастомный aria-label', () => {
        render(<Spinner aria-label="Загружаем данные" />);
        const spinner = screen.getByLabelText('Загружаем данные');
        expect(spinner).toBeInTheDocument();
    });
});
