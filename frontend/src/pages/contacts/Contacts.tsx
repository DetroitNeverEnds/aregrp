import { useTranslation } from 'react-i18next';
import { useMemo, Fragment } from 'react';
import { Flex } from '../../components/ui/common/Flex';
import Text from '../../components/ui/common/Text';
import { useLayoutSettings } from '../../hooks/useLayoutSettings';
import type { LayoutSettings } from '../../components/ui/layout/MainLayout/Layout';
import { VerticalMainContainer } from '../../components/ui/layout/VerticalMainContainer';
import { Column } from '../../components/ui/layout/Column';
import { Columns } from '../../components/ui/layout/Columns';
import { useSiteInfo } from '../../queries/siteInfo';
import { Link } from '../../components/ui/common/Link';
import { Divider } from '../../components/ui/common/Divider';
import { useSiteContacts } from '../../queries/contacts';
import { YandexMap } from '../../components/ui/common/YandexMap';
import { FeedbackFormRow } from '../../components/ui/layout/FeedbackFormRow';

import styles from './Contacts.module.scss';
import { MapPin } from '../../components/ui/common/MapPin';
import { Card } from '../../components/ui/common/Card/Card';
import { Page } from '@/components/ui/layout/Page/Page';
import breakpointStyles from '@/styles/breakpoint-utilities.module.scss';
import Container from '@/components/ui/layout/Container';

export const Contacts = () => {
    const { t } = useTranslation();

    const layoutSettings = useMemo<LayoutSettings>(
        () => ({
            header: {
                theme: 'light',
                breadcrumbs: [
                    { to: '/', label: t('bc.main') },
                    { to: '/contacts', label: t('bc.contacts') },
                ],
            },
            mainContentBackground: 'gray-0',
        }),
        [t],
    );
    useLayoutSettings(layoutSettings);
    const siteInfo = useSiteInfo().data?.data;
    const contacts = useSiteContacts().data?.data;

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
                title: t('common.max'),
                link: siteInfo?.max_link,
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
        <Page>
            <VerticalMainContainer className={styles.container}>
                {/* Контакты и карта */}
                <Columns>
                    <Column className={styles.contacts} align="stretch">
                        <Flex align="start">
                            <Text variant="h2">{t('pages.contacts.connectUs')}</Text>
                            <Text variant="h2" color="gray-50">
                                {t('pages.contacts.anyVariant')}
                            </Text>
                        </Flex>
                        <Flex className={styles.contacts__variants}>
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
                            staticMap
                            markers={[
                                {
                                    key: 'sales-office',
                                    coordinates: {
                                        lat: contacts?.coordinates?.lat || 0,
                                        lon: contacts?.coordinates?.lng || 0,
                                    },
                                    content: (
                                        <MapPin address={contacts?.sales_center_address || '-'}>
                                            <Card align="start" gap={6} isPin>
                                                <Text variant="14-med">
                                                    {t('pages.contacts.salesOffice')}
                                                </Text>
                                                <Text variant="12-reg" color="gray-70">
                                                    {contacts?.sales_center_address || '-'}
                                                </Text>
                                                <img
                                                    src="/img/salesOffice.png"
                                                    style={{ width: '100%' }}
                                                />
                                            </Card>
                                        </MapPin>
                                    ),
                                },
                            ]}
                        ></YandexMap>
                    </Column>
                </Columns>

                {/* Реквизиты */}
                <Columns>
                    <Container gap="secondary">
                        <Divider />
                        <Text variant="20-med">{t('pages.contacts.requisite')}</Text>
                    </Container>
                    <Container gap="secondary">
                        <Divider className={breakpointStyles.desktopOnly} />
                        <Flex align="start" fullWidth>
                            <Text variant="h2">{t('pages.contacts.ie')}</Text>
                            <Text variant="h2" color="gray-50">
                                {siteInfo?.org_name || '-'}
                            </Text>
                        </Flex>

                        <>
                            <Flex gap={24} align="start" fullWidth>
                                {legalInfo.map(({ title, value }, i) => (
                                    <Fragment key={i}>
                                        {/* Desktop */}
                                        <Flex
                                            key={i}
                                            direction="row"
                                            fullWidth
                                            gap={80}
                                            align="baseline"
                                            className={breakpointStyles.desktopOnly}
                                        >
                                            <Text color="gray-50" className={styles.legal__keys}>
                                                {title}
                                            </Text>
                                            <Text>{value}</Text>
                                        </Flex>
                                        {/* Mobile */}
                                        <Flex
                                            align="start"
                                            gap={12}
                                            className={breakpointStyles.mobileOnly}
                                        >
                                            <Text color="gray-50" className={styles.legal__keys}>
                                                {title}
                                            </Text>
                                            <Text>{value}</Text>
                                        </Flex>
                                    </Fragment>
                                ))}
                            </Flex>
                        </>
                    </Container>
                </Columns>

                {/* Форма */}
                <FeedbackFormRow originKey="contacts" />
            </VerticalMainContainer>
        </Page>
    );
};
