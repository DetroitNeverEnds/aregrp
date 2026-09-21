import { useTranslation } from 'react-i18next';
import type { AgentSettingsOut } from '@/api/handlers/siteSettings/agents';
import { Card } from '@/components/ui/common/Card/Card';
import { Flex } from '@/components/ui/common/Flex';
import { Icon, type IconName } from '@/components/ui/common/Icon';
import Text from '@/components/ui/common/Text';
import Container from '@/components/ui/layout/Container';
import { Columns } from '@/components/ui/layout/Columns';
import { QueryBoundary } from '@/components/ui/layout/QueryBoundary/QueryBoundary';
import { useAgentSettings } from '@/queries';
import { TopPartnerCard } from './TopPartnerCard';
import styles from '../Agents.module.scss';
import { useMemo } from 'react';
import { useIsDesktop } from '@/hooks';

const CheckListItem = ({ text }: { text: string }) => (
    <Flex align="start" gap={8} direction="row" fullWidth>
        <Icon name="check" size={32} color="primary-yellow" />
        <Text variant="20-reg">{text}</Text>
    </Flex>
);

const TopPartnersContent = ({ data }: { data: AgentSettingsOut }) => {
    const { t } = useTranslation();
    const isDesktop = useIsDesktop();

    const partners = data.partners ?? [];
    const cardsData = useMemo(
        () =>
            [
                {
                    title: t('pages.agents.topPartners.advantagesTitle'),
                    icon: 'benefit-10',
                    items: data.dealer_advantages ?? [],
                },
                {
                    title: t('pages.agents.topPartners.dutiesTitle'),
                    icon: 'benefit-11',
                    items: data.dealer_duties ?? [],
                },
            ] as { title: string; icon: IconName; items: string[] }[],
        [data.dealer_advantages, data.dealer_duties, t],
    );

    return (
        <Container gap="secondary" fullWidth className={styles.topPartners} align="start">
            <Flex direction="column" gap={16} fullWidth align="start">
                <Text variant="h2">{t('pages.agents.topPartners.title')}</Text>
                {/* <Text variant="20-reg" color="gray-50">
                    {t('pages.agents.topPartners.subtitle')}
                </Text> */}
            </Flex>

            {partners.length && (
                <div className={styles.topPartners__grid}>
                    {partners.map((partner, index) => (
                        <TopPartnerCard
                            key={`${partner.full_name}-${index}`}
                            partner={partner}
                            rank={index + 1}
                        />
                    ))}
                </div>
            )}

            <Columns columnssNum={2} className={styles.topPartners__infoBlocks}>
                {cardsData.map(card => (
                    <Card key={card.title} withShadow gap={30} size="xl" fullWidth align="start">
                        <Flex align="center" direction="row" gap={20}>
                            <Icon name={card.icon} size={50} color="primary-700" />
                            <Text variant={isDesktop ? 'h3' : 'h4'} color="primary-700">
                                {card.title}
                            </Text>
                        </Flex>
                        <Flex direction="column" gap={20} align="start" fullWidth>
                            {card.items.map(text => (
                                <CheckListItem key={text} text={text} />
                            ))}
                        </Flex>
                    </Card>
                ))}
            </Columns>
        </Container>
    );
};

export const TopPartnersSection = () => {
    const agentSettingsQ = useAgentSettings();

    return (
        <QueryBoundary
            query={agentSettingsQ}
            onRetry="default"
            render={data => <TopPartnersContent data={data} />}
        />
    );
};
