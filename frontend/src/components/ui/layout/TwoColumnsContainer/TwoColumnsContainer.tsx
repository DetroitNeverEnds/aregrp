import { forwardRef, type PropsWithChildren } from 'react';
import { Flex } from '../../common/Flex';

import styles from './TwoColumnsContainer.module.scss';

type TwoColumnsContainerProps = PropsWithChildren;

export const TwoColumnsContainer = forwardRef<HTMLDivElement, TwoColumnsContainerProps>(
    (props, ref) => {
        return (
            <Flex
                direction="row"
                gap={24}
                fullWidth
                align="stretch"
                ref={ref}
                className={styles.root}
            >
                {props.children}
            </Flex>
        );
    },
);
