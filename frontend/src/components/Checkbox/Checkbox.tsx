import React, { useMemo, useRef } from 'react';
import styles from './Checkbox.module.scss';
import { Icon, type IconSize } from '../Icon';
import { Text, type TextVariant } from '../Text';

export type CheckboxSize = 'lg' | 'md' | 'sm';

type AdditionalCheckboxProps = {
    /** Размер чекбокса: lg (24px), md (20px), sm (16px) */
    size: CheckboxSize;
    /** Текст или компонент метки рядом с чекбоксом */
    label?: React.ReactNode;
    /** Сообщение об ошибке (при наличии чекбокс становится в состоянии error) */
    errorMessage?: string;
};

export type CheckboxProps = Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    keyof AdditionalCheckboxProps | 'type'
> &
    AdditionalCheckboxProps;

const ICON_SIZE_MAPPING: Record<CheckboxSize, IconSize> = {
    lg: 24,
    md: 20,
    sm: 16,
};

const TEXT_VARIANT_MAPPING: Record<CheckboxSize, TextVariant> = {
    lg: '16-reg',
    md: '14-reg',
    sm: '12-reg',
};

export const Checkbox: React.FC<CheckboxProps> = ({
    size,
    label,
    errorMessage,
    className = '',
    disabled = false,
    checked = false,
    onChange,
    ...props
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Определяем, есть ли ошибка
    const hasError = Boolean(errorMessage);

    // Размеры иконки в зависимости от размера чекбокса
    const iconSize = useMemo(() => ICON_SIZE_MAPPING[size], [size]);
    const textVariant = useMemo(() => TEXT_VARIANT_MAPPING[size], [size]);

    const containerClassNames = [
        styles['checkbox-container'],
        hasError && styles['checkbox-container--error'],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    const checkboxClassNames = [
        styles.checkbox,
        styles[`checkbox--${size}`],
        checked && styles['checkbox--checked'],
        disabled && styles['checkbox--disabled'],
        hasError && styles['checkbox--error'],
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={containerClassNames}>
            <label className={styles['checkbox-label']}>
                <div className={styles['checkbox-wrapper']}>
                    <input
                        ref={inputRef}
                        type="checkbox"
                        className={styles['checkbox-input']}
                        checked={checked}
                        disabled={disabled}
                        onChange={onChange}
                        {...props}
                    />
                    <div className={checkboxClassNames}>
                        {checked && (
                            <Icon
                                name="check"
                                size={iconSize}
                                className={styles['checkbox-icon']}
                            />
                        )}
                    </div>
                </div>
                {label && <Text variant={textVariant}>{label}</Text>}
            </label>

            {errorMessage && <Text variant="12-reg">{errorMessage}</Text>}
        </div>
    );
};

export default Checkbox;
