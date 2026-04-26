import classNames from 'classnames';
import type { HTMLAttributes } from 'react';
import styles from './BetweenRowLayout.module.scss';

export type BetweenRowLayoutProps = HTMLAttributes<HTMLDivElement>;

export const BetweenRowLayout = ({ className, children, ...props }: BetweenRowLayoutProps) => {
    return (
        <div className={classNames(styles.root, className)} {...props}>
            {children}
        </div>
    );
};
