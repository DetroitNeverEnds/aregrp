import React from 'react';
import classNames from 'classnames';
import styles from './Loader.module.scss';
import { Spinner, type SpinnerSize } from '../Spinner';
import Text from '../Text';

export interface LoaderProps {
    /** Вариант отображения */
    variant?: 'block' | 'overlay';
    /** Высота блока (только для variant="block") */
    height?: number;
    /** Размер спиннера */
    spinnerSize?: SpinnerSize;
    /** Дополнительный CSS класс */
    className?: string;
    /** Цвет спиннера (CSS color) */
    spinnerColor?: string;
    /** Текст под спиннером */
    text?: string;
}

export const Loader: React.FC<LoaderProps> = ({
    variant = 'block',
    height,
    spinnerSize = 'lg',
    className = '',
    spinnerColor,
    text,
}) => {
    const loaderClassNames = classNames(styles.loader, styles[`loader--${variant}`], className);

    const style = variant === 'block' && height ? { height: `${height}px` } : undefined;

    return (
        <div className={loaderClassNames} role="status" style={style}>
            <div className={styles.loader__content}>
                <Spinner size={spinnerSize} color={spinnerColor} />
                {text && <Text>{text}</Text>}
            </div>
        </div>
    );
};

export default Loader;
