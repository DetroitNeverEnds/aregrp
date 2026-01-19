import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '../../../components/ui/common/Link';
import { Button } from '../../../components/ui/common/Button';
import { TextInput } from '../../../components/ui/common/input/TextInput';
import { Checkbox } from '../../../components/ui/common/input/Checkbox';
import { Text } from '../../../components/ui/common/Text';
import styles from './Register.module.scss';
import { Divider } from '../../../components/ui/common/Divider';
import { Form } from '../../../components/ui/common/Form';
import { Controller, useForm } from 'react-hook-form';
import { Flex } from '../../../components/ui/common/Flex';

type PasswordFormData = {
    // physical
    name: string;
    // agent
    organisationName: string;
    INN: string;

    // common
    email: string;
    phone: string;
    password1: string;
    password2: string;

    // other
    policyAggrement: boolean;
};

type RegisterTypeChoice = 'physical' | 'agent';

export const Register: React.FC = () => {
    const { t } = useTranslation();
    const { handleSubmit, control, formState } = useForm<PasswordFormData>();
    const [registerTypeChoice, setRegisterTypeChoice] = useState<RegisterTypeChoice>('physical');
    const onSubmit = useCallback((data: PasswordFormData) => console.log(data), []);

    return (
        <Flex gap={20} fullWidth>
            <Form onSubmit={handleSubmit(onSubmit)} className={styles.login__form}>
                <Text variant="h3">{t('auth.register.title')}</Text>
                <Flex gap={20}>
                    <Flex gap={10}>
                        {registerTypeChoice === 'physical' && (
                            <>
                                <Controller
                                    control={control}
                                    name="name"
                                    rules={{
                                        required: t('auth.errors.fieldRequired'),
                                    }}
                                    render={({ field, fieldState }) => (
                                        <TextInput
                                            size="lg"
                                            type="text"
                                            placeholder={t('auth.placeholders.name')}
                                            errorMessage={fieldState.error?.message}
                                            {...field}
                                        />
                                    )}
                                />
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
                                <Controller
                                    control={control}
                                    name="phone"
                                    rules={{
                                        required: t('auth.errors.fieldRequired'),
                                    }}
                                    render={({ field, fieldState }) => (
                                        <TextInput
                                            size="lg"
                                            type="tel"
                                            placeholder={t('auth.placeholders.phone')}
                                            errorMessage={fieldState.error?.message}
                                            {...field}
                                        />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="password1"
                                    rules={{
                                        required: t('auth.errors.fieldRequired'),
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
                                <Controller
                                    control={control}
                                    name="password2"
                                    rules={{
                                        required: t('auth.errors.fieldRequired'),
                                    }}
                                    render={({ field, fieldState }) => (
                                        <TextInput
                                            size="lg"
                                            type="password"
                                            placeholder={t('auth.placeholders.confirmPassword')}
                                            errorMessage={fieldState.error?.message}
                                            {...field}
                                        />
                                    )}
                                />
                            </>
                        )}
                    </Flex>
                    <div className={styles.login__form__input__options}>
                        <Controller
                            control={control}
                            name="policyAggrement"
                            rules={{
                                validate: value =>
                                    value !== true && t('auth.errors.policyAggrementRequired'),
                            }}
                            render={({ field: { value, ...fieldValues }, fieldState }) => (
                                <Checkbox
                                    size="lg"
                                    label={
                                        <Text variant="14-reg">
                                            {t('auth.register.policyAggrement.text')}{' '}
                                            <Link to="/policy" size="md">
                                                {t('auth.register.policyAggrement.link')}
                                            </Link>
                                        </Text>
                                    }
                                    checked={value}
                                    {...fieldValues}
                                    errorMessage={fieldState.error?.message}
                                />
                            )}
                        />
                    </div>
                </Flex>

                <Button
                    variant="primary"
                    size="lg"
                    width="max"
                    type="submit"
                    disabled={formState.isSubmitting || !formState.isReady}
                >
                    {t('auth.register.submit')}
                </Button>
            </Form>

            <Divider />

            <Flex align="end">
                <Text variant="16-reg" color="gray-50">
                    {t('auth.register.hasAccount')}{' '}
                    <Link to="/auth/login" size="lg" theme="black">
                        {t('auth.register.loginLink')}
                    </Link>
                </Text>
            </Flex>
        </Flex>
    );
};

export default Register;
