import type { ReactNode } from 'react';
import MarkerPinIcon from '@/icons/other/marker-pin.svg?react';
import styles from './MapPin.module.scss';
import { Flex } from '../Flex';
import Text from '../Text';

export type MapPinProps = {
    /**
     * Текст адреса для отображения
     */
    address: string;
    /**
     * Дополнительный контент (например, карточка с информацией)
     */
    children?: ReactNode;
};

export const MapPin = ({ address, children }: MapPinProps) => {
    return (
        <Flex gap={12}>
            {children && <div>{children}</div>}
            <Flex direction="row" className={styles.pin}>
                <Flex justify="center" className={styles.iconWrapper}>
                    <MarkerPinIcon className={styles.icon} />
                </Flex>
                <Text variant="14-med" color="primary-700" className={styles.label}>
                    {address}
                </Text>
            </Flex>
        </Flex>
    );
};
