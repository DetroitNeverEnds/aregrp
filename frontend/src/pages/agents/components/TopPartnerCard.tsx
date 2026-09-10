import { useTranslation } from 'react-i18next';
import type { AgentPartnerOut } from '@/api/handlers/siteSettings/agents';
import { Card } from '@/components/ui/common/Card/Card';
import { Divider } from '@/components/ui/common/Divider';
import { Flex } from '@/components/ui/common/Flex';
import { Icon } from '@/components/ui/common/Icon';
import Text from '@/components/ui/common/Text';
import { formatDealsCount } from './formatDealsCount';
import styles from './TopPartnerCard.module.scss';

export type TopPartnerCardProps = {
    partner: AgentPartnerOut;
    rank: number;
};

export const TopPartnerCard = ({ partner, rank }: TopPartnerCardProps) => {
    const { t } = useTranslation();

    return (
        <Card
            size="m"
            withShadow
            direction="column"
            gap={10}
            fullWidth
            className={styles.partnerCard}
        >
            <Card className={styles.partnerCard__rank} align="center" justify="center">
                <Text variant="24-med">{`${rank}`.padStart(2, '0')}</Text>
            </Card>

            <div className={styles.partnerCard__photoWrap}>
                {partner.photo ? (
                    <img
                        src={partner.photo}
                        alt={partner.full_name}
                        className={styles.partnerCard__photo}
                    />
                ) : (
                    <Flex
                        align="center"
                        justify="center"
                        className={styles.partnerCard__photoFallback}
                    >
                        <Icon name="user-simple" size={50} color="gray-50" />
                    </Flex>
                )}
            </div>

            <Flex
                direction="column"
                gap={8}
                className={styles.partnerCard__content}
                fullWidth
                align="start"
            >
                <Text variant="16-med" color="primary-700">
                    {partner.full_name}
                </Text>
                <Divider color="gray-30" />
                <Text variant="14-reg">{formatDealsCount(partner.deals_count, t)}</Text>
            </Flex>
        </Card>
    );
};
