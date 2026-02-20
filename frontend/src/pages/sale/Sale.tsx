import { useTranslation } from 'react-i18next';
import { Flex } from '../../components/ui/common/Flex';
import Text from '../../components/ui/common/Text';
import { useHeaderSettings } from '../../hooks/useHeaderSettings';
import { useMemo } from 'react';
import type { HeaderProps } from '../../components/ui/layout/MainLayout/Header';

export const Sale = () => {
    const { t } = useTranslation();
    const headerSettings: HeaderProps = useMemo(
        () => ({
            theme: 'light',
            breadcrumbs: [
                { to: '/', label: t('bc.main') },
                { to: '/sale', label: t('header.sale') },
            ],
        }),
        [t],
    );
    useHeaderSettings(headerSettings);
    return (
        <Flex justify="center" align="center" fullWidth>
            <Text variant="h2">Hello, world!</Text>
        </Flex>
    );
};
