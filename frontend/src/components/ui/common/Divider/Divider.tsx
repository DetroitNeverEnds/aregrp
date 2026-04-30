import React from 'react';
import classNames from 'classnames';
import styles from './Divider.module.scss';
import type { ColorVariant } from '@/components/ui/common/types/colors';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps {
    /** Ориентация разделителя */
    orientation?: DividerOrientation;
    // NOT WORKING
    color?: ColorVariant;
    /** Дополнительный CSS класс */
    className?: string;
}

export const Divider: React.FC<DividerProps> = ({
    orientation = 'horizontal',
    color = 'gray-100',
    className = '',
}) => {
    const dividerClassNames = classNames(
        styles.divider,
        styles[`divider__${orientation}`],
        color && styles[`divider__color-${color}`],
        className,
    );

    return <div className={dividerClassNames} />;
};

export default Divider;
