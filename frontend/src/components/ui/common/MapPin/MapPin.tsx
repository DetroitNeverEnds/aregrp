import type { ReactNode } from 'react';
import classNames from 'classnames';
import MarkerPinIcon from '@/icons/other/marker-pin.svg?react';
import styles from './MapPin.module.scss';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';

export type MapPinProps = {
    /**
     * Текст адреса для отображения
     */
    address: string;
    /**
     * Дополнительный контент (например, карточка с информацией)
     */
    children?: ReactNode;
    className?: string;
    tooltipClassName?: string;
};

export const MapPin = ({ address, children, className, tooltipClassName }: MapPinProps) => {
    return (
        <div className={classNames(styles.root, className)}>
            {children && (
                <div className={classNames(styles.tooltip, tooltipClassName)}>{children}</div>
            )}
            <Flex direction="row" className={styles.pin}>
                <Flex justify="center" className={styles.iconWrapper}>
                    <MarkerPinIcon className={styles.icon} />
                </Flex>
                {address && (
                    <Text variant="14-med" color="primary-700" className={styles.label}>
                        {address}
                    </Text>
                )}
            </Flex>
        </div>
    );
};
