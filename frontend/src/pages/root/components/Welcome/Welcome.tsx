import React from 'react';
import { Flex } from '../../../../components/ui/common/Flex';
import Text from '../../../../components/ui/common/Text';
import styles from './Welcome.module.scss';

import TwoRowsLogo from '@/icons/logo/twoRows.svg?react';
import LionTatar from '@/icons/logo/lionTatar.svg?react';

export const Welcome: React.FC = () => {
    return (
        <Flex className={styles.welcome} justify="center">
            <Flex gap={50} align="center" className={styles.welcome__logo}>
                <TwoRowsLogo className={styles.welcome__logo__icon} />

                <Text variant="24-med" color="gray-0" className={styles.welcome__logo__description}>
                    Продажа и аренда офисных помещений в Казани от 1 млн без комиссии от
                    собственника
                </Text>
            </Flex>

            <LionTatar className={styles.welcome__lion} />
            <img src="/img/skyscraper.png" className={styles.welcome__skyscraper} />
        </Flex>
    );
};

export default Welcome;
