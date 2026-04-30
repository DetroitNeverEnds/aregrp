import React from 'react';
import classNames from 'classnames';
import styles from './Icon.module.scss';
import { iconMap, type IconName } from './iconConfig';
import type { ColorVariant } from '@/components/ui/common/types/colors';

export type IconSize = 14 | 16 | 20 | 24 | 32 | 50;

export interface IconProps extends Omit<
    React.SVGAttributes<SVGElement>,
    keyof React.AriaAttributes | 'role'
> {
    /** Название иконки */
    name: IconName;
    /** Размер иконки в пикселях */
    size?: IconSize;
    /** Цвет иконки (использует ту же палитру, что и Text) */
    color?: ColorVariant;
    /** Дополнительный CSS класс */
    className?: string;
}

export const Icon: React.FC<IconProps> = ({
    name,
    size = 24,
    color,
    className = '',
    style,
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

    return (
        <span className={iconClassNames} style={style}>
            <IconComponent {...props} />
        </span>
    );
};

export default Icon;
