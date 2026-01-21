import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioButtons, type RadioButtonSize, type RadioButtonDirection } from './RadioButtons';
import styles from './RadioButtons.module.scss';

describe('RadioButtons', () => {
    const defaultOptions = [
        { value: 'option1', label: 'Опция 1' },
        { value: 'option2', label: 'Опция 2' },
        { value: 'option3', label: 'Опция 3' },
    ];

    it('рендерится с опциями', () => {
        render(
            <RadioButtons size="md" options={defaultOptions} value="option1" onChange={() => {}} />,
        );
        expect(screen.getByText('Опция 1')).toBeInTheDocument();
        expect(screen.getByText('Опция 2')).toBeInTheDocument();
        expect(screen.getByText('Опция 3')).toBeInTheDocument();
    });

    it('применяет правильные классы для размера', () => {
        const { container } = render(
            <RadioButtons size="lg" options={defaultOptions} value="option1" onChange={() => {}} />,
        );
        const radio = container.querySelector(`.${styles.radio}`);
        expect(radio?.className).toContain(styles['radio--lg']);
    });

    it('обрабатывает выбор опции кликом', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();

        render(
            <RadioButtons
                size="md"
                options={defaultOptions}
                value="option1"
                onChange={handleChange}
            />,
        );

        const option2 = screen.getByLabelText('Опция 2');
        await user.click(option2);
        expect(handleChange).toHaveBeenCalledWith('option2');
    });

    it('обрабатывает событие onChange', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();

        render(
            <RadioButtons
                size="md"
                options={defaultOptions}
                value="option1"
                onChange={handleChange}
            />,
        );

        const option3 = screen.getByLabelText('Опция 3');
        await user.click(option3);
        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenCalledWith('option3');
    });

    it('отображает сообщение об ошибке', () => {
        render(
            <RadioButtons
                size="md"
                options={defaultOptions}
                value="option1"
                onChange={() => {}}
                errorMessage="Пожалуйста, выберите опцию"
            />,
        );
        expect(screen.getByText('Пожалуйста, выберите опцию')).toBeInTheDocument();
    });

    it('применяет класс error при наличии errorMessage', () => {
        const { container } = render(
            <RadioButtons
                size="md"
                options={defaultOptions}
                value="option1"
                onChange={() => {}}
                errorMessage="Ошибка"
            />,
        );
        const radioContainer = container.querySelector(`.${styles['radio-buttons-container']}`);
        expect(radioContainer?.className).toContain(styles['radio-buttons-container--error']);
    });

    it('не обрабатывает клик когда весь компонент disabled', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();

        render(
            <RadioButtons
                size="md"
                options={defaultOptions}
                value="option1"
                onChange={handleChange}
                disabled
            />,
        );

        const option2 = screen.getByLabelText('Опция 2');
        await user.click(option2);
        expect(handleChange).not.toHaveBeenCalled();
    });

    it('применяет disabled атрибут на все опции когда disabled=true', () => {
        render(
            <RadioButtons
                size="md"
                options={defaultOptions}
                value="option1"
                onChange={() => {}}
                disabled
            />,
        );

        const inputs = screen.getAllByRole('radio');
        inputs.forEach(input => {
            expect(input).toBeDisabled();
        });
    });

    it('применяет disabled на конкретную опцию', () => {
        const optionsWithDisabled = [
            { value: 'option1', label: 'Опция 1' },
            { value: 'option2', label: 'Опция 2', disabled: true },
            { value: 'option3', label: 'Опция 3' },
        ];

        render(
            <RadioButtons
                size="md"
                options={optionsWithDisabled}
                value="option1"
                onChange={() => {}}
            />,
        );

        const option2 = screen.getByLabelText('Опция 2');
        expect(option2).toBeDisabled();
    });

    it('не обрабатывает клик на отключенную опцию', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();

        const optionsWithDisabled = [
            { value: 'option1', label: 'Опция 1' },
            { value: 'option2', label: 'Опция 2', disabled: true },
            { value: 'option3', label: 'Опция 3' },
        ];

        render(
            <RadioButtons
                size="md"
                options={optionsWithDisabled}
                value="option1"
                onChange={handleChange}
            />,
        );

        const option2 = screen.getByLabelText('Опция 2');
        await user.click(option2);
        expect(handleChange).not.toHaveBeenCalled();
    });

    it('применяет кастомный className', () => {
        const { container } = render(
            <RadioButtons
                size="md"
                options={defaultOptions}
                value="option1"
                onChange={() => {}}
                className="custom-class"
            />,
        );
        const radioContainer = container.querySelector(`.${styles['radio-buttons-container']}`);
        expect(radioContainer).toHaveClass('custom-class');
    });

    it('применяет класс checked на выбранную опцию', () => {
        const { container } = render(
            <RadioButtons size="md" options={defaultOptions} value="option2" onChange={() => {}} />,
        );

        const radios = container.querySelectorAll(`.${styles.radio}`);
        expect(radios[1]?.className).toContain(styles['radio--checked']);
    });

    it('отображает внутренний круг на выбранной опции', () => {
        const { container } = render(
            <RadioButtons size="md" options={defaultOptions} value="option1" onChange={() => {}} />,
        );

        const innerCircle = container.querySelector(`.${styles['radio-inner-circle']}`);
        expect(innerCircle).toBeInTheDocument();
    });

    it('не отображает внутренний круг на невыбранных опциях', () => {
        const { container } = render(
            <RadioButtons size="md" options={defaultOptions} value="option1" onChange={() => {}} />,
        );

        const innerCircles = container.querySelectorAll(`.${styles['radio-inner-circle']}`);
        expect(innerCircles).toHaveLength(1);
    });

    describe('accessibility', () => {
        it('имеет role radiogroup', () => {
            render(
                <RadioButtons
                    size="md"
                    options={defaultOptions}
                    value="option1"
                    onChange={() => {}}
                />,
            );
            expect(screen.getByRole('radiogroup')).toBeInTheDocument();
        });

        it('каждая опция имеет role radio', () => {
            render(
                <RadioButtons
                    size="md"
                    options={defaultOptions}
                    value="option1"
                    onChange={() => {}}
                />,
            );
            const radios = screen.getAllByRole('radio');
            expect(radios).toHaveLength(3);
        });

        it('применяет aria-checked на выбранную опцию', () => {
            render(
                <RadioButtons
                    size="md"
                    options={defaultOptions}
                    value="option2"
                    onChange={() => {}}
                />,
            );

            const option2 = screen.getByLabelText('Опция 2');
            expect(option2).toHaveAttribute('aria-checked', 'true');
        });

        it('применяет aria-checked=false на невыбранные опции', () => {
            render(
                <RadioButtons
                    size="md"
                    options={defaultOptions}
                    value="option2"
                    onChange={() => {}}
                />,
            );

            const option1 = screen.getByLabelText('Опция 1');
            const option3 = screen.getByLabelText('Опция 3');
            expect(option1).toHaveAttribute('aria-checked', 'false');
            expect(option3).toHaveAttribute('aria-checked', 'false');
        });

        it('поддерживает name атрибут', () => {
            render(
                <RadioButtons
                    size="md"
                    options={defaultOptions}
                    value="option1"
                    onChange={() => {}}
                    name="test-group"
                />,
            );

            const radios = screen.getAllByRole('radio');
            radios.forEach(radio => {
                expect(radio).toHaveAttribute('name', 'test-group');
            });
        });
    });

    describe('клавиатурная навигация', () => {
        it('обрабатывает нажатие Space', async () => {
            const handleChange = vi.fn();
            const user = userEvent.setup();

            render(
                <RadioButtons
                    size="md"
                    options={defaultOptions}
                    value="option1"
                    onChange={handleChange}
                />,
            );

            const option2 = screen.getByLabelText('Опция 2');
            option2.focus();
            await user.keyboard(' ');
            expect(handleChange).toHaveBeenCalledWith('option2');
        });

        it('обрабатывает нажатие Enter', async () => {
            const handleChange = vi.fn();
            const user = userEvent.setup();

            render(
                <RadioButtons
                    size="md"
                    options={defaultOptions}
                    value="option1"
                    onChange={handleChange}
                />,
            );

            const option3 = screen.getByLabelText('Опция 3');
            option3.focus();
            await user.keyboard('{Enter}');
            expect(handleChange).toHaveBeenCalledWith('option3');
        });

        it('не обрабатывает Space когда disabled', async () => {
            const handleChange = vi.fn();
            const user = userEvent.setup();

            render(
                <RadioButtons
                    size="md"
                    options={defaultOptions}
                    value="option1"
                    onChange={handleChange}
                    disabled
                />,
            );

            const option2 = screen.getByLabelText('Опция 2');
            option2.focus();
            await user.keyboard(' ');
            expect(handleChange).not.toHaveBeenCalled();
        });

        it('не обрабатывает Enter когда опция disabled', async () => {
            const handleChange = vi.fn();
            const user = userEvent.setup();

            const optionsWithDisabled = [
                { value: 'option1', label: 'Опция 1' },
                { value: 'option2', label: 'Опция 2', disabled: true },
                { value: 'option3', label: 'Опция 3' },
            ];

            render(
                <RadioButtons
                    size="md"
                    options={optionsWithDisabled}
                    value="option1"
                    onChange={handleChange}
                />,
            );

            const option2 = screen.getByLabelText('Опция 2');
            option2.focus();
            await user.keyboard('{Enter}');
            expect(handleChange).not.toHaveBeenCalled();
        });
    });

    describe('размеры компонента', () => {
        it.each([
            ['lg', 'radio--lg'],
            ['md', 'radio--md'],
            ['sm', 'radio--sm'],
        ])('применяет класс для размера %s', (size, expectedClass) => {
            const { container } = render(
                <RadioButtons
                    size={size as RadioButtonSize}
                    options={defaultOptions}
                    value="option1"
                    onChange={() => {}}
                />,
            );
            const radio = container.querySelector(`.${styles.radio}`);
            expect(radio?.className).toContain(styles[expectedClass]);
        });
    });

    describe('направления', () => {
        it.each([
            ['vertical', 'radio-buttons-group--vertical'],
            ['horizontal', 'radio-buttons-group--horizontal'],
        ])('применяет класс для направления %s', (direction, expectedClass) => {
            const { container } = render(
                <RadioButtons
                    size="md"
                    options={defaultOptions}
                    value="option1"
                    onChange={() => {}}
                    direction={direction as RadioButtonDirection}
                />,
            );
            const group = container.querySelector(`.${styles['radio-buttons-group']}`);
            expect(group?.className).toContain(styles[expectedClass]);
        });

        it('использует vertical по умолчанию', () => {
            const { container } = render(
                <RadioButtons
                    size="md"
                    options={defaultOptions}
                    value="option1"
                    onChange={() => {}}
                />,
            );
            const group = container.querySelector(`.${styles['radio-buttons-group']}`);
            expect(group?.className).toContain(styles['radio-buttons-group--vertical']);
        });
    });

    describe('кастомные метки', () => {
        it('рендерит ReactNode как label', () => {
            const customOptions = [
                {
                    value: 'option1',
                    label: (
                        <span data-testid="custom-label">
                            <strong>Важная</strong> опция
                        </span>
                    ),
                },
            ];

            render(
                <RadioButtons
                    size="md"
                    options={customOptions}
                    value="option1"
                    onChange={() => {}}
                />,
            );

            expect(screen.getByTestId('custom-label')).toBeInTheDocument();
            expect(screen.getByText('Важная')).toBeInTheDocument();
        });
    });

    describe('состояния фокуса', () => {
        it('применяет focus на опцию', () => {
            render(
                <RadioButtons
                    size="md"
                    options={defaultOptions}
                    value="option1"
                    onChange={() => {}}
                />,
            );

            const option1 = screen.getByLabelText('Опция 1');
            option1.focus();
            expect(document.activeElement).toBe(option1);
        });

        it('не применяет focus когда disabled', () => {
            render(
                <RadioButtons
                    size="md"
                    options={defaultOptions}
                    value="option1"
                    onChange={() => {}}
                    disabled
                />,
            );

            const option1 = screen.getByLabelText('Опция 1');
            option1.focus();
            expect(document.activeElement).not.toBe(option1);
        });
    });

    describe('checked состояние', () => {
        it('применяет checked на input элемент', () => {
            render(
                <RadioButtons
                    size="md"
                    options={defaultOptions}
                    value="option2"
                    onChange={() => {}}
                />,
            );

            const option2 = screen.getByLabelText('Опция 2');
            expect(option2).toBeChecked();
        });

        it('не применяет checked на невыбранные опции', () => {
            render(
                <RadioButtons
                    size="md"
                    options={defaultOptions}
                    value="option2"
                    onChange={() => {}}
                />,
            );

            const option1 = screen.getByLabelText('Опция 1');
            const option3 = screen.getByLabelText('Опция 3');
            expect(option1).not.toBeChecked();
            expect(option3).not.toBeChecked();
        });
    });
});
