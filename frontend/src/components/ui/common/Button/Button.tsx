import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import styles from './Button.module.scss';
import { Icon, type IconName } from '../Icon';

export type ButtonVariant = 'primary' | 'outlined' | 'secondary';
export type ButtonSize = 'lg' | 'md';
export type ButtonWidth = 'auto' | 'max';

interface BaseButtonProps {
    /** Тип кнопки (определяет визуальный стиль) */
    variant?: ButtonVariant;
    /** Размер кнопки */
    size?: ButtonSize;
    /** Ширина кнопки: auto - по содержимому, max - на всю ширину контейнера */
    width?: ButtonWidth;
    /** Содержимое кнопки (текст и/или иконки) */
    children?: React.ReactNode;
    /** Иконка для отображения в кнопке */
    icon?: IconName;
    /** Показывать только иконку без текста */
    onlyIcon?: boolean;
    /** Дополнительные CSS классы */
    className?: string;
}

type ButtonAsButton = BaseButtonProps &
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
        /** Ссылка для перехода (если указана, рендерится Link вместо button) */
        to?: never;
    };

type ButtonAsLink = BaseButtonProps &
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
        /** Ссылка для перехода (если указана, рендерится Link вместо button) */
        to: string;
    };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export const Button: React.FC<ButtonProps> = props => {
    const {
        variant = 'primary',
        size = 'md',
        width = 'auto',
        children,
        icon,
        onlyIcon = false,
        className = '',
        ...restProps
    } = props;

    const buttonClassNames = classNames(
        styles.button,
        styles[`button--${variant}`],
        styles[`button--${size}`],
        styles[`button--width-${width}`],
        {
            [styles['button--only-icon']]: onlyIcon,
        },
        className,
    );

    // Автоматически используем children как title, если title не передан явно
    const tooltipTitle = typeof children === 'string' ? children : undefined;

    // Общий контент для кнопки и ссылки
    const content = (
        <>
            {icon && (
                <Icon
                    name={icon}
                    size={24}
                    aria-hidden={!onlyIcon}
                    className={styles.button__icon}
                />
            )}
            {!onlyIcon && <span className={styles.button__content}>{children}</span>}
        </>
    );

    // Если указан to, рендерим Link
    if ('to' in props && props.to) {
        const { to, ...linkProps } = restProps as ButtonAsLink;
        return (
            <Link to={to} className={buttonClassNames} title={tooltipTitle} {...linkProps}>
                {content}
            </Link>
        );
    }

    // Иначе рендерим button
    const { disabled = false, type = 'button', ...buttonProps } = restProps as ButtonAsButton;
    return (
        <button
            className={buttonClassNames}
            disabled={disabled}
            type={type}
            title={tooltipTitle}
            {...buttonProps}
        >
            {content}
        </button>
    );
};

export default Button;
