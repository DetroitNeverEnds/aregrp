import { useTranslation } from 'react-i18next';
import { Flex } from '../../common/Flex';
import { Link } from '../../common/Link';
import { Button } from '../../common/Button';
import { useSiteInfo } from '../../../../queries/siteInfo';

// icons
import LogoPic from '@/icons/logo/logoPic.svg?react';
import LogoText from '@/icons/logo/logoText.svg?react';

import styles from './Header.module.scss';
import { BreadCrumbs, type BreadCrumbsDescription } from '../../common/Breadcrumbs/Breadcrumbs';

export type HeaderProps = {
    breadcrumbs?: BreadCrumbsDescription;
};

export const Header = (props: HeaderProps) => {
    const { t } = useTranslation();
    const siteInfo = useSiteInfo().data;
    const userInfo = undefined;

    return (
        <Flex gap={24} className={styles.container} fullWidth>
            <Flex direction="row" justify="between" align="center" fullWidth gap={20}>
                <Flex gap={20} direction="row" align="center">
                    <LogoPic />
                    <LogoText />
                </Flex>
                <Flex direction="row" align="center" gap={30}>
                    <Link to="/sale">{t('header.sale')}</Link>
                    <Link to="/rent">{t('header.rent')}</Link>
                    <Link to="/investors">{t('header.investors')}</Link>
                    <Link to="/agents">{t('header.agents')}</Link>
                    <Link to="/contacts">{t('header.contacts')}</Link>
                    <Link to="/cases" trailingIcon="download-rounded">
                        {t('header.cases')}
                    </Link>
                </Flex>
                <Flex direction="row" gap={40}>
                    <Flex direction="row" gap={10}>
                        <Link to={`tel:${siteInfo?.phone}`} size="lg">
                            {siteInfo?.display_phone || '-'}
                        </Link>
                        <Button
                            variant="outlined"
                            onlyIcon
                            icon="whatsapp"
                            className={styles.socialButton}
                        />
                        <Button
                            variant="outlined"
                            onlyIcon
                            icon="tg"
                            className={styles.socialButton}
                        />
                    </Flex>
                    <Flex direction="row">
                        {!userInfo && <Button to="/auth/login">{t('common.login')}</Button>}
                    </Flex>
                </Flex>
            </Flex>
            {props.breadcrumbs && (
                <Flex direction="row" align="start" fullWidth>
                    <BreadCrumbs breadcrumbs={props.breadcrumbs} />
                </Flex>
            )}
        </Flex>
    );
};
