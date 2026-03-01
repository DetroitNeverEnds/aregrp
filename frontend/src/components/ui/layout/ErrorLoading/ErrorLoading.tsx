import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';
import { useTranslation } from 'react-i18next';

import styles from './ErrorLoading.module.scss';

export const ErrorLoading = (props: { message: string }) => {
    const { t } = useTranslation();
    return (
        <Flex align="center" justify="center" fullWidth className={styles.container}>
            <Text variant="24-reg" color="error-default">
                {t('layout.errorLoading')}: {props.message}
            </Text>
        </Flex>
    );
};
