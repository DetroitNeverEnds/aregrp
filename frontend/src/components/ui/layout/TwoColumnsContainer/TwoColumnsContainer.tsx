import { forwardRef, type PropsWithChildren } from 'react';
import { Flex, type FlexProps } from '../../common/Flex';
import classNames from 'classnames';

import styles from './TwoColumnsContainer.module.scss';

type TwoColumnsContainerProps = PropsWithChildren;

export const TwoColumnsContainer = forwardRef<HTMLDivElement, TwoColumnsContainerProps>(
    (props, ref) => {
        return (
            <Flex direction="row" gap={24} fullWidth align="stretch" ref={ref}>
                {props.children}
            </Flex>
        );
    },
);

export const Column = (props: FlexProps) => {
    return (
        <Flex align="start" {...props} className={classNames(styles.column, props.className)}>
            {props.children}
        </Flex>
    );
};
