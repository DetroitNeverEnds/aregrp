import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { AuthForm } from '../../../components/ui/auth/AuthForm';
import { TextInput } from '../../../components/ui/common/input/TextInput';
import { Link } from '../../../components/ui/common/Link';
import { Text } from '../../../components/ui/common/Text';
import { Flex } from '../../../components/ui/common/Flex';
import { useConfirmPasswordResetMutation } from '../../../mutations';

type RestorePasswordFormData = {
    newPassword1: string;
    newPassword2: string;
};

export const RestorePassword: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';

    const { handleSubmit, control, formState, setError } = useForm<RestorePasswordFormData>({
        defaultValues: {
            newPassword1: '',
            newPassword2: '',
        },
    });

    const { mutate: confirmResetMutate, isPending } = useConfirmPasswordResetMutation({
        onSuccess: data => {
            console.log('Пароль успешно изменен:', data.message);
            navigate('/auth/login');
        },
        onError: error => {
            console.error('Ошибка сброса пароля:', error);
            setError('root', {
                type: 'manual',
                message: t(`errors.${error.code}`),
            });
        },
    });

    const onSubmit = useCallback(
        (data: RestorePasswordFormData) => {
            if (!token) {
                setError('root', {
                    type: 'manual',
                    message: t('auth.errors.invalidToken'),
                });
                return;
            }

            confirmResetMutate({
                token,
                new_password1: data.newPassword1,
                new_password2: data.newPassword2,
            });
        },
        [confirmResetMutate, token, setError, t],
    );

    return (
        <AuthForm
            title={t('auth.restorePassword.title')}
            description={t('auth.restorePassword.description')}
            submitText={t('auth.restorePassword.submit')}
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={isPending}
            errorMessage={formState.errors.root?.message}
            footer={
                <Flex gap={10} align="end" fullWidth>
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
                        type="password"
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
                        type="password"
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
