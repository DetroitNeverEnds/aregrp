import { useTranslation } from 'react-i18next';
import { Flex } from '../../common/Flex';
import Text from '../../common/Text';
import { Column, TwoColumnsContainer } from '../TwoColumnsContainer';
import { FeedbackForm } from '../../forms/FeedbackForm';

import styles from './FeedbackFormRow.module.scss';

export const FeedbackFormRow = () => {
    const { t } = useTranslation();

    return (
        <TwoColumnsContainer>
            <Column>
                <Flex className={styles.formColumnContent} gap={80}>
                    <Flex gap={20} align="start">
                        <Text color="gray-50">{t('pages.contacts.planView')}</Text>
                        <Flex align="start">
                            <Text variant="h2">{t('pages.contacts.fillForm')}</Text>
                            <Text variant="h2" color="gray-50">
                                {t('pages.contacts.forDetails')}
                            </Text>
                        </Flex>
                    </Flex>
                    <FeedbackForm />
                </Flex>
            </Column>
            <Column className={styles.imgColumn} />
        </TwoColumnsContainer>
    );
};
