import React from 'react';
import classNames from 'classnames';
import styles from './Icon.module.scss';
import { iconMap, type IconName } from './iconConfig';
import type { ColorVariant } from '../types/colors';

export type IconSize = 14 | 16 | 20 | 24 | 32 | 50;

export interface IconProps extends React.SVGAttributes<SVGElement> {
    /** Название иконки */
    name: IconName;
    /** Размер иконки в пикселях */
    size?: IconSize;
    /** Цвет иконки (использует ту же палитру, что и Text) */
    color?: ColorVariant;
    /** Дополнительный CSS класс */
    className?: string;
    /** Описание иконки для accessibility */
    'aria-label'?: string;
    /** Скрыть иконку от screen readers (для декоративных иконок) */
    'aria-hidden'?: boolean;
    /** Роль элемента */
    role?: string;
}

export const Icon: React.FC<IconProps> = ({
    name,
    size = 24,
    color,
    className = '',
    style,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    role = 'img',
    ...props
}) => {
    const IconComponent = iconMap[name];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found`);
        return null;
    }

    const iconClassNames = classNames(
        styles.icon,
        styles[`icon--size-${size}`],
        color && styles[`icon--color-${color}`],
        className,
    );

    // Определяем aria-атрибуты
    const ariaProps: React.AriaAttributes & { role?: string } = {};

    if (ariaHidden) {
        ariaProps['aria-hidden'] = true;
    } else {
        ariaProps.role = role;
        if (ariaLabel) {
            ariaProps['aria-label'] = ariaLabel;
        }
    }

    return (
        <span className={iconClassNames} style={style} {...ariaProps}>
            <IconComponent {...props} />
        </span>
    );
};

export default Icon;
