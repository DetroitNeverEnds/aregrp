import { Button } from '@/components/ui/common/Button';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';
import { useTranslation } from 'react-i18next';

import styles from './ErrorLoading.module.scss';

type Props = {
    message: string;
    onRetry?: () => void;
};

export const ErrorLoading = (props: Props) => {
    const { t } = useTranslation();

    return (
        <Flex justify="center" fullWidth className={styles.container} direction="column" gap={16}>
            <Text variant="24-reg" color="error-default">
                {t('layout.errorLoading')}: {props.message}
            </Text>
            {props.onRetry && (
                <Button variant="outlined" onClick={props.onRetry}>
                    {t('common.retry', 'Повторить')}
                </Button>
            )}
        </Flex>
    );
};
