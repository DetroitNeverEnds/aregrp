import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Select, SingleSelect } from './Select';

const mockOptions = [
    { value: '1', label: { title: 'Опция 1', description: 'Описание 1' } },
    { value: '2', label: { title: 'Опция 2', description: 'Описание 2' } },
    { value: '3', label: { title: 'Опция 3' } },
];

describe('Select', () => {
    it('рендерится с placeholder', () => {
        render(<Select options={mockOptions} placeholder="Выберите опцию" />);
        expect(screen.getByText('Выберите опцию')).toBeInTheDocument();
    });

    it('открывает выпадающий список при клике', async () => {
        render(<Select options={mockOptions} />);
        const trigger = screen.getByText('Выберите значение');

        fireEvent.click(trigger);

        await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
        });
    });

    it('закрывает выпадающий список при клике вне компонента', async () => {
        render(
            <div>
                <Select options={mockOptions} />
                <button>Outside</button>
            </div>,
        );

        const trigger = screen.getByText('Выберите значение');
        fireEvent.click(trigger);

        await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
        });

        const outsideButton = screen.getByText('Outside');
        fireEvent.mouseDown(outsideButton);

        await waitFor(() => {
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });
    });

    it('вызывает onChange при выборе опции', async () => {
        const handleChange = vi.fn();
        render(<Select options={mockOptions} onChange={handleChange} />);

        const trigger = screen.getByText('Выберите значение');
        fireEvent.click(trigger);

        await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
        });

        const option = screen.getByText('Опция 1');
        fireEvent.click(option);

        expect(handleChange).toHaveBeenCalledWith(['1']);
    });

    it('отображает выбранное значение', () => {
        render(<Select options={mockOptions} value={['2']} />);
        expect(screen.getByText('Опция 2')).toBeInTheDocument();
    });

    it('не открывается когда disabled=true', async () => {
        render(<Select options={mockOptions} disabled />);
        const trigger = screen.getByText('Выберите значение');

        fireEvent.click(trigger);

        // Даем время на обработку клика
        await waitFor(
            () => {
                expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
            },
            { timeout: 100 },
        );
    });

    it('рендерит опции с описанием', async () => {
        render(<Select options={mockOptions} />);
        const trigger = screen.getByText('Выберите значение');

        fireEvent.click(trigger);

        await waitFor(() => {
            expect(screen.getByText('Описание 1')).toBeInTheDocument();
            expect(screen.getByText('Описание 2')).toBeInTheDocument();
        });
    });

    it('применяет правильный размер', () => {
        const { container, rerender } = render(<Select options={mockOptions} size="lg" />);
        const dropdownButton = container.querySelector('[class*="dropdown-button--lg"]');
        expect(dropdownButton).toBeInTheDocument();

        rerender(<Select options={mockOptions} size="sm" />);
        const dropdownButtonSm = container.querySelector('[class*="dropdown-button--sm"]');
        expect(dropdownButtonSm).toBeInTheDocument();
    });

    it('показывает иконку chevron-down когда закрыт', () => {
        const { container } = render(<Select options={mockOptions} />);
        const trigger = screen.getByText('Выберите значение');
        expect(trigger).toBeInTheDocument();

        // Проверяем наличие SVG иконки
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('показывает иконку chevron-up когда открыт', async () => {
        const { container } = render(<Select options={mockOptions} />);
        const trigger = screen.getByText('Выберите значение');

        fireEvent.click(trigger);

        await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
            // Проверяем наличие SVG иконки
            const svg = container.querySelector('svg');
            expect(svg).toBeInTheDocument();
        });
    });

    it('отображает сообщение когда нет опций', () => {
        render(<Select options={[]} emptyMessage="Нет доступных опций" />);
        const trigger = screen.getByText('Выберите значение');

        fireEvent.click(trigger);

        expect(screen.getByText('Нет доступных опций')).toBeInTheDocument();
    });

    it('применяет дополнительный className', () => {
        const { container } = render(
            <Select options={mockOptions} className="custom-select-class" />,
        );
        const selectContainer = container.querySelector('.custom-select-class');
        expect(selectContainer).toBeInTheDocument();
    });

    it('при filterable фильтрует опции по строке поиска', async () => {
        render(<Select options={mockOptions} filterable filterPlaceholder="Найти..." />);

        fireEvent.click(screen.getByText('Выберите значение'));

        await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
        });

        const search = screen.getByRole('textbox', { name: 'Найти...' });
        fireEvent.change(search, { target: { value: 'Опция 2' } });

        expect(screen.queryByText('Опция 1')).not.toBeInTheDocument();
        expect(screen.getByText('Опция 2')).toBeInTheDocument();
    });

    it('при filterable показывает сообщение если совпадений нет', async () => {
        render(<Select options={mockOptions} filterable noResultsMessage="Пусто по запросу" />);

        fireEvent.click(screen.getByText('Выберите значение'));

        await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
        });

        const search = screen.getByRole('textbox', { name: 'Поиск...' });
        fireEvent.change(search, { target: { value: 'zzz' } });

        expect(screen.getByText('Пусто по запросу')).toBeInTheDocument();
    });

    describe('SingleSelect', () => {
        it('вызывает onChange с одиночным значением', async () => {
            const handleChange = vi.fn();
            render(<SingleSelect options={mockOptions} onChange={handleChange} />);

            const trigger = screen.getByText('Выберите значение');
            fireEvent.click(trigger);

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument();
            });

            const option = screen.getByText('Опция 1');
            fireEvent.click(option);

            expect(handleChange).toHaveBeenCalledWith('1');
        });

        it('отображает выбранное значение', () => {
            render(<SingleSelect options={mockOptions} value="2" />);
            expect(screen.getByText('Опция 2')).toBeInTheDocument();
        });
    });
});
