import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { AuthForm } from '../../../components/ui/auth/AuthForm';
import { TextInput } from '../../../components/ui/common/input/TextInput';
import { Link } from '../../../components/ui/common/Link';
import { Text } from '../../../components/ui/common/Text';
import { Flex } from '../../../components/ui/common/Flex';

type ForgotPasswordFormData = {
    email: string;
};

export const ForgotPassword: React.FC = () => {
    const { t } = useTranslation();
    const { handleSubmit, control, formState } = useForm<ForgotPasswordFormData>();
    const onSubmit = useCallback((data: ForgotPasswordFormData) => console.log(data), []);

    return (
        <AuthForm
            title={t('auth.forgotPassword.title')}
            description={t('auth.forgotPassword.description')}
            submitText={t('auth.forgotPassword.submit')}
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={formState.isSubmitting}
            footer={
                <Flex gap={10} align="end">
                    <Text variant="16-reg" color="gray-50">
                        {t('auth.forgotPassword.hasAccount')}{' '}
                        <Link to="/auth/login" size="lg" theme="black">
                            {t('auth.forgotPassword.loginLink')}
                        </Link>
                    </Text>
                    <Text variant="16-reg" color="gray-50">
                        {t('auth.forgotPassword.noAccount')}{' '}
                        <Link to="/auth/register" size="lg" theme="black">
                            {t('auth.forgotPassword.registerLink')}
                        </Link>
                    </Text>
                </Flex>
            }
        >
            <Controller
                control={control}
                name="email"
                rules={{
                    required: t('auth.errors.emailRequired'),
                    pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: t('auth.errors.emailInvalid'),
                    },
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
