import { forwardRef, type PropsWithChildren } from 'react';
import classNames from 'classnames';

import styles from './Columns.module.scss';

export type ColumnsProps = PropsWithChildren<{
    columnssNum?: 2 | 3 | 4;
    className?: string;
}>;

export const Columns = forwardRef<HTMLDivElement, ColumnsProps>(
    ({ children, columnssNum = 2, className }, ref) => {
        return (
            <div
                ref={ref}
                className={classNames(styles.root, styles[`root__rows-${columnssNum}`], className)}
            >
                {children}
            </div>
        );
    },
);
