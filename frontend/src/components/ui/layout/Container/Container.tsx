import { Flex, type FlexProps } from '@/components/ui/common/Flex';
import classNames from 'classnames';
import styles from './Container.module.scss';
export type GapSize = 'main' | 'regular' | 'secondary';
export type ContainerProps = Omit<FlexProps, 'gap'> & {
    gap?: GapSize;
};

export const Container = ({ gap = 'regular', className = '', ...props }: ContainerProps) => (
    <Flex
        align="start"
        fullWidth
        className={classNames(styles.container, styles[`container--${gap}`], className)}
        {...props}
    />
);
