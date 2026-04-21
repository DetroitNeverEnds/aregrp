import styles from './VerticalMainContainer.module.scss';
import classNames from 'classnames';
import Container from '@/components/ui/layout/Container';
import type { ContainerProps } from '@/components/ui/layout/Container/Container';
import { Flex } from '@/components/ui/common/Flex';

type VerticalMainContainerProps = ContainerProps;

export const VerticalMainContainer = ({
    className,
    gap = 'main',
    ...props
}: VerticalMainContainerProps) => {
    return (
        <Flex className={classNames(styles.wrapper, className)} align="center" fullWidth>
            <Container className={styles.container} {...props} fullWidth gap={gap}>
                {props.children}
            </Container>
        </Flex>
    );
};
