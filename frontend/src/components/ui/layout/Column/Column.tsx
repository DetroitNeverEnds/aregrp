import classNames from 'classnames';
import { Flex, type FlexProps } from '@/components/ui/common/Flex';

import styles from './Column.module.scss';

export const Column = (props: FlexProps) => {
    return (
        <Flex align="start" {...props} className={classNames(styles.column, props.className)}>
            {props.children}
        </Flex>
    );
};
