import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from '../../../components/ui/common/Link';
import { Flex } from '../../../components/ui/common/Flex';

import TwoRowsLogo from '@/icons/logo/2rows.svg?react';
import Lion1Logo from '@/icons/logo/lion1.svg?react';
import Lion2Logo from '@/icons/logo/lion2.svg?react';

import styles from './AuthLayout.module.scss';

export const AuthLayout: React.FC = () => {
    return (
        <Flex className={styles.body} direction="row" align="stretch">
            <Flex align="center" justify="center" className={styles.logo}>
                <TwoRowsLogo />
                <Lion1Logo className={styles.logo__lion1} />
                <Lion2Logo className={styles.logo__lion2} />
            </Flex>
            <Flex className={styles.auth__wrapperOuter} align="center">
                <Flex align="end" className={styles.auth__wrapperInner}>
                    <Link size="md" theme="black" to="/" leadingIcon="arrow-narrow-left">
                        Вернуться на сайт
                    </Link>
                    <Flex justify="center" fullWidth className={styles.auth__content}>
                        <Outlet />
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default AuthLayout;
