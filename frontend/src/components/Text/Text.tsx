import React from 'react';
import './Text.scss';

export type TextVariant =
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

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** Вариант текста (определяет размер и толщину шрифта) */
    variant?: TextVariant;
}

export const Text: React.FC<TextProps> = ({ variant = '16-reg', className = '', ...props }) => {
    const classNames = ['text', `text--${variant}`, className].filter(Boolean).join(' ');

    return <span className={classNames} {...props} />;
};

export default Text;
