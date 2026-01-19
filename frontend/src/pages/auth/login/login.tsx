import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '../../../components/ui/common/Link';
import { Button } from '../../../components/ui/common/Button';
import { TextInput } from '../../../components/ui/common/input/TextInput';
import { Checkbox } from '../../../components/ui/common/input/Checkbox';
import { Text } from '../../../components/ui/common/Text';
import styles from './Login.module.scss';
import { Divider } from '../../../components/ui/common/Divider';
import { Form } from '../../../components/ui/common/Form';
import { Controller, useForm } from 'react-hook-form';
import { Flex } from '../../../components/ui/common/Flex';

type PasswordFormData = {
    email: string;
    password: string;
    rememberMe: boolean;
};

export const Login: React.FC = () => {
    const { t } = useTranslation();
    const { handleSubmit, control, formState } = useForm<PasswordFormData>({
        defaultValues: { rememberMe: true },
    });
    const onSubmit = useCallback((data: PasswordFormData) => console.log(data), []);

    return (
        <Flex gap={20} fullWidth>
            <Form onSubmit={handleSubmit(onSubmit)} className={styles.login__form}>
                <Text variant="h3">{t('auth.login.title')}</Text>
                <Flex gap={20}>
                    <Flex gap={10}>
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
                    </Flex>
                    <div className={styles.login__form__input__options}>
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
                        <Link to="/forgot-password" size="lg" theme="black">
                            {t('auth.login.forgotPassword')}
                        </Link>
                    </div>
                </Flex>

                <Button
                    variant="primary"
                    size="lg"
                    width="max"
                    type="submit"
                    disabled={formState.isSubmitting || !formState.isReady}
                >
                    {t('auth.login.submit')}
                </Button>
            </Form>

            <Divider />

            <Flex align="end">
                <Text variant="16-reg" color="gray-50">
                    {t('auth.login.noAccount')}{' '}
                    <Link to="/auth/register" size="lg" theme="black">
                        {t('auth.login.registerLink')}
                    </Link>
                </Text>
            </Flex>
        </Flex>
    );
};

export default Login;
