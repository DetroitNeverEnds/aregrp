import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from '../../../components/ui/common/Link';
import { Flex } from '../../../components/ui/common/Flex';
import styles from './AuthLayout.module.scss';

export const AuthLayout: React.FC = () => {
    return (
        <Flex className={styles.body} direction="row" align="stretch">
            <div className={styles.logo}>//</div>
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
