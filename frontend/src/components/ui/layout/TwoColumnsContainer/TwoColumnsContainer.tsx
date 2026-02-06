import type { PropsWithChildren } from 'react';
import { Flex, type FlexProps } from '../../common/Flex';
import classNames from 'classnames';

import styles from './TwoColumnsContainer.module.scss';

type TwoColumnsContainerProps = PropsWithChildren;

export const TwoColumnsContainer = (props: TwoColumnsContainerProps) => {
    return (
        <Flex direction="row" gap={24} fullWidth align="stretch">
            {props.children}
        </Flex>
    );
};

export const Column = (props: FlexProps) => {
    return (
        <Flex {...props} className={classNames(styles.column, props.className)}>
            {props.children}
        </Flex>
    );
};
