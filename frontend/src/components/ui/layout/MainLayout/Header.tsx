import { useTranslation } from 'react-i18next';
import { Flex } from '../../common/Flex';
import { Link } from '../../common/Link';
import { Button } from '../../common/Button';
import { useSiteInfo } from '../../../../queries/siteInfo';

// icons
import LogoPic from '@/icons/logo/logoPic.svg?react';
import LogoText from '@/icons/logo/logoText.svg?react';
import LogoPicDark from '@/icons/logo/logoPicDark.svg?react';
import LogoTextDark from '@/icons/logo/logoTextDark.svg?react';

import styles from './Header.module.scss';
import classNames from 'classnames';
import { BreadCrumbs, type BreadCrumbsDescription } from '../../common/Breadcrumbs/Breadcrumbs';
import { useUser } from '../../../../queries/profile';

export type HeaderTheme = 'light' | 'dark';

export type HeaderProps = {
    breadcrumbs?: BreadCrumbsDescription;
    theme: HeaderTheme;
};

export const Header = ({ breadcrumbs, theme = 'light' }: HeaderProps) => {
    const { t } = useTranslation();
    const siteInfoResult = useSiteInfo().data;
    const siteInfo = siteInfoResult?.data;
    const userResult = useUser().data;
    const userInfo = userResult?.data;

    const isDark = theme === 'dark';
    const linkTheme = isDark ? 'light' : 'blue';

    const containerClassName = classNames(styles.container, {
        [styles['container--dark']]: isDark,
    });

    const socialButtonClassName = classNames(styles.socialButton, {
        [styles['socialButton--dark']]: isDark,
    });

    return (
        <Flex gap={24} className={containerClassName} fullWidth>
            <Flex direction="row" justify="between" align="center" fullWidth gap={20}>
                <Flex gap={20} direction="row" align="center">
                    {isDark ? <LogoPicDark /> : <LogoPic />}
                    {isDark ? <LogoTextDark /> : <LogoText />}
                </Flex>
                <Flex direction="row" align="center" gap={30} className={styles.menuContainer}>
                    <Link to="/sale" ellipsis theme={linkTheme}>
                        {t('header.sale')}
                    </Link>
                    <Link to="/rent" ellipsis theme={linkTheme}>
                        {t('header.rent')}
                    </Link>
                    <Link to="/investors" ellipsis theme={linkTheme}>
                        {t('header.investors')}
                    </Link>
                    <Link to="/agents" ellipsis theme={linkTheme}>
                        {t('header.agents')}
                    </Link>
                    <Link to="/contacts" ellipsis theme={linkTheme}>
                        {t('header.contacts')}
                    </Link>
                    <Link to="/cases" ellipsis trailingIcon="download-rounded" theme={linkTheme}>
                        {t('header.cases')}
                    </Link>
                </Flex>
                <Flex direction="row" gap={40}>
                    <Flex direction="row" gap={10}>
                        <Link to={`tel:${siteInfo?.phone}`} size="lg" ellipsis theme={linkTheme}>
                            {siteInfo?.display_phone || '-'}
                        </Link>
                        <Button
                            variant="outlined"
                            onlyIcon
                            icon="whatsapp"
                            className={socialButtonClassName}
                            to={siteInfo?.whatsapp_link || ''}
                        />
                        <Button
                            variant="outlined"
                            onlyIcon
                            icon="tg"
                            className={socialButtonClassName}
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
                                to="/auth/login"
                                variant={isDark ? 'outlined' : 'primary'}
                                theme={isDark ? 'dark' : 'light'}
                            >
                                {t('common.login')}
                            </Button>
                        )}
                    </Flex>
                </Flex>
            </Flex>
            {breadcrumbs && breadcrumbs?.length > 0 && (
                <Flex direction="row" align="start" fullWidth>
                    <BreadCrumbs breadcrumbs={breadcrumbs} />
                </Flex>
            )}
        </Flex>
    );
};
