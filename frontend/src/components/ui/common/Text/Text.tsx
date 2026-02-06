import React from 'react';
import classNames from 'classnames';
import styles from './Text.module.scss';

export type TextVariant =
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | '12-reg'
    | '12-med'
    | '14-reg'
    | '14-med'
    | '16-reg'
    | '16-med'
    | '18-reg'
    | '18-med'
    | '20-reg'
    | '20-med'
    | '24-reg'
    | '24-med';

export type TextColor =
    | 'gray-0'
    | 'gray-5'
    | 'gray-10'
    | 'gray-20'
    | 'gray-30'
    | 'gray-50'
    | 'gray-70'
    | 'gray-100'
    | 'primary-200'
    | 'primary-300'
    | 'primary-400'
    | 'primary-500'
    | 'primary-600'
    | 'primary-700'
    | 'primary-800'
    | 'primary-900'
    | 'primary-1000'
    | 'error-default';

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** Вариант текста (определяет размер и толщину шрифта) */
    variant?: TextVariant;
    /** Цвет текста */
    color?: TextColor;
}

export const Text: React.FC<TextProps> = ({
    variant = '16-reg',
    color,
    className = '',
    ...props
}) => {
    const textClassNames = classNames(
        styles.text,
        styles[`text--${variant}`],
        color && styles[`text--color-${color}`],
        className,
    );

    return <span className={textClassNames} {...props} />;
};

export default Text;
