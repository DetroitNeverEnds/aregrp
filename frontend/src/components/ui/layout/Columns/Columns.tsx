import { forwardRef, type PropsWithChildren } from 'react';
import classNames from 'classnames';

import styles from './Columns.module.scss';

export type ColumnsProps = PropsWithChildren<{
    rowsNum?: 2 | 4;
    className?: string;
}>;

export const Columns = forwardRef<HTMLDivElement, ColumnsProps>(
    ({ children, rowsNum = 2, className }, ref) => {
        return (
            <div
                ref={ref}
                className={classNames(styles.root, styles[`root__rows-${rowsNum}`], className)}
            >
                {children}
            </div>
        );
    },
);
