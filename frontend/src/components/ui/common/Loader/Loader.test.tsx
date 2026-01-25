import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loader } from './Loader';

describe('Loader', () => {
    it('рендерится с дефолтными пропсами', () => {
        render(<Loader />);
        const loader = screen.getByRole('status');
        expect(loader).toBeInTheDocument();
    });

    it('отображает текст, если передан', () => {
        render(<Loader text="Загрузка данных..." />);
        expect(screen.getByText('Загрузка данных...')).toBeInTheDocument();
    });

    it('не отображает текст, если не передан', () => {
        const { container } = render(<Loader />);
        const text = container.querySelector('.loader__text');
        expect(text).not.toBeInTheDocument();
    });

    it('применяет кастомный className', () => {
        const { container } = render(<Loader className="custom-loader" />);
        const loader = container.querySelector('.custom-loader');
        expect(loader).toBeInTheDocument();
    });

    it('передает размер спиннера', () => {
        const { container } = render(<Loader spinnerSize="sm" />);
        const spinner = container.querySelector('.spinner--sm');
        expect(spinner).toBeInTheDocument();
    });

    it('передает цвет спиннера', () => {
        const { container } = render(<Loader spinnerColor="#ff0000" />);
        const spinner = container.querySelector('svg');
        expect(spinner).toHaveStyle({ color: '#ff0000' });
    });
});
