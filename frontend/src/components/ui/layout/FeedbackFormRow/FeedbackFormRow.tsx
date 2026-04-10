import { useTranslation } from 'react-i18next';
import { Flex } from '../../common/Flex';
import Text from '../../common/Text';
import { Column, TwoColumnsContainer } from '../TwoColumnsContainer';
import { FeedbackForm } from '../../forms/FeedbackForm';

import styles from './FeedbackFormRow.module.scss';
import { forwardRef } from 'react';

export type FeedbackFormRowProps = {
    originKey: string;
};

export const FeedbackFormRow = forwardRef<HTMLDivElement, FeedbackFormRowProps>(
    ({ originKey }, ref) => {
        const { t } = useTranslation();

        return (
            <TwoColumnsContainer ref={ref}>
                <Column>
                    <Flex align="start" className={styles.formColumnContent} gap={80}>
                        <Flex gap={20} align="start">
                            <Text color="gray-50">{t('pages.contacts.planView')}</Text>
                            <Text variant="h2">
                                {t('pages.contacts.fillForm')}{' '}
                                <Text variant="h2" color="gray-50">
                                    {t('pages.contacts.forDetails')}
                                </Text>
                            </Text>
                        </Flex>
                        <FeedbackForm originKey={originKey} />
                    </Flex>
                </Column>
                <Column className={styles.imgColumn} />
            </TwoColumnsContainer>
        );
    },
);
