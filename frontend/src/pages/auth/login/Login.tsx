import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { AuthForm } from '../../../components/ui/auth/AuthForm';
import { TextInput } from '../../../components/ui/common/input/TextInput';
import { Checkbox } from '../../../components/ui/common/input/Checkbox';
import { Link } from '../../../components/ui/common/Link';
import { Text } from '../../../components/ui/common/Text';
import { Flex } from '../../../components/ui/common/Flex';

type LoginFormData = {
    email: string;
    password: string;
    rememberMe: boolean;
};

export const Login: React.FC = () => {
    const { t } = useTranslation();
    const { handleSubmit, control, formState } = useForm<LoginFormData>({
        defaultValues: {
            email: '',
            password: '',
            rememberMe: true,
        },
    });
    const onSubmit = useCallback((data: LoginFormData) => console.log(data), []);

    return (
        <AuthForm
            title={t('auth.login.title')}
            submitText={t('auth.login.submit')}
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={formState.isSubmitting}
            additionalOptionsLower={
                <Flex direction="row" justify="between">
                    <Controller
                        control={control}
                        name="rememberMe"
                        render={({ field: { value, ...fieldValues } }) => (
                            <Checkbox
                                size="lg"
                                label={t('auth.login.rememberMe')}
                                checked={value}
                                {...fieldValues}
                            />
                        )}
                    />
                    <Link to="/auth/forgot-password" size="lg" theme="black">
                        {t('auth.login.forgotPassword')}
                    </Link>
                </Flex>
            }
            footer={
                <Flex align="end">
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
                    required: t('auth.errors.emailRequired'),
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
            <Controller
                control={control}
                name="password"
                rules={{
                    required: t('auth.errors.passwordRequired'),
                }}
                render={({ field, fieldState }) => (
                    <TextInput
                        size="lg"
                        type="password"
                        placeholder={t('auth.placeholders.password')}
                        errorMessage={fieldState.error?.message}
                        {...field}
                    />
                )}
            />
        </AuthForm>
    );
};

export default Login;
