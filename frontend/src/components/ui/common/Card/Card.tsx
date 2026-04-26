import styles from './Card.module.scss';
import classNames from 'classnames';
import { Flex, type FlexProps } from '@/components/ui/common/Flex';

export interface CardProps extends FlexProps {
    size?: 'l' | 'xl';
    background?: 'white' | 'gray';
    withShadow?: boolean;
    isPin?: boolean;
}

export const Card = ({
    size = 'l',
    background = 'white',
    withShadow = false,
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
                    [styles.container__withShadow]: withShadow,
                    [styles.pin]: isPin,
                },
            )}
        />
    );
};
