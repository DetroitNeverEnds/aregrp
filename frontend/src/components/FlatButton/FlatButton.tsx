import React from 'react';
import styles from './FlatButton.module.scss';

export interface FlatButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Содержимое кнопки */
    children?: React.ReactNode;
}

export const FlatButton: React.FC<FlatButtonProps> = ({
    children,
    className = '',
    type = 'button',
    ...props
}) => {
    const classNames = [styles.flatButton, className].filter(Boolean).join(' ');

    return (
        <button className={classNames} type={type} {...props}>
            {children}
        </button>
    );
};

export default FlatButton;
