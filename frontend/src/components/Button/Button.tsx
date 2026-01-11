import React from 'react';
import styles from './Button.module.scss';
import { Icon, type IconName } from '../Icon';

export type ButtonVariant = 'primary' | 'outlined' | 'secondary';
export type ButtonSize = 'lg' | 'md';
export type ButtonWidth = 'auto' | 'max';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Тип кнопки (определяет визуальный стиль) */
    variant: ButtonVariant;
    /** Размер кнопки */
    size: ButtonSize;
    /** Ширина кнопки: auto - по содержимому, max - на всю ширину контейнера */
    width?: ButtonWidth;
    /** Содержимое кнопки (текст и/или иконки) */
    children?: React.ReactNode;
    /** Иконка для отображения в кнопке */
    icon?: IconName;
    /** Показывать только иконку без текста */
    onlyIcon?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    variant,
    size,
    width = 'auto',
    children,
    icon,
    onlyIcon = false,
    className = '',
    disabled = false,
    type = 'button',
    ...props
}) => {
    const classNames = [
        styles.button,
        styles[`button--${variant}`],
        styles[`button--${size}`],
        styles[`button--width-${width}`],
        onlyIcon && styles['button--only-icon'],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    // Автоматически используем children как title, если title не передан явно
    const tooltipTitle = typeof children === 'string' ? children : undefined;

    return (
        <button
            className={classNames}
            disabled={disabled}
            type={type}
            title={tooltipTitle}
            {...props}
        >
            {icon && (
                <Icon
                    name={icon}
                    size={24}
                    aria-hidden={!onlyIcon}
                    className={styles.button__icon}
                />
            )}
            {!onlyIcon && <span className={styles.button__content}>{children}</span>}
        </button>
    );
};

export default Button;
