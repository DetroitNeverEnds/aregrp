import styles from './VerticalMainContainer.module.scss';
import classNames from 'classnames';
import Container from '@/components/ui/layout/Container';
import { Flex, type FlexProps } from '../../common/Flex';

type VerticalMainContainerProps = FlexProps;

export const VerticalMainContainer = ({ className, ...props }: VerticalMainContainerProps) => {
    return (
        <div className={classNames(styles.wrapper, className)}>
            <Flex gap={24} className={styles.content}>
                <Container {...props} className={styles.container} fullWidth gap="main">
                    {props.children}
                </Container>
            </Flex>
        </div>
    );
};
