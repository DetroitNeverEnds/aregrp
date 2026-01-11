import React from 'react';
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom';
import classNames from 'classnames';
import { Text, type TextProps } from '../Text';
import { Icon, type IconName } from '../Icon';
import styles from './Link.module.scss';

export interface LinkProps extends Omit<RouterLinkProps, 'to'> {
    /** Путь для навигации */
    to: string;
    /** Вариант текста (по умолчанию '16-reg') */
    variant?: TextProps['variant'];
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
    variant = '16-reg',
    children,
    leadingIcon,
    trailingIcon,
    className = '',
    ...props
}) => {
    const linkClassNames = classNames(styles.link, className);

    // Определяем размер иконки в зависимости от варианта текста
    const getIconSize = (): 14 | 16 | 20 | 24 => {
        if (variant?.startsWith('12') || variant?.startsWith('14')) return 16;
        if (variant?.startsWith('16') || variant?.startsWith('18')) return 20;
        if (variant?.startsWith('20') || variant?.startsWith('24')) return 24;
        if (variant?.startsWith('h')) return 24;
        return 20;
    };

    const iconSize = getIconSize();

    return (
        <RouterLink to={to} className={linkClassNames} {...props}>
            {leadingIcon && (
                <Icon name={leadingIcon} size={iconSize} className={styles.link__leadingIcon} />
            )}
            <Text variant={variant} color="primary-700">
                {children}
            </Text>
            {trailingIcon && (
                <Icon name={trailingIcon} size={iconSize} className={styles.link__trailingIcon} />
            )}
        </RouterLink>
    );
};

export default Link;
