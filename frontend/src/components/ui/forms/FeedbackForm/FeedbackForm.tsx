import { Controller, useForm } from 'react-hook-form';
import { Flex } from '@/components/ui/common/Flex';
import Form from '@/components/ui/common/Form';
import { TextInput } from '@/components/ui/common/input/TextInput';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/common/Button';
import { Text } from '@/components/ui/common/Text';
import { useSendFeedbackMutation } from '@/mutations';
import { Loader } from '@/components/ui/common/Loader';

import styles from './FeedbackForm.module.scss';

export type FeedbackData = {
    name: string;
    phone: string;
};

export type FeedbackFormProps = {
    originKey: string;
};

export const FeedbackForm = ({ originKey }: FeedbackFormProps) => {
    const { t } = useTranslation();

    const [isSubmitted, setIsSubmitted] = useState(false);
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FeedbackData>({
        defaultValues: { name: '', phone: '' },
    });

    const sendFeedbackM = useSendFeedbackMutation({
        onSuccess: () => {
            setIsSubmitted(true);
            reset();
        },
    });

    const submit = useCallback(
        (data: FeedbackData) => {
            sendFeedbackM.mutate({
                ...data,
                subject: `Frredback from form '${originKey}'`,
                origin: {
                    key: originKey,
                    url: window.location.href,
                },
            });
        },
        [sendFeedbackM, originKey],
    );

    if (isSubmitted) {
        return (
            <Text variant="20-reg" color="primary-800">
                {t('common.feedbackSuccess', 'Спасибо! Ваше сообщение принято.')}
            </Text>
        );
    }

    return (
        <Form onSubmit={handleSubmit(submit)} className={styles.form}>
            <Flex gap={40} fullWidth>
                <Flex gap={16} fullWidth>
                    <Controller
                        name="name"
                        control={control}
                        rules={{ required: t('forms.errors.fieldRequired') }}
                        render={({ field, fieldState }) => (
                            <TextInput
                                size="lg"
                                {...field}
                                errorMessage={fieldState.error?.message}
                                placeholder={t('common.name')}
                            />
                        )}
                    />
                    <Controller
                        name="phone"
                        control={control}
                        rules={{ required: t('forms.errors.fieldRequired') }}
                        render={({ field, fieldState }) => (
                            <TextInput
                                size="lg"
                                {...field}
                                errorMessage={fieldState.error?.message}
                                placeholder={t('common.phone')}
                            />
                        )}
                    />
                    {errors.root?.message && (
                        <Text color="error-default">{errors.root?.message}</Text>
                    )}
                </Flex>
                <Button size="lg" width="max" type="submit">
                    {t('common.send')}
                </Button>
            </Flex>
            {sendFeedbackM.isPending && <Loader variant="overlay" />}
        </Form>
    );
};
