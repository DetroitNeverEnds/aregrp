import React from 'react';
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom';
import classNames from 'classnames';
import { Text, type TextProps } from '../Text';
import { Icon, type IconName } from '../Icon';
import styles from './Link.module.scss';

export type LinkSize = 'sm' | 'md' | 'lg';
export type LinkTheme = 'blue' | 'black';

export interface LinkProps extends Omit<RouterLinkProps, 'to'> {
    /** Путь для навигации */
    to: string;
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
}

export const Link: React.FC<LinkProps> = ({
    to,
    size = 'md',
    theme = 'blue',
    children,
    leadingIcon,
    trailingIcon,
    className = '',
    ...props
}) => {
    // Маппинг размеров на варианты текста
    const sizeToVariant: Record<LinkSize, TextProps['variant']> = {
        sm: '12-med',
        md: '14-med',
        lg: '16-med',
    };

    // Маппинг размеров на размеры иконок
    const sizeToIconSize: Record<LinkSize, 14 | 16 | 20 | 24> = {
        sm: 16,
        md: 20,
        lg: 20,
    };

    const variant = sizeToVariant[size];
    const iconSize = sizeToIconSize[size];

    const linkClassNames = classNames(
        styles.link,
        styles[`link--${size}`],
        styles[`link--${theme}`],
        className,
    );

    return (
        <RouterLink to={to} className={linkClassNames} {...props}>
            {leadingIcon && (
                <Icon name={leadingIcon} size={iconSize} className={styles.link__leadingIcon} />
            )}
            <Text variant={variant}>{children}</Text>
            {trailingIcon && (
                <Icon name={trailingIcon} size={iconSize} className={styles.link__trailingIcon} />
            )}
        </RouterLink>
    );
};

export default Link;
