import React from 'react';
import styles from './Form.module.scss';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    /** Содержимое формы */
    children: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({ children, className = '', ...props }) => {
    return (
        <form className={styles.form} {...props}>
            <div className={className}>{children}</div>
        </form>
    );
};

export default Form;
