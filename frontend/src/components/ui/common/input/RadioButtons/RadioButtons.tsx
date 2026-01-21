import React, { useMemo, useCallback } from 'react';
import classNames from 'classnames';
import styles from './RadioButtons.module.scss';
import { Text, type TextVariant } from '../../Text';

export type RadioButtonSize = 'lg' | 'md' | 'sm';
export type RadioButtonDirection = 'vertical' | 'horizontal';

export interface RadioButtonOption {
    /** Значение опции */
    value: string;
    /** Метка опции (текст или React компонент) */
    label: React.ReactNode;
    /** Отключена ли конкретная опция */
    disabled?: boolean;
}

type AdditionalRadioButtonsProps = {
    /** Размер радио-кнопок: lg (24px), md (20px), sm (16px) */
    size: RadioButtonSize;
    /** Массив опций для выбора */
    options: RadioButtonOption[];
    /** Сообщение об ошибке (при наличии компонент становится в состоянии error) */
    errorMessage?: string;
    /** Направление расположения кнопок */
    direction?: RadioButtonDirection;
    /** Выбранное значение */
    value: string;
    /** Обработчик изменения значения */
    onChange: (value: string) => void;
    /** Имя группы радио-кнопок */
    name?: string;
    /** Отключить весь компонент */
    disabled?: boolean;
    /** Дополнительный CSS класс */
    className?: string;
};

export type RadioButtonsProps = AdditionalRadioButtonsProps;

const TEXT_VARIANT_MAPPING: Record<RadioButtonSize, TextVariant> = {
    lg: '16-reg',
    md: '14-reg',
    sm: '12-reg',
};

export const RadioButtons: React.FC<RadioButtonsProps> = ({
    size,
    options,
    errorMessage,
    direction = 'vertical',
    value,
    onChange,
    name,
    disabled = false,
    className = '',
}) => {
    // Определяем, есть ли ошибка
    const hasError = useMemo(() => Boolean(errorMessage), [errorMessage]);

    // Размер текста в зависимости от размера радио-кнопки
    const textVariant = useMemo(() => TEXT_VARIANT_MAPPING[size], [size]);

    // Обработчик изменения для конкретной опции
    const handleChange = useCallback(
        (optionValue: string) => {
            if (!disabled) {
                onChange(optionValue);
            }
        },
        [disabled, onChange],
    );

    // Обработчик клавиатурной навигации
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent, optionValue: string, isDisabled: boolean) => {
            if (isDisabled || disabled) return;

            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleChange(optionValue);
            }
        },
        [disabled, handleChange],
    );

    const containerClassNames = classNames(
        styles['radio-buttons-container'],
        {
            [styles['radio-buttons-container--error']]: hasError,
        },
        className,
    );

    const groupClassNames = classNames(
        styles['radio-buttons-group'],
        styles[`radio-buttons-group--${direction}`],
    );

    return (
        <div className={containerClassNames}>
            <div className={groupClassNames} role="radiogroup">
                {options.map(option => {
                    const isChecked = value === option.value;
                    const isDisabled = disabled || option.disabled;

                    const radioClassNames = classNames(styles.radio, styles[`radio--${size}`], {
                        [styles['radio--checked']]: isChecked,
                        [styles['radio--disabled']]: isDisabled,
                        [styles['radio--error']]: hasError,
                    });

                    const labelClassNames = classNames(styles['radio-label'], {
                        [styles['radio-label--disabled']]: isDisabled,
                    });

                    return (
                        <label key={option.value} className={labelClassNames}>
                            <div className={styles['radio-wrapper']}>
                                <input
                                    type="radio"
                                    className={styles['radio-input']}
                                    name={name}
                                    value={option.value}
                                    checked={isChecked}
                                    disabled={isDisabled}
                                    onChange={() => handleChange(option.value)}
                                    onKeyDown={e =>
                                        handleKeyDown(e, option.value, Boolean(isDisabled))
                                    }
                                    aria-checked={isChecked}
                                />
                                <div className={radioClassNames}>
                                    {isChecked && <div className={styles['radio-inner-circle']} />}
                                </div>
                            </div>
                            {option.label && <Text variant={textVariant}>{option.label}</Text>}
                        </label>
                    );
                })}
            </div>

            {errorMessage && (
                <Text variant="12-reg" color="error-default">
                    {errorMessage}
                </Text>
            )}
        </div>
    );
};

export default RadioButtons;
