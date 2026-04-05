import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loader } from './Loader';
import styles from './Loader.module.scss';

describe('Loader', () => {
    it('рендерится с дефолтными пропсами', () => {
        const { container } = render(<Loader />);
        const loader = container.querySelector(`.${styles.loader}`);
        expect(loader).toBeInTheDocument();
    });

    it('по умолчанию использует вариант block', () => {
        const { container } = render(<Loader />);
        const loader = container.querySelector(`.${styles['loader--block']}`);
        expect(loader).toBeInTheDocument();
    });

    it('применяет вариант overlay', () => {
        const { container } = render(<Loader variant="overlay" />);
        const loader = container.querySelector(`.${styles['loader--overlay']}`);
        expect(loader).toBeInTheDocument();
    });

    it('применяет кастомную высоту для варианта block', () => {
        const { container } = render(<Loader variant="block" height={400} />);
        const loader = container.querySelector(`.${styles.loader}`);
        expect(loader).toHaveStyle({ height: '400px' });
    });

    it('не применяет высоту для варианта overlay', () => {
        const { container } = render(<Loader variant="overlay" height={400} />);
        const loader = container.querySelector(`.${styles.loader}`);
        expect(loader).not.toHaveStyle({ height: '400px' });
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
        const spinner = container.querySelector('svg');
        expect(spinner).toBeInTheDocument();
        // Проверяем, что класс размера применен (CSS модули добавляют хеш)
        const classAttr = spinner?.getAttribute('class') || '';
        expect(classAttr).toContain('spinner--sm');
    });

    it('передает цвет спиннера', () => {
        const { container } = render(<Loader spinnerColor="#ff0000" />);
        const spinner = container.querySelector('svg');
        expect(spinner).toHaveStyle({ color: '#ff0000' });
    });
});
