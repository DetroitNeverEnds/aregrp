import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import classNames from 'classnames';
import { Icon, type IconName } from '../Icon';
import styles from './Link.module.scss';

export type LinkSize = 'sm' | 'md' | 'lg';
export type LinkTheme = 'blue' | 'black' | 'light';
export type LinkVariant = 'default' | 'external';

export type LinkProps = {
    /** Путь для навигации или полный URL при variant="external" */
    to: string;
    variant?: LinkVariant;
    /** Размер ссылки (по умолчанию 'medium') */
    size?: LinkSize;
    /** Тема ссылки (по умолчанию 'blue') */
    theme?: LinkTheme;
    /** Содержимое ссылки */
    children: React.ReactNode;
    /** Иконка слева от текста */
    leadingIcon?: IconName;
    /** Иконка справа от текста */
    trailingIcon?: IconName;
    /** Дополнительный CSS класс */
    className?: string;
    ellipsis?: boolean;
    target?: '_blank' | '_self' | '_parent' | '_top';
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    /** Переопределяет переход по клику (например, navigate из react-router + побочные эффекты) */
    navigate?: (to: string) => void;
};

export const Link: React.FC<LinkProps> = ({
    to,
    variant = 'default',
    size = 'md',
    theme = 'blue',
    children,
    leadingIcon,
    trailingIcon,
    className = '',
    ellipsis = false,
    target,
    onClick,
    navigate,
}) => {
    // Маппинг размеров на размеры иконок
    const sizeToIconSize: Record<LinkSize, 14 | 16 | 20 | 24> = {
        sm: 16,
        md: 20,
        lg: 20,
    };

    const iconSize = sizeToIconSize[size];

    const linkClassNames = classNames(
        styles.link,
        { [styles.link__ellipsis]: ellipsis },
        styles[`link--${size}`],
        styles[`link--${theme}`],
        className,
    );

    const content = (
        <>
            {leadingIcon && (
                <Icon name={leadingIcon} size={iconSize} className={styles.link__leadingIcon} />
            )}
            {children}
            {trailingIcon && (
                <Icon name={trailingIcon} size={iconSize} className={styles.link__trailingIcon} />
            )}
        </>
    );

    if (variant === 'external') {
        return (
            <a href={to} className={linkClassNames} target={target} onClick={onClick}>
                {content}
            </a>
        );
    }

    if (variant === 'default') {
        const handleClick: React.MouseEventHandler<HTMLAnchorElement> = e => {
            if (navigate) {
                e.preventDefault();
                navigate(to);
            }
            onClick?.(e);
        };
        return (
            <RouterLink to={to} className={linkClassNames} target={target} onClick={handleClick}>
                {content}
            </RouterLink>
        );
    }

    return null;
};

export default Link;
