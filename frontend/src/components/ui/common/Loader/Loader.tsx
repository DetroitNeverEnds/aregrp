import React from 'react';
import classNames from 'classnames';
import styles from './Loader.module.scss';
import { Spinner, type SpinnerSize } from '../Spinner';
import Text from '../Text';

export interface LoaderProps {
    /** Размер спиннера */
    spinnerSize?: SpinnerSize;
    /** Дополнительный CSS класс */
    className?: string;
    /** Цвет спиннера (CSS color) */
    spinnerColor?: string;
    /** Описание для accessibility */
    'aria-label'?: string;
    /** Текст под спиннером */
    text?: string;
}

export const Loader: React.FC<LoaderProps> = ({
    spinnerSize = 'lg',
    className = '',
    spinnerColor,
    'aria-label': ariaLabel,
    text,
}) => {
    const loaderClassNames = classNames(styles.loader, className);

    return (
        <div className={loaderClassNames} role="status" aria-label={ariaLabel}>
            <div className={styles.loader__content}>
                <Spinner size={spinnerSize} color={spinnerColor} aria-label={ariaLabel} />
                {text && <Text>{text}</Text>}
            </div>
        </div>
    );
};

export default Loader;
