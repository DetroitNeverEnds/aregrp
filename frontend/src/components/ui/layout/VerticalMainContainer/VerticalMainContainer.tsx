import type { PropsWithChildren } from 'react';
import { Flex } from '../../common/Flex';

import styles from './VerticalMainContainer.module.scss';
import classNames from 'classnames';

type VerticalMainContainerProps = { className?: string } & PropsWithChildren;

export const VerticalMainContainer = (props: VerticalMainContainerProps) => {
    return (
        <Flex gap={100} className={classNames(styles.container, props.className)} fullWidth>
            {props.children}
        </Flex>
    );
};
