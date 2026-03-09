import styles from './Card.module.scss';
import classNames from 'classnames';
import { Flex, type FlexProps } from '../Flex';

export interface CardProps extends FlexProps {
    size?: 'l' | 'xl';
    background: 'white' | 'gray';
    isPin?: boolean;
}

export const Card = ({
    size = 'l',
    background = 'white',
    isPin = false,
    className,
    ...props
}: CardProps) => {
    return (
        <Flex
            {...props}
            className={classNames(
                className,
                styles.container,
                styles[`container__size-${size}`],
                styles[`container__background-${background}`],
                {
                    [styles.pin]: isPin,
                },
            )}
        />
    );
};
