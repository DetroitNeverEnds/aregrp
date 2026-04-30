import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Flex } from '@/components/ui/common/Flex';
import { Link } from '@/components/ui/common/Link';
import { Button } from '@/components/ui/common/Button';
import FlatButton from '@/components/ui/common/FlatButton';
import { Icon } from '@/components/ui/common/Icon';
import { useSiteInfo } from '@/queries/siteInfo';
import LogoPic from '@/icons/logo/logoPic.svg?react';
import LogoText from '@/icons/logo/logoText.svg?react';
import styles from './HeaderMobileDrawer.module.scss';
import sharedStyles from './HeaderShared.module.scss';
import { useUser } from '@/queries/profile';
import { useNavLinks } from './useNavLinks';
import classNames from 'classnames';
import breakpointStyles from '@/styles/breakpoint-utilities.module.scss';

export type HeaderMobileDrawerProps = {
    open: boolean;
    onClose: () => void;
};

export const HeaderMobileDrawer = ({ open, onClose }: HeaderMobileDrawerProps) => {
    const { t } = useTranslation();
    const location = useLocation();
    const routerNavigate = useNavigate();

    const handleNavigate = (to: string) => {
        routerNavigate(to);
        onClose();
    };
    const siteInfo = useSiteInfo().data?.data;
    const userInfo = useUser().data?.data;

    const loginPath = location.pathname.startsWith('/auth')
        ? '/auth/login'
        : `/auth/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;

    useEffect(() => {
        if (!open) {
            return;
        }
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    const navLinks = useNavLinks();

    if (!open) {
        return null;
    }

    return createPortal(
        <div className={classNames(styles.drawer__root, breakpointStyles.mobileOnly)}>
            <div className={styles.drawer__backdrop} onClick={onClose} />
            <Flex
                direction="column"
                fullWidth
                className={styles.drawer__sheet}
                style={{ minHeight: 0 }}
            >
                <Flex
                    direction="row"
                    align="center"
                    justify="between"
                    fullWidth
                    gap={4}
                    className={styles.drawer__top}
                    style={{ flexShrink: 0 }}
                >
                    <div className={sharedStyles.mobileBar__spacer} />
                    <Flex
                        direction="row"
                        align="center"
                        gap={16}
                        onClick={() => handleNavigate('/')}
                    >
                        <LogoPic />
                        <LogoText />
                    </Flex>
                    <FlatButton
                        type="button"
                        onClick={onClose}
                        className={sharedStyles.headerIconBtn}
                    >
                        <Icon name="x-close" size={24} color="gray-100" />
                    </FlatButton>
                </Flex>
                <Flex
                    direction="column"
                    align="start"
                    fullWidth
                    gap={24}
                    className={styles.drawer__menu}
                    style={{ flex: 1, minHeight: 0 }}
                >
                    {navLinks.map(({ label, ...linkProps }) => (
                        <Link
                            key={linkProps.to}
                            {...linkProps}
                            theme="blue"
                            size="md"
                            navigate={handleNavigate}
                        >
                            {label}
                        </Link>
                    ))}

                    {userInfo ? (
                        <Button
                            to="/profile"
                            variant="primary"
                            theme="light"
                            width="max"
                            onlyIcon
                            icon="user-simple"
                            className={styles.drawer__profileBtn}
                            navigate={handleNavigate}
                        />
                    ) : (
                        <Button
                            to={loginPath}
                            variant="flat"
                            theme="light"
                            width="max"
                            className={styles.drawer__login}
                            navigate={handleNavigate}
                        >
                            {t('common.login')}
                        </Button>
                    )}

                    <Flex justify="center" fullWidth>
                        <Link
                            to={`tel:${siteInfo?.phone}`}
                            theme="black"
                            size="md"
                            className={styles.drawer__phone}
                            onClick={onClose}
                        >
                            {siteInfo?.display_phone || '-'}
                        </Link>
                    </Flex>

                    <Flex
                        direction="row"
                        gap={10}
                        justify="center"
                        fullWidth
                        className={styles.drawer__social}
                    >
                        <Button
                            variant="outlined"
                            theme="light"
                            onlyIcon
                            icon="max"
                            iconColor="primary-yellow"
                            to={siteInfo?.max_link || ''}
                            className={styles.drawer__socialBtn}
                            onClick={onClose}
                        />
                        <Button
                            variant="outlined"
                            theme="light"
                            onlyIcon
                            icon="tg"
                            iconColor="primary-yellow"
                            to={siteInfo?.telegram_link || ''}
                            className={styles.drawer__socialBtn}
                            onClick={onClose}
                        />
                    </Flex>
                </Flex>
            </Flex>
        </div>,
        document.body,
    );
};
