import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';
import type { UserData } from '@/api';

export const ProfileMainInfoView = ({ user }: { user: UserData }) => {
    const { t } = useTranslation();

    const infoItems = useMemo(
        () =>
            user.user_type === 'agent'
                ? [
                      { label: t('pages.profile.orgNameLabel'), value: user.organization_name },
                      { label: t('pages.profile.phoneLabel'), value: user.phone },
                      { label: t('pages.profile.innLabel'), value: user.inn },
                  ]
                : [
                      { label: t('pages.profile.fullNameLabel'), value: user.full_name },
                      { label: t('pages.profile.phoneLabel'), value: user.phone },
                  ],
        [user, t],
    );

    return (
        <Flex direction="column" gap={24} align="start" fullWidth>
            {infoItems.map(item => (
                <Flex direction="row" gap={8} align="start" key={item.label}>
                    <Text variant="14-reg">
                        {item.label}: {item.value?.trim()}
                    </Text>
                </Flex>
            ))}
        </Flex>
    );
};
