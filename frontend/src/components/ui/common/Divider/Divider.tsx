import React from 'react';
import classNames from 'classnames';
import styles from './Divider.module.scss';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps {
    /** Ориентация разделителя */
    orientation?: DividerOrientation;
    /** Дополнительный CSS класс */
    className?: string;
}

export const Divider: React.FC<DividerProps> = ({
    orientation = 'horizontal',
    className = '',
}) => {
    const dividerClassNames = classNames(
        styles.divider,
        styles[`divider--${orientation}`],
        className,
    );

    return <div className={dividerClassNames} />;
};

export default Divider;