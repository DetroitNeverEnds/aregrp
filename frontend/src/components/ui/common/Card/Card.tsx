import styles from './card.module.scss';
import classNames from 'classnames';
import { Flex, type FlexProps } from '../Flex';

export type CardProps = FlexProps;

export const Card = (props: CardProps) => {
    return <Flex {...props} className={classNames(props.className, styles.container)} />;
};
