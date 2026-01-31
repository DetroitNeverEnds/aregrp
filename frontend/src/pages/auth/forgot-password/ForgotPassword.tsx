import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { AuthForm } from '../../../components/ui/auth/AuthForm';
import { TextInput } from '../../../components/ui/common/input/TextInput';
import { Link } from '../../../components/ui/common/Link';
import { Text } from '../../../components/ui/common/Text';
import { Flex } from '../../../components/ui/common/Flex';
import { useRequestPasswordResetMutation } from '../../../mutations';

type ForgotPasswordFormData = {
    email: string;
};

export const ForgotPassword: React.FC = () => {
    const { t } = useTranslation();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { handleSubmit, control, formState, setError } = useForm<ForgotPasswordFormData>({
        defaultValues: {
            email: '',
        },
    });

    const { mutate: requestResetMutate, isPending } = useRequestPasswordResetMutation({
        onSuccess: data => {
            console.log('Письмо для сброса пароля отправлено');
            setSuccessMessage(data.message || t('auth.forgotPassword.successMessage'));
        },
        onError: error => {
            console.error('Ошибка запроса сброса пароля:', error);
            setError('root', {
                type: 'manual',
                message: t(`errors.${error.code}`),
            });
        },
    });

    const onSubmit = useCallback(
        (data: ForgotPasswordFormData) => {
            setSuccessMessage(null);
            requestResetMutate({ email: data.email });
        },
        [requestResetMutate],
    );

    return (
        <AuthForm
            title={t('auth.forgotPassword.title')}
            description={successMessage || t('auth.forgotPassword.description')}
            submitText={t('auth.forgotPassword.submit')}
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={isPending}
            errorMessage={formState.errors.root?.message}
            footer={
                <Flex gap={10} align="end">
                    <Text variant="16-reg" color="gray-50">
                        {t('auth.common.hasAccount')}{' '}
                        <Link to="/auth/login" size="lg" theme="black">
                            {t('auth.common.login')}
                        </Link>
                    </Text>
                    <Text variant="16-reg" color="gray-50">
                        {t('auth.common.noAccount')}{' '}
                        <Link to="/auth/register" size="lg" theme="black">
                            {t('auth.common.register')}
                        </Link>
                    </Text>
                </Flex>
            }
        >
            <Controller
                control={control}
                name="email"
                rules={{
                    required: t('auth.errors.fieldRequired'),
                }}
                render={({ field, fieldState }) => (
                    <TextInput
                        size="lg"
                        type="email"
                        placeholder={t('auth.placeholders.email')}
                        errorMessage={fieldState.error?.message}
                        {...field}
                    />
                )}
            />
        </AuthForm>
    );
};

export default ForgotPassword;
