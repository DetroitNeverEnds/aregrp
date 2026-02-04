import { useTranslation } from 'react-i18next';
import { Flex } from '../components/ui/common/Flex';
import Text from '../components/ui/common/Text';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';
import { useMemo, Fragment } from 'react';
import { VerticalMainContainer } from '../components/ui/layout/VerticalMainContainer';
import { Column, TwoColumnsContainer } from '../components/ui/layout/TwoColumnsContainer';
import { useSiteInfo } from '../queries/siteInfo';
import { Link } from '../components/ui/common/Link';
import { Divider } from '../components/ui/common/Divider';
import { useSiteContacts } from '../queries/contacts';
import { FeedbackForm } from '../components/ui/forms/FeedbackForm';
import { YandexMap } from '../components/ui/common/YandexMap';

import styles from './Contacts.module.scss';
import { Card } from '../components/ui/common/Card/Card';

export const Contacts = () => {
    const { t } = useTranslation();
    const bc = useMemo(
        () => [
            { to: '/', label: t('bc.main') },
            { to: '/contacts', label: t('bc.contacts') },
        ],
        [t],
    );
    useBreadcrumbs(bc);
    const siteInfo = useSiteInfo().data;
    const contacts = useSiteContacts().data;

    const contactsVariants = useMemo(
        () => [
            {
                title: siteInfo?.display_phone || '-',
                link: `tel:${siteInfo?.phone}`,
                description: t('common.phone'),
            },
            {
                title: siteInfo?.email || '-',
                link: `mailto:${siteInfo?.email}`,
                description: t('common.email'),
            },
            {
                title: t('common.whatsapp'),
                link: siteInfo?.whatsapp_link,
                description: t('common.messanger'),
            },
            {
                title: t('common.telegram'),
                link: siteInfo?.telegram_link,
                description: t('common.messanger'),
            },
        ],
        [siteInfo, t],
    );
    const legalInfo = useMemo(
        () => [
            {
                title: t('pages.contacts.inn'),
                value: siteInfo?.inn || '-',
            },
            {
                title: t('pages.contacts.ogrn'),
                value: contacts?.ogrn || '-',
            },
            {
                title: t('pages.contacts.legal_adress'),
                value: contacts?.legal_address || '-',
            },
        ],
        [contacts?.legal_address, contacts?.ogrn, siteInfo?.inn, t],
    );

    return (
        <VerticalMainContainer>
            {/* Контакты и карта */}
            <TwoColumnsContainer>
                <Column gap={200} align="stretch">
                    <Flex align="start">
                        <Text variant="h2">{t('pages.contacts.connectUs')}</Text>
                        <Text variant="h2" color="gray-50">
                            {t('pages.contacts.anyVariant')}
                        </Text>
                    </Flex>
                    <Flex gap={40}>
                        {contactsVariants.map((contact, index) => (
                            <Fragment key={index}>
                                <Flex gap={12} align="start" fullWidth>
                                    {contact.link ? (
                                        <Link to={contact.link}>
                                            <Text variant="h1">{contact.title}</Text>
                                        </Link>
                                    ) : (
                                        <Text variant="h1" color="gray-100">
                                            {contact.title}
                                        </Text>
                                    )}

                                    <Text variant="12-reg" color="gray-50">
                                        {contact.description}
                                    </Text>
                                </Flex>
                                {index !== contactsVariants.length - 1 && <Divider />}
                            </Fragment>
                        ))}
                    </Flex>
                </Column>
                <Column className={styles.mapColumn}>
                    <YandexMap
                        markerCoordinates={[48.889695, 55.876743]}
                        zoom={13}
                        markerHint="AREGRP"
                        markerBalloon="<strong>AREGRP</strong><br/>Наш офис"
                    >
                        <Card align="start" gap={6}>
                            <Text variant="14-med">{t('pages.contacts.salesOffice')}</Text>
                            <Text variant="12-reg" color="gray-70">
                                {contacts?.sales_center_address || '-'}
                            </Text>
                            <img src="img/salesOffice.png" />
                        </Card>
                    </YandexMap>
                </Column>
            </TwoColumnsContainer>

            {/* Реквизиты */}
            <TwoColumnsContainer>
                <Column align="start" gap={40}>
                    <Divider />
                    <Text variant="20-med">{t('pages.contacts.requisite')}</Text>
                </Column>
                <Column gap={40}>
                    <Divider />
                    <Flex align="start" fullWidth>
                        <Text variant="h2">{t('pages.contacts.ie')}</Text>
                        <Text variant="h2" color="gray-50">
                            {siteInfo?.org_name || '-'}
                        </Text>
                    </Flex>
                    <Flex gap={20} fullWidth>
                        {legalInfo.map(({ title, value }) => (
                            <Flex direction="row" fullWidth gap={80}>
                                <Text color="gray-50" className={styles.legal__keys}>
                                    {title}
                                </Text>
                                <Text>{value}</Text>
                            </Flex>
                        ))}
                        {/* <Flex direction="row" fullWidth gap={80}>
                            <Text color="gray-50" className={styles.legal__keys}>
                                {t('pages.contacts.inn')}
                            </Text>
                            <Text>{siteInfo?.inn}</Text>
                        </Flex>
                        <Flex direction="row" fullWidth gap={80}>
                            <Text color="gray-50" className={styles.legal__keys}>
                                {t('pages.contacts.ogrn')}
                            </Text>
                            <Text>{contacts?.ogrn || '-'}</Text>
                        </Flex>
                        <Flex direction="row" fullWidth gap={80}>
                            <Text color="gray-50" className={styles.legal__keys}>
                                {t('pages.contacts.legal_adress')}
                            </Text>
                            <Text>{contacts?.legal_address || '-'}</Text>
                        </Flex> */}
                    </Flex>
                </Column>
            </TwoColumnsContainer>

            {/* Форма */}
            <TwoColumnsContainer>
                <Column gap={80} className={styles.formColumn}>
                    <Flex gap={20} align="start">
                        <Text color="gray-50">{t('pages.contacts.planView')}</Text>
                        <Flex align="start">
                            <Text variant="h2">{t('pages.contacts.fillForm')}</Text>
                            <Text variant="h2" color="gray-50">
                                {t('pages.contacts.forDetails')}
                            </Text>
                        </Flex>
                    </Flex>
                    <FeedbackForm />
                </Column>
                <Column className={styles.imgColumn} />
            </TwoColumnsContainer>
        </VerticalMainContainer>
    );
};
