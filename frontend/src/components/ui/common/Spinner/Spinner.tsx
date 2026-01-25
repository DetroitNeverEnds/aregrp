import React from 'react';
import classNames from 'classnames';
import styles from './Spinner.module.scss';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
    /** Размер спиннера */
    size?: SpinnerSize;
    /** Дополнительный CSS класс */
    className?: string;
    /** Цвет спиннера (CSS color) */
    color?: string;
    /** Описание для accessibility */
    'aria-label'?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
    size = 'md',
    className = '',
    color,
    'aria-label': ariaLabel = 'Загрузка',
}) => {
    const spinnerClassNames = classNames(styles.spinner, styles[`spinner--${size}`], className);

    return (
        <svg
            className={spinnerClassNames}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="status"
            aria-label={ariaLabel}
            style={color ? { color } : undefined}
        >
            <path
                d="M20 11.5C20 6.80558 16.1944 3 11.5 3C6.80558 3 3 6.80558 3 11.5C3 16.1944 6.80558 20 11.5 20"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default Spinner;
