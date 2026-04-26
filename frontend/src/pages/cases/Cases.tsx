import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import type { LayoutSettings } from '@/components/ui/layout/MainLayout/Layout';

export const Cases = () => {
    const { t } = useTranslation();

    const layoutSettings = useMemo<LayoutSettings>(
        () => ({
            header: {
                theme: 'light',
                breadcrumbs: [
                    { to: '/', label: t('bc.main') },
                    { to: '/cases', label: t('header.cases') },
                ],
            },
            mainContentBackground: 'gray-0',
        }),
        [t],
    );
    useLayoutSettings(layoutSettings);

    return (
        <Flex justify="center" align="center" fullWidth>
            <Text variant="h2">Hello, world!</Text>
        </Flex>
    );
};
