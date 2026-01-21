import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { AuthForm } from '../../../components/ui/auth/AuthForm';
import { TextInput } from '../../../components/ui/common/input/TextInput';
import { Link } from '../../../components/ui/common/Link';
import { Text } from '../../../components/ui/common/Text';
import { Flex } from '../../../components/ui/common/Flex';

type RestorePasswordFormData = {
    newPassword1: string;
    newPassword2: string;
};

export const RestorePassword: React.FC = () => {
    const { t } = useTranslation();
    const { handleSubmit, control, formState } = useForm<RestorePasswordFormData>({
        defaultValues: {
            newPassword1: '',
            newPassword2: '',
        },
    });
    const onSubmit = useCallback((data: RestorePasswordFormData) => console.log(data), []);

    return (
        <AuthForm
            title={t('auth.restorePassword.title')}
            description={t('auth.restorePassword.description')}
            submitText={t('auth.restorePassword.submit')}
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={formState.isSubmitting}
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
                name="newPassword1"
                rules={{
                    required: t('auth.errors.fieldRequired'),
                }}
                render={({ field, fieldState }) => (
                    <TextInput
                        size="lg"
                        type="email"
                        placeholder={t('auth.placeholders.newPassword')}
                        errorMessage={fieldState.error?.message}
                        {...field}
                    />
                )}
            />
            <Controller
                control={control}
                name="newPassword2"
                rules={{
                    required: t('auth.errors.fieldRequired'),
                }}
                render={({ field, fieldState }) => (
                    <TextInput
                        size="lg"
                        type="email"
                        placeholder={t('auth.placeholders.confirmNewPassword')}
                        errorMessage={fieldState.error?.message}
                        {...field}
                    />
                )}
            />
        </AuthForm>
    );
};

export default RestorePassword;
