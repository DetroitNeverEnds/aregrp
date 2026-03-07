import React from 'react';
import classNames from 'classnames';
import styles from './Text.module.scss';
import type { ColorVariant } from '../types/colors';

export type TextVariant =
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | '10-reg'
    | '10-med'
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

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** Вариант текста (определяет размер и толщину шрифта) */
    variant?: TextVariant;
    /** Цвет текста */
    color?: ColorVariant;
    /** Выравнивание текста */
    align?: 'left' | 'center' | 'right' | 'justify';
    ellipsis?: boolean;
}

export const Text: React.FC<TextProps> = ({
    variant = '16-reg',
    color,
    align,
    className = '',
    ellipsis = false,
    ...props
}) => {
    const textClassNames = classNames(
        styles.text,
        { [styles.text__ellipsis]: ellipsis },
        styles[`text--${variant}`],
        color && styles[`text--color-${color}`],
        align && styles[`text--align-${align}`],
        className,
    );

    return <span className={textClassNames} {...props} />;
};

export default Text;
