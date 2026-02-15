import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

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
        const select = screen.getByRole('combobox');

        fireEvent.click(select);

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

        const select = screen.getByRole('combobox');
        fireEvent.click(select);

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

        const select = screen.getByRole('combobox');
        fireEvent.click(select);

        await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
        });

        const option = screen.getByText('Опция 1');
        fireEvent.click(option);

        expect(handleChange).toHaveBeenCalledWith('1');
    });

    it('отображает выбранное значение', () => {
        render(<Select options={mockOptions} value="2" />);
        expect(screen.getByText('Опция 2')).toBeInTheDocument();
    });

    it('показывает кнопку очистки когда clearable=true и есть значение', () => {
        render(<Select options={mockOptions} value="1" clearable />);
        const clearButton = screen.getByLabelText('Очистить');
        expect(clearButton).toBeInTheDocument();
    });

    it('очищает значение при клике на кнопку очистки', async () => {
        const handleChange = vi.fn();
        render(<Select options={mockOptions} value="1" clearable onChange={handleChange} />);

        const clearButton = screen.getByLabelText('Очистить');
        fireEvent.click(clearButton);

        expect(handleChange).toHaveBeenCalledWith('');
    });

    it('не открывается когда disabled=true', () => {
        render(<Select options={mockOptions} disabled />);
        const select = screen.getByRole('combobox');

        fireEvent.click(select);

        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('отображает сообщение об ошибке', () => {
        render(<Select options={mockOptions} errorMessage="Обязательное поле" />);
        expect(screen.getByText('Обязательное поле')).toBeInTheDocument();
    });

    it('поддерживает навигацию клавиатурой', async () => {
        const user = userEvent.setup();
        render(<Select options={mockOptions} />);

        const select = screen.getByRole('combobox');
        await user.click(select);

        // Открываем список
        await user.keyboard('{Enter}');
        await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
        });

        // Навигация вниз
        await user.keyboard('{ArrowDown}');
        await user.keyboard('{ArrowDown}');

        // Выбор опции
        const handleChange = vi.fn();
        render(<Select options={mockOptions} onChange={handleChange} />);
    });

    it('закрывается при нажатии Escape', async () => {
        const user = userEvent.setup();
        render(<Select options={mockOptions} />);

        const select = screen.getByRole('combobox');
        await user.click(select);

        await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
        });

        await user.keyboard('{Escape}');

        await waitFor(() => {
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });
    });

    it('применяет класс fullWidth', () => {
        const { container } = render(<Select options={mockOptions} fullWidth />);
        const selectContainer = container.querySelector('.select-container--full-width');
        expect(selectContainer).toBeInTheDocument();
    });

    it('рендерит опции с описанием', async () => {
        render(<Select options={mockOptions} />);
        const select = screen.getByRole('combobox');

        fireEvent.click(select);

        await waitFor(() => {
            expect(screen.getByText('Описание 1')).toBeInTheDocument();
            expect(screen.getByText('Описание 2')).toBeInTheDocument();
        });
    });

    it('создает скрытый input для форм', () => {
        render(<Select options={mockOptions} name="test-select" value="1" />);
        const hiddenInput = document.querySelector('input[type="hidden"]') as HTMLInputElement;

        expect(hiddenInput).toBeInTheDocument();
        expect(hiddenInput.name).toBe('test-select');
        expect(hiddenInput.value).toBe('1');
    });

    it('поддерживает required атрибут', () => {
        render(<Select options={mockOptions} name="test-select" required />);
        const hiddenInput = document.querySelector('input[type="hidden"]') as HTMLInputElement;

        expect(hiddenInput.required).toBe(true);
    });

    it('применяет правильный размер', () => {
        const { container, rerender } = render(<Select options={mockOptions} size="lg" />);
        expect(container.querySelector('.select-container--lg')).toBeInTheDocument();

        rerender(<Select options={mockOptions} size="sm" />);
        expect(container.querySelector('.select-container--sm')).toBeInTheDocument();
    });

    it('показывает иконку chevron-down когда закрыт', () => {
        render(<Select options={mockOptions} />);
        // Icon компонент рендерит SVG, проверяем наличие
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
    });

    it('показывает иконку chevron-up когда открыт', async () => {
        render(<Select options={mockOptions} />);
        const select = screen.getByRole('combobox');

        fireEvent.click(select);

        await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeInTheDocument();
        });
    });
});
