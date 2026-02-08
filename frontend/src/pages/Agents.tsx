import { useTranslation } from 'react-i18next';
import { Flex } from '../components/ui/common/Flex';
import Text from '../components/ui/common/Text';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';
import { useMemo } from 'react';

export const Agents = () => {
    const { t } = useTranslation();
    const bc = useMemo(
        () => [
            { to: '/', label: t('bc.main') },
            { to: '/agents', label: t('header.agents') },
        ],
        [t],
    );
    useBreadcrumbs(bc);
    return (
        <Flex justify="center" align="center" fullWidth>
            <Text variant="h2">Hello, world!</Text>
        </Flex>
    );
};
