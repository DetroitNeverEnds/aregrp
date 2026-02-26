import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
    it('рендерится корректно с базовыми пропсами', () => {
        const onPageChange = vi.fn();
        render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);

        expect(screen.getByLabelText('Предыдущая страница')).toBeInTheDocument();
        expect(screen.getByLabelText('Следующая страница')).toBeInTheDocument();
        expect(screen.getByLabelText('Страница 1')).toBeInTheDocument();
    });

    it('не рендерится, если totalPages <= 1', () => {
        const onPageChange = vi.fn();
        const { container } = render(
            <Pagination currentPage={1} totalPages={1} onPageChange={onPageChange} />,
        );

        expect(container.firstChild).toBeNull();
    });

    it('вызывает onPageChange при клике на номер страницы', async () => {
        const user = userEvent.setup();
        const onPageChange = vi.fn();
        render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);

        const page2Button = screen.getByLabelText('Страница 2');
        await user.click(page2Button);

        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('вызывает onPageChange при клике на кнопку "Вперед"', async () => {
        const user = userEvent.setup();
        const onPageChange = vi.fn();
        render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);

        const nextButton = screen.getByLabelText('Следующая страница');
        await user.click(nextButton);

        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('вызывает onPageChange при клике на кнопку "Назад"', async () => {
        const user = userEvent.setup();
        const onPageChange = vi.fn();
        render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

        const prevButton = screen.getByLabelText('Предыдущая страница');
        await user.click(prevButton);

        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('отключает кнопку "Назад" на первой странице', () => {
        const onPageChange = vi.fn();
        render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);

        const prevButton = screen.getByLabelText('Предыдущая страница');
        expect(prevButton).toBeDisabled();
    });

    it('отключает кнопку "Вперед" на последней странице', () => {
        const onPageChange = vi.fn();
        render(<Pagination currentPage={5} totalPages={5} onPageChange={onPageChange} />);

        const nextButton = screen.getByLabelText('Следующая страница');
        expect(nextButton).toBeDisabled();
    });

    it('отображает многоточие для большого количества страниц', () => {
        const onPageChange = vi.fn();
        render(<Pagination currentPage={1} totalPages={100} onPageChange={onPageChange} />);

        const ellipsis = screen.getAllByText('...');
        expect(ellipsis.length).toBeGreaterThan(0);
    });

    it('выделяет текущую страницу', () => {
        const onPageChange = vi.fn();
        render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

        const currentPage = screen.getByLabelText('Страница 3');
        expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    it('не вызывает onPageChange при клике на текущую страницу', async () => {
        const user = userEvent.setup();
        const onPageChange = vi.fn();
        render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

        const currentPage = screen.getByLabelText('Страница 3');
        await user.click(currentPage);

        expect(onPageChange).not.toHaveBeenCalled();
    });
});
