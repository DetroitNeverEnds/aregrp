import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { AuthForm } from '../../../components/ui/auth/AuthForm';
import { TextInput } from '../../../components/ui/common/input/TextInput';
import { Checkbox } from '../../../components/ui/common/input/Checkbox';
import { Link } from '../../../components/ui/common/Link';
import { Text } from '../../../components/ui/common/Text';
import { Flex } from '../../../components/ui/common/Flex';

type RegisterFormData = {
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
    policyAgrement: boolean;
};

type RegisterTypeChoice = 'physical' | 'agent';

export const Register: React.FC = () => {
    const { t } = useTranslation();
    const { handleSubmit, control, formState } = useForm<RegisterFormData>({
        defaultValues: {
            name: '',
            organisationName: '',
            INN: '',
            email: '',
            phone: '',
            password1: '',
            password2: '',
            policyAgrement: false,
        },
    });
    // TODO: Choice for agent
    const [registerTypeChoice, _] = useState<RegisterTypeChoice>('physical');
    const onSubmit = useCallback((data: RegisterFormData) => console.log(data), []);

    return (
        <AuthForm
            title={t('auth.register.title')}
            submitText={t('auth.register.submit')}
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={formState.isSubmitting}
            additionalOptions={
                <Controller
                    control={control}
                    name="policyAgrement"
                    rules={{
                        required: t('auth.errors.policyAgrementRequired'),
                    }}
                    render={({ field: { value, ...fieldValues }, fieldState }) => (
                        <Checkbox
                            size="lg"
                            label={
                                <Text variant="14-reg">
                                    {t('auth.register.policyAgrement.text')}{' '}
                                    <Link to="/policy" size="md">
                                        {t('auth.register.policyAgrement.link')}
                                    </Link>
                                </Text>
                            }
                            checked={value}
                            errorMessage={fieldState.error?.message}
                            {...fieldValues}
                        />
                    )}
                />
            }
            footer={
                <Flex align="end">
                    <Text variant="16-reg" color="gray-50">
                        {t('auth.register.hasAccount')}{' '}
                        <Link to="/auth/login" size="lg" theme="black">
                            {t('auth.register.loginLink')}
                        </Link>
                    </Text>
                </Flex>
            }
        >
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
        </AuthForm>
    );
};

export default Register;
