import { Divider } from '@/components/ui/common/Divider';
import { Flex } from '@/components/ui/common/Flex';
import { Icon, type IconName } from '@/components/ui/common/Icon';
import Text from '@/components/ui/common/Text';
import { FeatureCard } from '@/components/ui/layout/Container';
import { Column } from '@/components/ui/layout/Column';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Columns } from '@/components/ui/layout/Columns';

import commonStyles from '@/styles/breakpoint-utilities.module.scss';

type Variant = 'working' | 'sale';
export type BenefitsProps = {
    variant: Variant;
};

type BenifitConfig = {
    title: string;
    subtitle: string;
    description: string;
    items: {
        icon: IconName;
        title: string;
        subtitle?: string;
    }[];
};

export const Benefits = (props: BenefitsProps) => {
    const { t } = useTranslation();
    const benefit: BenifitConfig = useMemo(
        () =>
            ({
                working: {
                    title: t('benefits.working.title'),
                    subtitle: t('benefits.working.subtitle'),
                    description: t('benefits.working.description'),
                    items: [
                        {
                            icon: 'benefit-1',
                            title: t('benefits.working.items.designerRepair'),
                        },
                        {
                            icon: 'benefit-2',
                            title: t('benefits.working.items.wetPoint'),
                        },
                        {
                            icon: 'benefit-3',
                            title: t('benefits.working.items.accessibleLocation'),
                        },
                        {
                            icon: 'benefit-4',
                            title: t('benefits.working.items.cleanDeal'),
                        },
                    ],
                } as BenifitConfig,
                sale: {
                    title: t('benefits.sale.title'),
                    subtitle: t('benefits.sale.subtitle'),
                    description: t('benefits.sale.description'),
                    items: [
                        {
                            icon: 'benefit-8',
                            title: t('benefits.sale.items.highLiquidity.title'),
                            subtitle: t('benefits.sale.items.highLiquidity.subtitle'),
                        },
                        {
                            icon: 'benefit-7',
                            title: t('benefits.sale.items.longTermAsset.title'),
                            subtitle: t('benefits.sale.items.longTermAsset.subtitle'),
                        },
                        {
                            icon: 'benefit-5',
                            title: t('benefits.sale.items.stableIncome.title'),
                            subtitle: t('benefits.sale.items.stableIncome.subtitle'),
                        },
                        {
                            icon: 'benefit-6',
                            title: t('benefits.sale.items.noRent.title'),
                            subtitle: t('benefits.sale.items.noRent.subtitle'),
                        },
                    ],
                } as BenifitConfig,
            })[props.variant],
        [props.variant, t],
    );

    return (
        <FeatureCard gap={80}>
            <Columns rowsNum={2}>
                <Column gap={40} style={{ width: '768px' }}>
                    <Divider className={commonStyles.desktopOnly} />
                    <Text variant="h2" wrap>
                        {benefit.title}
                    </Text>
                    {/* <Text className={commonStyles.mobileOnly} variant="h5" wrap>
                        {benefit.title}
                    </Text> */}
                </Column>
                <Column gap={40}>
                    <Divider />
                    <Flex gap={20} fullWidth align="start">
                        <Text variant="18-reg">{benefit.subtitle}</Text>
                        <Text variant="20-med" color="primary-yellow">
                            {benefit.description}
                        </Text>
                    </Flex>
                </Column>
            </Columns>
            <Columns rowsNum={4}>
                {benefit.items.map((benefit, index) => (
                    <Column key={index} gap={20} align="start">
                        <Icon name={benefit.icon} size={32} color="primary-yellow" />
                        {benefit.subtitle && (
                            <Text variant="20-reg" color="gray-50">
                                {benefit.subtitle}
                            </Text>
                        )}
                        <Text variant="20-reg">{benefit.title}</Text>
                    </Column>
                ))}
            </Columns>
        </FeatureCard>
    );
};
