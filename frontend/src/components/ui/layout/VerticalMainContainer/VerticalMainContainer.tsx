import type { PropsWithChildren } from 'react';
import { Flex } from '../../common/Flex';

import styles from './verticalmaincontainer.module.scss';

type VerticalMainContainerProps = PropsWithChildren;

export const VerticalMainContainer = (props: VerticalMainContainerProps) => {
    return (
        <Flex gap={100} className={styles.container} fullWidth>
            {props.children}
        </Flex>
    );
};
