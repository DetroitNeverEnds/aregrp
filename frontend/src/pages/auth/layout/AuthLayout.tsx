import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useSearchParams } from 'react-router-dom';
import { Link } from '../../../components/ui/common/Link';
import { Flex } from '../../../components/ui/common/Flex';

import TwoRowsLogo from '@/icons/logo/twoRows.svg?react';
import Lion1Logo from '@/icons/logo/lion1.svg?react';
import Lion2Logo from '@/icons/logo/lion2.svg?react';

import styles from './AuthLayout.module.scss';

export const AuthLayout: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const redirectTo = useMemo(() => {
        const redirect = searchParams.get('redirect');
        return redirect && redirect.startsWith('/') ? redirect : '/';
    }, [searchParams]);

    return (
        <Flex className={styles.body} direction="row" align="stretch">
            <Flex align="center" justify="center" className={styles.logo}>
                <TwoRowsLogo />
                <Lion1Logo className={styles.logo__lion1} />
                <Lion2Logo className={styles.logo__lion2} />
            </Flex>
            <Flex className={styles.auth__wrapperOuter} align="center">
                <Flex align="end" className={styles.auth__wrapperInner}>
                    <Link size="md" theme="black" to={redirectTo} leadingIcon="arrow-narrow-left">
                        {t('auth.common.backToSite')}
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
