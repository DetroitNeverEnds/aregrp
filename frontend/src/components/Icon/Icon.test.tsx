import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Icon, type IconSize } from './Icon';
import type { IconName } from './iconConfig';

describe('Icon', () => {
    it('рендерится с указанной иконкой', () => {
        const { container } = render(<Icon name="check" />);
        const icon = container.querySelector('.icon');
        expect(icon).toBeInTheDocument();
        expect(icon?.querySelector('svg')).toBeInTheDocument();
    });

    it('применяет правильный размер по умолчанию', () => {
        const { container } = render(<Icon name="search" />);
        const icon = container.querySelector('.icon');
        expect(icon).toHaveClass('icon--size-24');
    });

    it('применяет кастомный размер', () => {
        const { container } = render(<Icon name="search" size={16} />);
        const icon = container.querySelector('.icon');
        expect(icon).toHaveClass('icon--size-16');
    });

    it('применяет кастомный цвет через style', () => {
        const { container } = render(<Icon name="check" color="#ff0000" />);
        const icon = container.querySelector('.icon');
        expect(icon).toHaveStyle({ color: '#ff0000' });
    });

    it('применяет кастомный className', () => {
        const { container } = render(<Icon name="check" className="custom-class" />);
        const icon = container.querySelector('.icon');
        expect(icon).toHaveClass('custom-class');
    });

    it('применяет кастомные style пропсы', () => {
        const { container } = render(<Icon name="check" style={{ opacity: 0.5 }} />);
        const icon = container.querySelector('.icon');
        expect(icon).toHaveStyle({ opacity: '0.5' });
    });

    it('возвращает null для несуществующей иконки', () => {
        const { container } = render(<Icon name={'non-existent' as IconName} />);
        expect(container.firstChild).toBeNull();
    });

    describe('размеры иконок', () => {
        it.each([
            [16, 'icon--size-16'],
            [20, 'icon--size-20'],
            [24, 'icon--size-24'],
            [32, 'icon--size-32'],
        ])('применяет класс для размера %s', (size, expectedClass) => {
            const { container } = render(<Icon name="check" size={size as IconSize} />);
            const icon = container.querySelector('.icon');
            expect(icon).toHaveClass(expectedClass);
        });
    });

    describe('различные иконки', () => {
        it.each(['check', 'search', 'menu', 'x-close', 'chevron-down', 'arrow-narrow-right'])(
            'рендерит иконку %s',
            iconName => {
                const { container } = render(<Icon name={iconName as IconName} />);
                const icon = container.querySelector('.icon');
                expect(icon).toBeInTheDocument();
                expect(icon?.querySelector('svg')).toBeInTheDocument();
            },
        );
    });

    describe('цвета иконок', () => {
        it('применяет цвет из переменных SCSS', () => {
            const { container } = render(<Icon name="check" color="var(--primary-600)" />);
            const icon = container.querySelector('.icon');
            expect(icon).toHaveStyle({ color: 'var(--primary-600)' });
        });

        it('применяет hex цвет', () => {
            const { container } = render(<Icon name="check" color="#48768f" />);
            const icon = container.querySelector('.icon');
            expect(icon).toHaveStyle({ color: '#48768f' });
        });

        it('применяет rgb цвет', () => {
            const { container } = render(<Icon name="check" color="rgb(72, 118, 143)" />);
            const icon = container.querySelector('.icon');
            expect(icon).toHaveStyle({ color: 'rgb(72, 118, 143)' });
        });
    });

    describe('SVG атрибуты', () => {
        it('передает дополнительные SVG пропсы', () => {
            const { container } = render(
                <Icon name="check" data-testid="custom-icon" aria-label="Check icon" />,
            );
            const icon = container.querySelector('.icon');
            expect(icon).toBeInTheDocument();
        });
    });
});
