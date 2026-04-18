import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Flex } from '@/components/ui/common/Flex';
import { Link } from '@/components/ui/common/Link';
import { Button } from '@/components/ui/common/Button';
import { useSiteInfo } from '@/queries/siteInfo';
import LogoPic from '@/icons/logo/logoPic.svg?react';
import LogoText from '@/icons/logo/logoText.svg?react';
import LogoPicDark from '@/icons/logo/logoPicDark.svg?react';
import LogoTextDark from '@/icons/logo/logoTextDark.svg?react';
import styles from './HeaderDesktop.module.scss';
import { useUser } from '../../../../../queries/profile';
import type { HeaderTheme } from './Header.types';
import breakpointStyles from '@/styles/breakpoint-utilities.module.scss';
import { useNavLinks } from './useNavLinks';

export type HeaderDesktopProps = {
    theme: HeaderTheme;
};

export const HeaderDesktop = ({ theme }: HeaderDesktopProps) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const siteInfo = useSiteInfo().data?.data;
    const userInfo = useUser().data?.data;

    const isDark = theme === 'dark';
    const linkTheme = isDark ? 'light' : 'blue';

    const loginPath = location.pathname.startsWith('/auth')
        ? '/auth/login'
        : `/auth/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;

    const navLinks = useNavLinks();

    return (
        <Flex
            direction="row"
            justify="between"
            align="center"
            fullWidth
            gap={20}
            className={breakpointStyles['desktop-only']}
        >
            <Flex
                gap={20}
                direction="row"
                align="center"
                onClick={() => navigate('/')}
                className={styles.logoContainer}
            >
                {isDark ? <LogoPicDark /> : <LogoPic />}
                {isDark ? <LogoTextDark /> : <LogoText />}
            </Flex>
            <Flex direction="row" align="center" gap={30} className={styles.menuContainer}>
                {navLinks.map(({ label, ...linkProps }) => (
                    <Link key={linkProps.to} {...linkProps} ellipsis theme={linkTheme}>
                        {label}
                    </Link>
                ))}
            </Flex>
            <Flex direction="row" gap={40}>
                <Flex direction="row" gap={10}>
                    <Link to={`tel:${siteInfo?.phone}`} size="lg" ellipsis theme={linkTheme}>
                        {siteInfo?.display_phone || '-'}
                    </Link>
                    <Button
                        variant="outlined"
                        theme={isDark ? 'dark' : 'light'}
                        onlyIcon
                        icon="max"
                        iconColor="primary-yellow"
                        to={siteInfo?.max_link || ''}
                    />
                    <Button
                        variant="outlined"
                        theme={isDark ? 'dark' : 'light'}
                        onlyIcon
                        icon="tg"
                        iconColor="primary-yellow"
                        to={siteInfo?.telegram_link || ''}
                    />
                </Flex>
                <Flex direction="row">
                    {userInfo ? (
                        <Button
                            to="/profile"
                            variant={isDark ? 'outlined' : 'primary'}
                            theme={isDark ? 'dark' : 'light'}
                            icon="user-simple"
                            onlyIcon
                        />
                    ) : (
                        <Button
                            to={loginPath}
                            variant={isDark ? 'outlined' : 'primary'}
                            theme={isDark ? 'dark' : 'light'}
                        >
                            {t('common.login')}
                        </Button>
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
};
