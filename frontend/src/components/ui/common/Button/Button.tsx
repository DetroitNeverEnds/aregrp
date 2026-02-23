import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import styles from './Button.module.scss';
import { Icon, type IconName } from '@/components/ui/common/Icon';
import { type ColorVariant } from '@/components/ui/common/types/colors';

export type ButtonVariant = 'primary' | 'outlined' | 'secondary' | 'flat';
export type ButtonTheme = 'light' | 'dark';
export type ButtonSize = 'lg' | 'md';
export type ButtonWidth = 'auto' | 'max';

interface BaseButtonProps {
    variant?: ButtonVariant;
    theme?: ButtonTheme;
    size?: ButtonSize;
    width?: ButtonWidth;
    children?: React.ReactNode;
    icon?: IconName;
    iconColor?: ColorVariant;
    onlyIcon?: boolean;
    className?: string;
}

type ButtonAsButton = BaseButtonProps &
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
        to?: never;
    };

type ButtonAsLink = BaseButtonProps &
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
        to: string;
    };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export const Button: React.FC<ButtonProps> = props => {
    const {
        variant = 'primary',
        theme = 'light',
        size = 'md',
        width = 'auto',
        children,
        icon,
        iconColor = undefined,
        onlyIcon = false,
        className = '',
        ...restProps
    } = props;

    const buttonClassNames = classNames(
        styles.button,
        styles[`button--${variant}--${theme}`],
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
                    color={iconColor}
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
