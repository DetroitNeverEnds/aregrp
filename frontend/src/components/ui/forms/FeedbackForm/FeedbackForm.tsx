import { Controller, useForm } from 'react-hook-form';
import { Flex } from '../../common/Flex';
import Form from '../../common/Form';
import { TextInput } from '../../common/input/TextInput';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../common/Button';
import { Text } from '../../common/Text';

export type FeedbackData = {
    email: string;
    phone: string;
};

export const FeedbackForm = () => {
    const { t } = useTranslation();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { control, handleSubmit, reset } = useForm<FeedbackData>({
        defaultValues: { email: '', phone: '' },
    });
    const submit = useCallback(
        (data: FeedbackData) => {
            // Пока форма только логирует данные. Интеграция с API — в следующих итерациях.
            console.log('Feedback submitted:', data);
            setIsSubmitted(true);
            reset();
        },
        [reset],
    );
    if (isSubmitted) {
        return (
            <Text variant="20-reg" color="primary-800">
                {t('common.feedbackSuccess', 'Спасибо! Ваше сообщение принято.')}
            </Text>
        );
    }
    return (
        <Form onSubmit={handleSubmit(submit)}>
            <Flex gap={40} fullWidth>
                <Flex gap={16} fullWidth>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextInput
                                size="lg"
                                {...field}
                                errorMessage={fieldState.error?.message}
                                placeholder={t('common.email')}
                            />
                        )}
                    />
                    <Controller
                        name="phone"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextInput
                                size="lg"
                                {...field}
                                errorMessage={fieldState.error?.message}
                                placeholder={t('common.phone')}
                            />
                        )}
                    />
                </Flex>
                <Button size="lg" width="max">
                    {t('common.send')}
                </Button>
            </Flex>
        </Form>
    );
};
