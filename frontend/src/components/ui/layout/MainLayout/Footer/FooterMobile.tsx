import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Divider } from '@/components/ui/common/Divider';
import { Text } from '@/components/ui/common/Text';
import { Link } from '@/components/ui/common/Link';
import { Icon } from '@/components/ui/common/Icon';
import LogoPicDarkFooter from '@/icons/logo/logoPicDarkFooter.svg?react';
import LogoText from '@/icons/logo/logoText.svg?react';
import ALetter from '@/icons/logo/A.svg?react';
import RLetter from '@/icons/logo/R.svg?react';
import ELetter from '@/icons/logo/E.svg?react';
import classNames from 'classnames';
import breakpointStyles from '@/styles/breakpoint-utilities.module.scss';
import { useSiteInfo } from '@/queries/siteInfo';
import footerStyles from './Footer.module.scss';
import styles from './FooterMobile.module.scss';
import { useFooterLinks } from './useFooterLinks';

export const FooterMobile = () => {
    const { t } = useTranslation();
    const siteInfo = useSiteInfo().data?.data;
    const footerLinks = useFooterLinks();

    return (
        <div className={classNames(styles.footerMobile, breakpointStyles['mobile-only'])}>
            <div className={styles.footerMobile__inner}>
                <div className={styles.footerMobile__ctaBlock}>
                    <Divider />
                    <div className={styles.footerMobile__ctaRow}>
                        <span className={styles.footerMobile__ctaText}>
                            {t('footer.contactUsMobile')
                                .split('\n')
                                .map((line, i, arr) => (
                                    <Fragment key={i}>
                                        {line}
                                        {i < arr.length - 1 ? <br /> : null}
                                    </Fragment>
                                ))}
                        </span>
                        <LogoPicDarkFooter className={styles.footerMobile__ctaLogo} />
                    </div>
                    <div className={styles.footerMobile__socials}>
                        <Link to={siteInfo?.telegram_link || ''} className={styles.footerMobile__socialLink}>
                            <Icon name="telegram" color="primary-yellow" size={32} />
                        </Link>
                        <Link to={siteInfo?.max_link || ''} className={styles.footerMobile__socialLink}>
                            <Icon name="max" color="primary-yellow" size={32} />
                        </Link>
                    </div>
                    <div className={styles.footerMobile__contacts}>
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
                    </div>
                </div>

                <div className={styles.footerMobile__aboutSection}>
                    <Divider />
                    <div className={styles.footerMobile__aboutTight}>
                        <LogoText className={footerStyles.footer__linksLogo} />
                        <div className={styles.footerMobile__aboutText}>
                            <Text variant="14-reg" color="gray-0">
                                {t('footer.description')}
                            </Text>
                            <Text variant="14-reg" color="gray-0">
                                {t('footer.ie')}: {siteInfo?.org_name || '-'}
                                <br />
                                {t('footer.inn')}: {siteInfo?.inn || '-'}
                            </Text>
                        </div>
                    </div>
                </div>

                {footerLinks.map(({ title, links }, i) => (
                    <div key={i} className={styles.footerMobile__navColumn}>
                        <Divider />
                        <span className={styles.footerMobile__navColumnTitle}>{title}</span>
                        {links.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                theme="light"
                                size="sm"
                                className={styles.footerMobile__navLink}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                ))}

                <div className={styles.footerMobile__legalRow}>
                    <div className={styles.footerMobile__legalBlock}>
                        <Divider />
                        <span className={styles.footerMobile__copyright}>{t('footer.copyright')}</span>
                    </div>
                    <div className={styles.footerMobile__legalBlock}>
                        <Divider />
                        <span className={styles.footerMobile__development}>{t('footer.development')}</span>
                    </div>
                </div>

                <div className={styles.footerMobile__partners}>
                    <ALetter />
                    <RLetter />
                    <ELetter />
                </div>
            </div>
        </div>
    );
};
