import React from 'react';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';
import styles from './Welcome.module.scss';
import breakpointStyles from '@/styles/breakpoint-utilities.module.scss';
import classNames from 'classnames';

import RowAreLogo from '@/icons/logo/row_are.svg?react';
import RowGroupLogo from '@/icons/logo/row_group.svg?react';
import LionTatar from '@/icons/logo/lionTatar.svg?react';

export const Welcome: React.FC = () => {
    return (
        <>
            <Flex
                className={classNames(styles.welcome, breakpointStyles.desktopOnly)}
                justify="center"
            >
                <Flex gap={50} align="center" className={styles.welcome__logo}>
                    <Flex gap={14} className={styles.welcome__logo__icon}>
                        <RowAreLogo />
                        <RowGroupLogo />
                    </Flex>

                    <Text
                        variant="24-med"
                        color="gray-0"
                        align="center"
                        className={styles.welcome__logo__description}
                    >
                        Продажа и аренда офисных помещений в Казани от 1 млн без комиссии от
                        собственника
                    </Text>
                </Flex>

                <LionTatar className={styles.welcome__lion} />
                <img src="/img/skyscraper.png" className={styles.welcome__skyscraper} />
            </Flex>
            <Flex
                align="start"
                gap={20}
                className={classNames(styles.welcome, breakpointStyles.mobileOnly)}
            >
                <Flex gap={14} align="start" fullWidth>
                    <RowAreLogo className={styles.welcome__logo__icon__row} />
                    <RowGroupLogo className={styles.welcome__logo__icon__row} />
                </Flex>
                <Text
                    variant="14-med"
                    color="gray-0"
                    align="left"
                    className={styles.welcome__logo__description}
                >
                    Продажа и аренда офисных помещений в Казани от 1 млн без комиссии от
                    собственника
                </Text>
                <img src="/img/skyscraper_mob10@2x.png" className={styles.welcome__skyscraper} />
            </Flex>
        </>
    );
};

export default Welcome;
