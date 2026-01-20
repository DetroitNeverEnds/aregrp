import React from 'react';
import classNames from 'classnames';
import styles from './Form.module.scss';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    /** Содержимое формы */
    children: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({ children, className = '', ...props }) => {
    return (
        <form className={classNames(styles.form, className)} {...props}>
            {children}
        </form>
    );
};

export default Form;
