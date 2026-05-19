import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';
import { Button } from '@/components/ui/common/Button';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import type { LayoutSettings } from '@/components/ui/layout/MainLayout/Layout';
import { Page } from '@/components/ui/layout/Page/Page';
import { VerticalMainContainer } from '@/components/ui/layout/VerticalMainContainer';
import styles from './NotFound.module.scss';

const layoutSettings: LayoutSettings = {
    header: {
        theme: 'light',
        breadcrumbs: [],
    },
    mainContentBackground: 'gray-0',
};

export const NotFound = () => {
    const { t } = useTranslation();

    useLayoutSettings(layoutSettings);

    return (
        <Page>
            <VerticalMainContainer>
                <Flex className={styles.container} direction="column" align="center" justify="center">
                    <Flex className={styles.content} direction="column" align="center" gap={24}>
                        <Text className={styles.content__code} variant="h1" color="gray-20">
                            404
                        </Text>
                        <Flex direction="column" align="center" gap={12}>
                            <Text variant="h2" align="center">
                                {t('pages.notFound.title')}
                            </Text>
                            <Text variant="20-reg" color="gray-50" align="center">
                                {t('pages.notFound.subtitle')}
                            </Text>
                        </Flex>
                        <Button to="/" size="lg" variant="primary">
                            {t('pages.notFound.backHome')}
                        </Button>
                    </Flex>
                </Flex>
            </VerticalMainContainer>
        </Page>
    );
};
