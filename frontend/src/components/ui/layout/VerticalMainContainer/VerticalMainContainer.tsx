import styles from './VerticalMainContainer.module.scss';
import classNames from 'classnames';
import Container from '@/components/ui/layout/Container';
import type { ContainerProps } from '../Container/Container';

type VerticalMainContainerProps = ContainerProps;

export const VerticalMainContainer = ({
    className,
    gap = 'main',
    ...props
}: VerticalMainContainerProps) => {
    return (
        <div className={classNames(styles.wrapper, className)}>
            <Container className={styles.container} {...props} fullWidth gap={gap}>
                {props.children}
            </Container>
        </div>
    );
};
