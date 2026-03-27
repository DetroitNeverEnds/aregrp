import type { PropsWithChildren } from 'react';
import styles from './VerticalMainContainer.module.scss';
import classNames from 'classnames';
import Container from '@/components/ui/layout/Container';
import { Flex } from '../../common/Flex';

type VerticalMainContainerProps = { className?: string } & PropsWithChildren;

export const VerticalMainContainer = (props: VerticalMainContainerProps) => {
    return (
        <div className={styles.wrapper}>
            <Flex gap={24} className={styles.content}>
                <Container
                    gap="main"
                    className={classNames(styles.container, props.className)}
                    fullWidth
                >
                    {props.children}
                </Container>
            </Flex>
        </div>
    );
};
