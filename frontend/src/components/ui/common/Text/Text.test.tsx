import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Text } from './Text';
import styles from './Text.module.scss';

describe('Text Component', () => {
    it('рендерит текст', () => {
        render(<Text>Тестовый текст</Text>);
        expect(screen.getByText('Тестовый текст')).toBeInTheDocument();
    });

    it('использует span как базовый тег', () => {
        render(<Text>Текст в span</Text>);
        const element = screen.getByText('Текст в span');
        expect(element.tagName).toBe('SPAN');
    });

    it('применяет вариант h2', () => {
        render(<Text variant="h2">Заголовок H2</Text>);
        const element = screen.getByText('Заголовок H2');
        expect(element.className).toContain(styles['text--h2']);
    });

    it('применяет вариант h3', () => {
        render(<Text variant="h3">Заголовок H3</Text>);
        const element = screen.getByText('Заголовок H3');
        expect(element.className).toContain(styles['text--h3']);
    });

    it('применяет вариант h4', () => {
        render(<Text variant="h4">Заголовок H4</Text>);
        const element = screen.getByText('Заголовок H4');
        expect(element.className).toContain(styles['text--h4']);
    });

    it('применяет вариант h5', () => {
        render(<Text variant="h5">Заголовок H5</Text>);
        const element = screen.getByText('Заголовок H5');
        expect(element.className).toContain(styles['text--h5']);
    });

    it('применяет вариант 12-reg', () => {
        render(<Text variant="12-reg">12px Regular</Text>);
        const element = screen.getByText('12px Regular');
        expect(element.className).toContain(styles['text--12-reg']);
    });

    it('применяет вариант 12-med', () => {
        render(<Text variant="12-med">12px Medium</Text>);
        const element = screen.getByText('12px Medium');
        expect(element.className).toContain(styles['text--12-med']);
    });

    it('применяет вариант 14-reg', () => {
        render(<Text variant="14-reg">14px Regular</Text>);
        const element = screen.getByText('14px Regular');
        expect(element.className).toContain(styles['text--14-reg']);
    });

    it('применяет вариант 14-med', () => {
        render(<Text variant="14-med">14px Medium</Text>);
        const element = screen.getByText('14px Medium');
        expect(element.className).toContain(styles['text--14-med']);
    });

    it('применяет вариант 16-reg по умолчанию', () => {
        render(<Text>Обычный текст</Text>);
        const element = screen.getByText('Обычный текст');
        expect(element.className).toContain(styles['text--16-reg']);
    });

    it('применяет вариант 16-med', () => {
        render(<Text variant="16-med">16px Medium</Text>);
        const element = screen.getByText('16px Medium');
        expect(element.className).toContain(styles['text--16-med']);
    });

    it('применяет вариант 18-reg', () => {
        render(<Text variant="18-reg">18px Regular</Text>);
        const element = screen.getByText('18px Regular');
        expect(element.className).toContain(styles['text--18-reg']);
    });

    it('применяет вариант 18-med', () => {
        render(<Text variant="18-med">18px Medium</Text>);
        const element = screen.getByText('18px Medium');
        expect(element.className).toContain(styles['text--18-med']);
    });

    it('применяет вариант 20-reg', () => {
        render(<Text variant="20-reg">20px Regular</Text>);
        const element = screen.getByText('20px Regular');
        expect(element.className).toContain(styles['text--20-reg']);
    });

    it('применяет вариант 20-med', () => {
        render(<Text variant="20-med">20px Medium</Text>);
        const element = screen.getByText('20px Medium');
        expect(element.className).toContain(styles['text--20-med']);
    });

    it('применяет вариант 24-reg', () => {
        render(<Text variant="24-reg">24px Regular</Text>);
        const element = screen.getByText('24px Regular');
        expect(element.className).toContain(styles['text--24-reg']);
    });

    it('применяет вариант 24-med', () => {
        render(<Text variant="24-med">24px Medium</Text>);
        const element = screen.getByText('24px Medium');
        expect(element.className).toContain(styles['text--24-med']);
    });

    it('применяет дополнительный класс', () => {
        render(<Text className="custom-class">Текст с классом</Text>);
        expect(screen.getByText('Текст с классом').className).toContain('custom-class');
    });

    it('наследует пропсы от HTMLSpanElement', () => {
        render(
            <Text data-testid="test-span" title="Test title">
                Текст с атрибутами
            </Text>,
        );
        const element = screen.getByTestId('test-span');
        expect(element).toHaveAttribute('title', 'Test title');
    });

    it('применяет inline стили', () => {
        render(<Text style={{ color: '#ff0000' }}>Красный текст</Text>);
        const element = screen.getByText('Красный текст');
        expect(element).toHaveStyle({ color: '#ff0000' });
    });

    it('применяет все классы одновременно', () => {
        render(
            <Text variant="20-med" className="extra">
                Комплексный текст
            </Text>,
        );
        const element = screen.getByText('Комплексный текст');
        expect(element.className).toContain(styles.text);
        expect(element.className).toContain(styles['text--20-med']);
        expect(element.className).toContain('extra');
    });

    it('применяет цвет primary-500', () => {
        render(<Text color="primary-500">Текст primary цвета</Text>);
        const element = screen.getByText('Текст primary цвета');
        expect(element.className).toContain(styles['text--color-primary-500']);
    });

    it('применяет цвет error-default', () => {
        render(<Text color="error-default">Текст ошибки</Text>);
        const element = screen.getByText('Текст ошибки');
        expect(element.className).toContain(styles['text--color-error-default']);
    });

    it('применяет все цвета primary', () => {
        const colors = [
            'primary-200',
            'primary-300',
            'primary-400',
            'primary-500',
            'primary-600',
            'primary-700',
            'primary-800',
            'primary-900',
            'primary-1000',
        ] as const;

        colors.forEach(color => {
            const { container } = render(<Text color={color}>Текст {color}</Text>);
            const element = screen.getByText(`Текст ${color}`);
            expect(element.className).toContain(styles[`text--color-${color}`]);
            container.remove();
        });
    });

    it('применяет вариант и цвет одновременно', () => {
        render(
            <Text variant="20-med" color="primary-500" className="extra">
                Комплексный текст с цветом
            </Text>,
        );
        const element = screen.getByText('Комплексный текст с цветом');
        expect(element.className).toContain(styles.text);
        expect(element.className).toContain(styles['text--20-med']);
        expect(element.className).toContain(styles['text--color-primary-500']);
        expect(element.className).toContain('extra');
    });
});
