import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
    it('рендерится с дефолтными пропсами', () => {
        const { container } = render(<Spinner />);
        expect(container.querySelector('svg')).toBeInTheDocument();
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
});
