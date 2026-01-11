import React from 'react';
import classNames from 'classnames';
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
    const buttonClassNames = classNames(styles.flatButton, className);

    return (
        <button className={buttonClassNames} type={type} {...props}>
            {children}
        </button>
    );
};

export default FlatButton;
