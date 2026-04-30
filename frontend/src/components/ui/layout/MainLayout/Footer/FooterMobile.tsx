import { useTranslation } from 'react-i18next';
import { Flex } from '@/components/ui/common/Flex';
import { Divider } from '@/components/ui/common/Divider';
import { Text } from '@/components/ui/common/Text';
import { Link } from '@/components/ui/common/Link';
import { Icon } from '@/components/ui/common/Icon';
import LogoPicDarkFooter from '@/icons/logo/logoPicDarkFooter.svg?react';
import LogoText from '@/icons/logo/logoTextDark.svg?react';
import ALetter from '@/icons/logo/A.svg?react';
import RLetter from '@/icons/logo/R.svg?react';
import ELetter from '@/icons/logo/E.svg?react';
import breakpointStyles from '@/styles/breakpoint-utilities.module.scss';
import { useSiteInfo } from '@/queries/siteInfo';
import styles from './FooterMobile.module.scss';
import { useFooterLinks } from './useFooterLinks';

export const FooterMobile = () => {
    const { t } = useTranslation();
    const siteInfo = useSiteInfo().data?.data;
    const footerLinks = useFooterLinks();

    return (
        <div className={breakpointStyles.mobileOnly}>
            <Flex align="stretch" gap={48} fullWidth>
                <Flex align="start" gap={24} fullWidth>
                    <Divider />
                    <Flex direction="row" justify="between" align="start" gap={100} fullWidth>
                        <Text variant="20-med" color="gray-0">
                            {t('footer.contactUs')}
                        </Text>
                        <LogoPicDarkFooter className={styles.footerMobile__ctaLogo} />
                    </Flex>
                    <Flex direction="row" align="center" gap={24}>
                        <Flex inline align="center" justify="center" style={{ flexShrink: 0 }}>
                            <Link to={siteInfo?.telegram_link || ''}>
                                <Icon name="telegram" color="primary-yellow" size={32} />
                            </Link>
                        </Flex>
                        <Flex inline align="center" justify="center" style={{ flexShrink: 0 }}>
                            <Link to={siteInfo?.max_link || ''}>
                                <Icon name="max" color="primary-yellow" size={32} />
                            </Link>
                        </Flex>
                    </Flex>
                    <Flex gap={12} align="start">
                        <Link
                            to={`tel:${siteInfo?.phone}`}
                            theme="light"
                            className={styles.footerMobile__contactLink}
                        >
                            {siteInfo?.display_phone}
                        </Link>
                        <Link
                            to={`mailto:${siteInfo?.email}`}
                            theme="light"
                            className={styles.footerMobile__contactLink}
                        >
                            {siteInfo?.email}
                        </Link>
                    </Flex>
                </Flex>

                <Flex align="start" gap={24} fullWidth>
                    <Divider />
                    <Flex align="start" gap={16} fullWidth>
                        <LogoText />
                        <Flex align="start" gap={12} fullWidth>
                            <Text variant="14-reg" color="gray-0">
                                {t('footer.description')}
                            </Text>
                            <Text variant="14-reg" color="gray-0">
                                {t('footer.ie')}: {siteInfo?.org_name || '-'}
                                <br />
                                {t('footer.inn')}: {siteInfo?.inn || '-'}
                            </Text>
                        </Flex>
                    </Flex>
                </Flex>

                {footerLinks.map(({ title, links }, i) => (
                    <Flex key={i} direction="column" align="start" gap={12} fullWidth>
                        <Divider />
                        <Text variant="14-reg" color="gray-50">
                            {title}
                        </Text>
                        {links.map(({ to, label, reloadDocument }) => (
                            <Link
                                key={to}
                                to={to}
                                theme="light"
                                size="md"
                                reloadDocument={reloadDocument}
                            >
                                {label}
                            </Link>
                        ))}
                    </Flex>
                ))}

                <Flex align="start" gap={24} fullWidth>
                    <Divider />
                    <Text variant="14-med" color="gray-0">
                        {t('footer.copyright')}
                    </Text>
                    <Divider />
                    <Text variant="14-med" color="gray-0">
                        {t('footer.development')}
                    </Text>
                </Flex>

                <Flex direction="row" align="center" justify="between" fullWidth>
                    <ALetter className={styles.footerMobile__lowerARESvg} />
                    <RLetter className={styles.footerMobile__lowerARESvg} />
                    <ELetter className={styles.footerMobile__lowerARESvg} />
                </Flex>
            </Flex>
        </div>
    );
};
