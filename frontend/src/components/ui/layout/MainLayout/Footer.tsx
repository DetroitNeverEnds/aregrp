import { useTranslation } from 'react-i18next';
import { Divider } from '../../common/Divider';
import { Flex } from '../../common/Flex';
import { Text } from '../../common/Text';
import { Link } from '../../common/Link';
import { Icon } from '../../common/Icon';
import LogoPic from '@/icons/logo/logoPic.svg?react';
import LogoText from '@/icons/logo/logoText.svg?react';
import ALetter from '@/icons/logo/A.svg?react';
import RLetter from '@/icons/logo/R.svg?react';
import ELetter from '@/icons/logo/E.svg?react';

import styles from './Footer.module.scss';
import { useSiteInfo } from '../../../../queries/siteInfo';
import { useMemo } from 'react';
import { Column } from '../TwoColumnsContainer';

export const Footer = () => {
    const { t } = useTranslation();
    const siteInfo = useSiteInfo().data;

    const footerLinks = useMemo(
        () => [
            {
                title: t('footer.navigation.title'),
                links: [
                    { to: '/', label: t('footer.navigation.main') },
                    { to: '/sale', label: t('footer.navigation.sale') },
                    { to: '/rent', label: t('footer.navigation.rent') },
                    { to: '/investors', label: t('footer.navigation.investors') },
                    { to: '/agents', label: t('footer.navigation.agents') },
                    { to: '/contacts', label: t('footer.navigation.contacts') },
                ],
            },
            {
                title: t('footer.legal.title'),
                links: [
                    { to: '/privacy', label: t('footer.legal.privacy') },
                    { to: '/payment', label: t('footer.legal.payment') },
                ],
            },
            {
                title: t('footer.contacts.title'),
                links: [
                    { to: `tel:${siteInfo?.phone}`, label: siteInfo?.display_phone || '-' },
                    { to: `mailto:${siteInfo?.email}`, label: siteInfo?.email || '-' },
                    { to: siteInfo?.telegram_link || '', label: t('footer.contacts.telegram') },
                    { to: siteInfo?.whatsapp_link || '', label: t('footer.contacts.whatsapp') },
                ],
            },
        ],
        [t, siteInfo],
    );

    return (
        <footer className={styles.footer}>
            <Flex gap={140} fullWidth>
                {/* Основной контент футера */}
                <Flex gap={100} fullWidth>
                    {/* Верхняя секция с контактами */}
                    <Flex direction="row" justify="between" align="start" fullWidth>
                        <Flex align="start" gap={60}>
                            <Flex gap={40} fullWidth align="start">
                                <Divider />
                                <Text variant="20-med" color="gray-0">
                                    {t('footer.contactUs')}
                                </Text>
                            </Flex>

                            <Flex align="start" gap={40}>
                                {/* Социальные сети */}
                                <Flex
                                    direction="row"
                                    gap={50}
                                    align="start"
                                    className={styles.footer__socialMedia_links}
                                >
                                    <Link to={siteInfo?.telegram_link || ''}>
                                        <Icon name="telegram" size={50} />
                                    </Link>
                                    <Link to={siteInfo?.whatsapp_link || ''}>
                                        <Icon name="whatsapp" size={50} />
                                    </Link>
                                </Flex>

                                {/* Контактная информация */}
                                <Flex align="start" gap={16}>
                                    <Link
                                        size="lg"
                                        theme="light"
                                        to={`tel:${siteInfo?.phone}`}
                                        className={styles.footer__contactLink}
                                    >
                                        {siteInfo?.display_phone}
                                    </Link>
                                    <Link
                                        size="lg"
                                        theme="light"
                                        to={`mailto:${siteInfo?.email}`}
                                        className={styles.footer__contactLink}
                                    >
                                        {siteInfo?.email}
                                    </Link>
                                </Flex>
                            </Flex>
                        </Flex>

                        {/* Логотип */}
                        <div className={styles.footer__logo}>
                            <LogoPic />
                        </div>
                    </Flex>

                    {/* Нижняя секция с колонками */}
                    <Flex gap={60} fullWidth>
                        {/* 4 колонки */}
                        <Flex
                            align="start"
                            direction="row"
                            gap={24}
                            fullWidth
                            className={styles.footer__columns}
                        >
                            {/* Колонка 1: О компании */}
                            <Column align="start" gap={40}>
                                <Divider />
                                <Flex align="start" gap={58} fullWidth>
                                    <LogoText className={styles.footer__links__logo} />
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

                            {/* Колонки с ссылками */}
                            {footerLinks.map(({ title, links }, i) => (
                                <Column
                                    key={i}
                                    align="start"
                                    gap={40}
                                    // className={styles.footer__column}
                                >
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

                        {/* Копирайт и разработка */}
                        <Flex direction="row" gap={24} fullWidth>
                            <Column align="start" gap={20} className={styles.footer__column}>
                                <Divider />
                                <Text variant="14-med" color="gray-0">
                                    {t('footer.copyright')}
                                </Text>
                            </Column>
                            <Column align="start" gap={20} className={styles.footer__column}>
                                <Divider />
                                <Text variant="14-med" color="gray-20">
                                    {t('footer.development')}
                                </Text>
                            </Column>
                        </Flex>
                    </Flex>
                </Flex>

                {/* Логотипы партнеров (заглушка) */}
                <Flex direction="row" justify="between" align="center" fullWidth>
                    <ALetter />
                    <RLetter />
                    <ELetter />
                </Flex>
            </Flex>
        </footer>
    );
};
