import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Link } from './Link';
import styles from './Link.module.scss';

describe('Link', () => {
    const renderWithRouter = (ui: React.ReactElement) => {
        return render(<BrowserRouter>{ui}</BrowserRouter>);
    };

    it('рендерится с текстом по умолчанию', () => {
        renderWithRouter(<Link to="/test">Тестовая ссылка</Link>);
        expect(screen.getByText('Тестовая ссылка')).toBeInTheDocument();
    });

    it('применяет правильный путь', () => {
        renderWithRouter(<Link to="/about">О нас</Link>);
        const link = screen.getByText('О нас').closest('a');
        expect(link).toHaveAttribute('href', '/about');
    });

    it('использует size по умолчанию medium', () => {
        renderWithRouter(<Link to="/test">Текст</Link>);
        const link = screen.getByText('Текст').closest('a');
        expect(link).toHaveClass(styles['link--md']);
    });

    it('применяет кастомный size', () => {
        renderWithRouter(
            <Link to="/test" size="large">
                Большой текст
            </Link>,
        );
        expect(screen.getByText('Большой текст')).toBeInTheDocument();
    });

    it('применяет тему blue по умолчанию', () => {
        renderWithRouter(<Link to="/test">Текст</Link>);
        const link = screen.getByText('Текст').closest('a');
        expect(link).toHaveClass(styles['link--blue']);
    });

    it('применяет кастомную тему black', () => {
        renderWithRouter(
            <Link to="/test" theme="black">
                Черная ссылка
            </Link>,
        );
        const link = screen.getByText('Черная ссылка').closest('a');
        expect(link).toHaveClass(styles['link--black']);
    });

    it('применяет дополнительный className', () => {
        renderWithRouter(
            <Link to="/test" className="custom-class">
                Текст
            </Link>,
        );
        const link = screen.getByText('Текст').closest('a');
        expect(link).toHaveClass('custom-class');
    });

    it('поддерживает children как ReactNode', () => {
        renderWithRouter(
            <Link to="/test">
                <span>Сложный</span> <strong>контент</strong>
            </Link>,
        );
        expect(screen.getByText('Сложный')).toBeInTheDocument();
        expect(screen.getByText('контент')).toBeInTheDocument();
    });

    it('рендерит leadingIcon', () => {
        renderWithRouter(
            <Link to="/test" leadingIcon="settings">
                Настройки
            </Link>,
        );
        const link = screen.getByText('Настройки').closest('a');
        expect(link).toBeInTheDocument();
        // Проверяем наличие иконки через svg элемент
        const icon = link?.querySelector('svg');
        expect(icon).toBeInTheDocument();
    });

    it('рендерит trailingIcon', () => {
        renderWithRouter(
            <Link to="/test" trailingIcon="arrow-narrow-right">
                Далее
            </Link>,
        );
        const link = screen.getByText('Далее').closest('a');
        expect(link).toBeInTheDocument();
        const icon = link?.querySelector('svg');
        expect(icon).toBeInTheDocument();
    });

    it('рендерит обе иконки одновременно', () => {
        renderWithRouter(
            <Link to="/test" leadingIcon="arrow-narrow-left" trailingIcon="arrow-narrow-right">
                Текст
            </Link>,
        );
        const link = screen.getByText('Текст').closest('a');
        expect(link).toBeInTheDocument();
        const icons = link?.querySelectorAll('svg');
        expect(icons).toHaveLength(2);
    });

    it('работает без иконок', () => {
        renderWithRouter(<Link to="/test">Простая ссылка</Link>);
        const link = screen.getByText('Простая ссылка').closest('a');
        expect(link).toBeInTheDocument();
        const icons = link?.querySelectorAll('svg');
        expect(icons).toHaveLength(0);
    });
});
