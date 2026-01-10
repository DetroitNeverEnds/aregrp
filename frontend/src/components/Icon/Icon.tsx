import React from 'react';
import './Icon.scss';
import { iconMap, type IconName } from './iconConfig';

export type IconSize = 16 | 20 | 24 | 32;

export interface IconProps extends React.SVGAttributes<SVGElement> {
    /** Название иконки */
    name: IconName;
    /** Размер иконки в пикселях */
    size?: IconSize;
    /** Цвет иконки (CSS цвет или переменная) */
    color?: string;
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

    const classNames = ['icon', `icon--size-${size}`, color && 'icon--colored', className]
        .filter(Boolean)
        .join(' ');

    const iconStyle: React.CSSProperties = {
        ...style,
        ...(color && { color }),
    };

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
        <span className={classNames} style={iconStyle} {...ariaProps}>
            <IconComponent {...props} />
        </span>
    );
};

export default Icon;
