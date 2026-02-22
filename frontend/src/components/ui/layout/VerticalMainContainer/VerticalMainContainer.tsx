import type { PropsWithChildren } from 'react';
import styles from './VerticalMainContainer.module.scss';
import classNames from 'classnames';
import Container from '@/components/ui/layout/Container';

type VerticalMainContainerProps = { className?: string } & PropsWithChildren;

export const VerticalMainContainer = (props: VerticalMainContainerProps) => {
    return (
        <Container gap="main" className={classNames(styles.container, props.className)} fullWidth>
            {props.children}
        </Container>
    );
};
