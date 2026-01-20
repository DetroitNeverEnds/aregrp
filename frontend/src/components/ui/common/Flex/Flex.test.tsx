import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Flex } from './Flex';
import styles from './Flex.module.scss';

describe('Flex', () => {
    it('рендерится с children', () => {
        render(<Flex data-testid="flex">Test content</Flex>);
        const flex = screen.getByTestId('flex');
        expect(flex).toBeInTheDocument();
        expect(flex).toHaveTextContent('Test content');
    });

    it('применяет правильные классы для direction', () => {
        const { rerender } = render(
            <Flex data-testid="flex" direction="column">
                Content
            </Flex>,
        );
        expect(screen.getByTestId('flex')).toHaveClass(styles['flex--direction-column']);

        rerender(
            <Flex data-testid="flex" direction="row-reverse">
                Content
            </Flex>,
        );
        expect(screen.getByTestId('flex')).toHaveClass(styles['flex--direction-row-reverse']);
    });

    it('применяет правильные классы для justify', () => {
        const { rerender } = render(
            <Flex data-testid="flex" justify="center">
                Content
            </Flex>,
        );
        expect(screen.getByTestId('flex')).toHaveClass(styles['flex--justify-center']);

        rerender(
            <Flex data-testid="flex" justify="between">
                Content
            </Flex>,
        );
        expect(screen.getByTestId('flex')).toHaveClass(styles['flex--justify-between']);
    });

    it('применяет правильные классы для align', () => {
        const { rerender } = render(
            <Flex data-testid="flex" align="center">
                Content
            </Flex>,
        );
        expect(screen.getByTestId('flex')).toHaveClass(styles['flex--align-center']);

        rerender(
            <Flex data-testid="flex" align="end">
                Content
            </Flex>,
        );
        expect(screen.getByTestId('flex')).toHaveClass(styles['flex--align-end']);
    });

    it('применяет правильные классы для wrap', () => {
        const { rerender } = render(
            <Flex data-testid="flex" wrap="wrap">
                Content
            </Flex>,
        );
        expect(screen.getByTestId('flex')).toHaveClass(styles['flex--wrap-wrap']);

        rerender(
            <Flex data-testid="flex" wrap="wrap-reverse">
                Content
            </Flex>,
        );
        expect(screen.getByTestId('flex')).toHaveClass(styles['flex--wrap-wrap-reverse']);
    });

    it('применяет gap через style', () => {
        const { rerender } = render(
            <Flex data-testid="flex" gap={16}>
                Content
            </Flex>,
        );
        expect(screen.getByTestId('flex')).toHaveStyle({ gap: '16px' });

        rerender(
            <Flex data-testid="flex" gap="1rem">
                Content
            </Flex>,
        );
        expect(screen.getByTestId('flex')).toHaveStyle({ gap: '1rem' });
    });

    it('применяет класс inline', () => {
        render(
            <Flex data-testid="flex" inline>
                Content
            </Flex>,
        );
        expect(screen.getByTestId('flex')).toHaveClass(styles['flex--inline']);
    });

    it('применяет класс fullWidth', () => {
        render(
            <Flex data-testid="flex" fullWidth>
                Content
            </Flex>,
        );
        expect(screen.getByTestId('flex')).toHaveClass(styles['flex--full-width']);
    });

    it('применяет дополнительный className', () => {
        render(
            <Flex data-testid="flex" className="custom-class">
                Content
            </Flex>,
        );
        expect(screen.getByTestId('flex')).toHaveClass('custom-class');
    });

    it('применяет дополнительные HTML атрибуты', () => {
        render(
            <Flex data-testid="flex" id="test-id" aria-label="test-label">
                Content
            </Flex>,
        );
        const flex = screen.getByTestId('flex');
        expect(flex).toHaveAttribute('id', 'test-id');
        expect(flex).toHaveAttribute('aria-label', 'test-label');
    });

    it('объединяет style пропсы', () => {
        render(
            <Flex data-testid="flex" gap={8} style={{ padding: '10px' }}>
                Content
            </Flex>,
        );
        const flex = screen.getByTestId('flex');
        expect(flex).toHaveStyle({ gap: '8px', padding: '10px' });
    });
});
