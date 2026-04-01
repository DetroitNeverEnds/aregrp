import { useTranslation } from 'react-i18next';
import { useCallback, useMemo, useRef } from 'react';
import { Flex } from '../../components/ui/common/Flex';
import Text from '../../components/ui/common/Text';
import { useLayoutSettings } from '../../hooks/useLayoutSettings';
import type { LayoutSettings } from '../../components/ui/layout/MainLayout/Layout';
import { Page } from '../../components/ui/layout/Page/Page';
import { BreadCrumbs } from '../../components/ui/common/Breadcrumbs/Breadcrumbs';
import { VerticalMainContainer } from '../../components/ui/layout/VerticalMainContainer';
import { Column, TwoColumnsContainer } from '../../components/ui/layout/TwoColumnsContainer';
import { Divider } from '../../components/ui/common/Divider';
import { Icon, type IconName } from '../../components/ui/common/Icon';
import { Button } from '../../components/ui/common/Button';
import { FeedbackFormRow } from '../../components/ui/layout/FeedbackFormRow';
import { useSiteInfo } from '../../queries/siteInfo';
import PercentageIcon from './assets/percent.svg?react';

import styles from './Agents.module.scss';
import Container from '@/components/ui/layout/Container';
import _ from 'lodash';

const BENEFITS_ICONS: IconName[] = [
    'benefit-9',
    'benefit-8',
    'benefit-12',
    'benefit-11',
    'benefit-10',
    'benefit-4',
    'benefit-7',
    'benefit-7',
];

export const Agents = () => {
    const { t } = useTranslation();
    const siteInfo = useSiteInfo().data?.data;
    const feedbackSectionRef = useRef<HTMLDivElement>(null);

    const layoutSettings = useMemo<LayoutSettings>(
        () => ({
            header: {
                theme: 'dark',
                breadcrumbs: [],
            },
            mainContentBackground: 'gray-0',
        }),
        [],
    );
    useLayoutSettings(layoutSettings);

    const benefits = useMemo(
        () =>
            _.zip(
                BENEFITS_ICONS,
                t('pages.agents.benefits', { returnObjects: true }) as string[],
            ).map(([icon, text]) => ({
                icon,
                text,
            })),
        [t],
    );

    const breadcrumbs = useMemo(
        () => [
            { to: '/', label: t('bc.main') },
            { to: '/agents', label: t('header.agents') },
        ],
        [t],
    );

    const scrollToFeedback = useCallback(() => {
        feedbackSectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }, []);

    return (
        <Page>
            <VerticalMainContainer
                direction="row"
                align="center"
                justify="between"
                className={styles.hero}
                aria-labelledby="agents-hero-title"
            >
                <Flex direction="column" align="start" gap={70} className={styles.hero__info}>
                    <Flex direction="column" align="start" gap={40} fullWidth>
                        <Text variant="h2" color="gray-0" id="agents-hero-title">
                            {t('pages.agents.hero.title')}
                        </Text>
                        <Text variant="20-reg" color="gray-0">
                            {t('pages.agents.hero.subtitle')}
                        </Text>
                    </Flex>
                    <Flex direction="row" align="center" gap={40} wrap="wrap">
                        <Button
                            size="lg"
                            variant="outlined"
                            theme="dark"
                            icon="phone"
                            iconColor="primary-yellow"
                            onClick={scrollToFeedback}
                        >
                            {t('pages.agents.hero.orderCall')}
                        </Button>
                        <Flex direction="row" align="center" gap={10}>
                            {siteInfo?.max_link && (
                                <Button
                                    size="lg"
                                    variant="outlined"
                                    theme="dark"
                                    onlyIcon
                                    icon="max"
                                    iconColor="primary-yellow"
                                    to={siteInfo.max_link}
                                />
                            )}
                            {siteInfo?.telegram_link && (
                                <Button
                                    size="lg"
                                    variant="outlined"
                                    theme="dark"
                                    onlyIcon
                                    icon="tg"
                                    iconColor="primary-yellow"
                                    to={siteInfo.telegram_link}
                                />
                            )}
                        </Flex>
                    </Flex>
                </Flex>
                <PercentageIcon />
            </VerticalMainContainer>

            <VerticalMainContainer>
                <div className={styles.bc}>
                    <BreadCrumbs breadcrumbs={breadcrumbs} />
                </div>
                <Container gap="regular" fullWidth>
                    <TwoColumnsContainer>
                        <Column direction="column" align="start" gap={40} fullWidth>
                            <Divider />
                            <Flex direction="row" align="baseline" gap={12}>
                                <Text variant="h2">
                                    {t('pages.agents.income.title')}{' '}
                                    <Text variant="h2" color="gray-50">
                                        {t('pages.agents.income.titleAccent')}
                                    </Text>
                                </Text>
                            </Flex>
                        </Column>
                        <Column direction="column" align="start" gap={40} fullWidth>
                            <Divider />
                            <Flex direction="column" align="start" gap={0}>
                                <Text variant="h2">{t('pages.agents.partner.title')}</Text>
                                <Text variant="h2" color="gray-50">
                                    {t('pages.agents.partner.titleAccent')}
                                </Text>
                            </Flex>
                        </Column>
                    </TwoColumnsContainer>
                    <div className={styles.benefits}>
                        {benefits.map(({ icon, text }, index) => (
                            <Flex key={index} align="start" gap={20}>
                                <Icon
                                    name={icon || 'sample'}
                                    size={32}
                                    color="primary-700"
                                    aria-hidden
                                />
                                <Text variant="20-reg">{text}</Text>
                            </Flex>
                        ))}
                    </div>
                </Container>

                <FeedbackFormRow ref={feedbackSectionRef} />
            </VerticalMainContainer>
        </Page>
    );
};
