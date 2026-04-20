import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Flex } from '@/components/ui/common/Flex';
import styles from './Header.module.scss';
import classNames from 'classnames';
import { BreadCrumbs } from '@/components/ui/common/Breadcrumbs/Breadcrumbs';
import { HeaderDesktop } from './HeaderDesktop';
import { HeaderMobile } from './HeaderMobile';
import { HeaderMobileDrawer } from './HeaderMobileDrawer';
import type { HeaderProps } from './Header.types';

export type { HeaderTheme, HeaderProps } from './Header.types';

export const Header = ({ breadcrumbs, theme = 'light' }: HeaderProps) => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isDark = theme === 'dark';

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setMobileMenuOpen(false);
        }, 0);
        return () => window.clearTimeout(timer);
    }, [location.pathname, location.search]);

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        const onChange = () => {
            if (mq.matches) {
                setMobileMenuOpen(false);
            }
        };
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    const containerClassName = classNames(styles.container, {
        [styles['container--dark']]: isDark,
    });

    return (
        <>
            <Flex className={containerClassName} direction="row" justify="center">
                <Flex gap={24} className={styles.content}>
                    <HeaderDesktop theme={theme} />
                    <HeaderMobile theme={theme} onOpenMenu={() => setMobileMenuOpen(true)} />

                    {breadcrumbs && breadcrumbs?.length > 0 && (
                        <Flex direction="row" align="start" fullWidth>
                            <BreadCrumbs breadcrumbs={breadcrumbs} />
                        </Flex>
                    )}
                </Flex>
            </Flex>
            <HeaderMobileDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        </>
    );
};
