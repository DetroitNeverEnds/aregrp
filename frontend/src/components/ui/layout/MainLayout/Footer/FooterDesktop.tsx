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
import { Column } from '@/components/ui/layout/Column';
import { useTranslation } from 'react-i18next';
import footerStyles from './Footer.module.scss';
import styles from './FooterDesktop.module.scss';
import { useFooterLinks } from './useFooterLinks';

export const FooterDesktop = () => {
    const { t } = useTranslation();
    const siteInfo = useSiteInfo().data?.data;
    const footerLinks = useFooterLinks();

    return (
        <div className={breakpointStyles.desktopOnly}>
            <Flex gap={140} fullWidth>
                <Flex gap={100} fullWidth>
                    <Flex direction="row" justify="between" align="start" fullWidth>
                        <Flex align="start" gap={60}>
                            <Flex gap={40} fullWidth align="start">
                                <Divider />
                                <Text variant="20-med" color="gray-0">
                                    {t('footer.contactUs')}
                                </Text>
                            </Flex>

                            <Flex align="start" gap={40}>
                                <Flex direction="row" gap={50} align="start">
                                    <Link to={siteInfo?.telegram_link || ''}>
                                        <Icon name="telegram" color="primary-yellow" size={50} />
                                    </Link>
                                    <Link to={siteInfo?.max_link || ''}>
                                        <Icon name="max" color="primary-yellow" size={50} />
                                    </Link>
                                </Flex>

                                <Flex align="start" gap={16}>
                                    <Link
                                        size="lg"
                                        theme="light"
                                        to={`tel:${siteInfo?.phone}`}
                                        className={styles.footerDesktop__contactLink}
                                    >
                                        {siteInfo?.display_phone}
                                    </Link>
                                    <Link
                                        size="lg"
                                        theme="light"
                                        to={`mailto:${siteInfo?.email}`}
                                        className={styles.footerDesktop__contactLink}
                                    >
                                        {siteInfo?.email}
                                    </Link>
                                </Flex>
                            </Flex>
                        </Flex>

                        <LogoPicDarkFooter />
                    </Flex>

                    <Flex gap={60} fullWidth>
                        <Flex align="start" direction="row" gap={24} fullWidth>
                            <Column align="start" gap={40}>
                                <Divider />
                                <Flex align="start" gap={58} fullWidth>
                                    <LogoText className={footerStyles.footer__linksLogo} />
                                    <Flex align="start" gap={20}>
                                        <Text variant="14-reg" color="gray-50">
                                            {t('footer.description')}
                                        </Text>
                                        <Text variant="14-reg" color="gray-50">
                                            {t('footer.ie')}: {siteInfo?.org_name || '-'}
                                            <br />
                                            {t('footer.inn')}: {siteInfo?.inn || '-'}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </Column>

                            {footerLinks.map(({ title, links }, i) => (
                                <Column key={i} align="start" gap={40}>
                                    <Divider />
                                    <Flex align="start" gap={20}>
                                        <Text variant="14-reg" color="gray-50">
                                            {title}
                                        </Text>
                                        {links.map(({ to, label }) => (
                                            <Link key={to} to={to} size="md" theme="light">
                                                {label}
                                            </Link>
                                        ))}
                                    </Flex>
                                </Column>
                            ))}
                        </Flex>

                        <Flex direction="row" align="start" gap={24} fullWidth>
                            <Column align="start" gap={20}>
                                <Divider />
                                <Text variant="14-med" color="gray-0">
                                    {t('footer.copyright')}
                                </Text>
                            </Column>
                            <Column align="start" gap={20}>
                                <Divider />
                                <Link size="md" theme="light" to="https://aregrp.ru">
                                    {t('footer.development')}
                                </Link>
                            </Column>
                        </Flex>
                    </Flex>
                </Flex>

                <Flex direction="row" justify="between" align="center" fullWidth>
                    <ALetter />
                    <RLetter />
                    <ELetter />
                </Flex>
            </Flex>
        </div>
    );
};
