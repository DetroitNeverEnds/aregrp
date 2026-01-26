import React from 'react';
import classNames from 'classnames';
import styles from './Flex.module.scss';

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type FlexJustify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
export type FlexAlign = 'start' | 'end' | 'center' | 'stretch' | 'baseline';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Направление flex */
    direction?: FlexDirection;
    /** Выравнивание по главной оси (justify-content) */
    justify?: FlexJustify;
    /** Выравнивание по поперечной оси (align-items) */
    align?: FlexAlign;
    /** Перенос элементов (flex-wrap) */
    wrap?: FlexWrap;
    /** Расстояние между элементами */
    gap?: number | string;
    /** Использовать inline-flex вместо flex */
    inline?: boolean;
    /** Ширина 100% */
    fullWidth?: boolean;
    /** Содержимое */
    children?: React.ReactNode;
}

export const Flex: React.FC<FlexProps> = ({
    direction = 'column',
    justify = 'start',
    align = 'stretch',
    wrap = 'nowrap',
    gap,
    inline = false,
    fullWidth = false,
    className = '',
    style,
    children,
    ...props
}) => {
    const flexClassNames = classNames(
        styles.flex,
        styles[`flex--direction-${direction}`],
        styles[`flex--justify-${justify}`],
        styles[`flex--align-${align}`],
        styles[`flex--wrap-${wrap}`],
        {
            [styles['flex--inline']]: inline,
            [styles['flex--full-width']]: fullWidth,
        },
        className,
    );

    const flexStyle: React.CSSProperties = {
        ...style,
        ...(gap !== undefined && { gap: typeof gap === 'number' ? `${gap}px` : gap }),
    };

    return (
        <div className={flexClassNames} style={flexStyle} {...props}>
            {children}
        </div>
    );
};

export default Flex;
