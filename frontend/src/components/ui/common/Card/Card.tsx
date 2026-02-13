import styles from './Card.module.scss';
import classNames from 'classnames';
import { Flex, type FlexProps } from '../Flex';

export interface CardProps extends FlexProps {
    isPin?: boolean;
}

export const Card = ({ isPin, className, ...props }: CardProps) => {
    return (
        <Flex
            {...props}
            className={classNames(className, styles.container, {
                [styles.pin]: isPin,
            })}
        />
    );
};
