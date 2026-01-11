import React from 'react';
import styles from './Icon.module.scss';
import { iconMap, type IconName } from './iconConfig';

export type IconSize = 16 | 20 | 24 | 32;

export interface IconProps extends React.SVGAttributes<SVGElement> {
    /** Название иконки */
    name: IconName;
    /** Размер иконки в пикселях */
    size?: IconSize;
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

    const classNames = [styles.icon, styles[`icon--size-${size}`], className]
        .filter(Boolean)
        .join(' ');

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
        <span className={classNames} style={style} {...ariaProps}>
            <IconComponent {...props} />
        </span>
    );
};

export default Icon;
