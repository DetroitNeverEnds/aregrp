import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { AuthForm } from '../../../components/ui/auth/AuthForm';
import { TextInput } from '../../../components/ui/common/input/TextInput';
import { Checkbox } from '../../../components/ui/common/input/Checkbox';
import { Link } from '../../../components/ui/common/Link';
import { Text } from '../../../components/ui/common/Text';
import { Flex } from '../../../components/ui/common/Flex';
import RadioButtons from '../../../components/ui/common/input/RadioButtons';

type RegisterTypeChoice = 'physical' | 'agent';

type RegisterFormData = {
    registerType: RegisterTypeChoice;

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

export const Register: React.FC = () => {
    const { t } = useTranslation();
    const { handleSubmit, control, formState, setValue, watch } = useForm<RegisterFormData>({
        defaultValues: {
            registerType: 'physical',
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
    const onSubmit = useCallback((data: RegisterFormData) => console.log(data), []);

    const changeRegisterTypeChoice = useCallback(
        (type: RegisterTypeChoice) => {
            switch (type) {
                case 'physical':
                    setValue('organisationName', '');
                    setValue('INN', '');
                    break;
                case 'agent':
                    setValue('name', '');
                    break;
            }
            setValue('registerType', type);
        },
        [setValue],
    );

    // eslint-disable-next-line react-hooks/incompatible-library
    const registerType = watch('registerType');

    return (
        <AuthForm
            title={t('auth.register.title')}
            submitText={t('auth.register.submit')}
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={formState.isSubmitting}
            additionalOptionsUpper={
                <Controller
                    control={control}
                    name="registerType"
                    render={({ field, fieldState }) => (
                        <RadioButtons
                            size="md"
                            direction="horizontal"
                            errorMessage={fieldState.error?.message}
                            options={[
                                {
                                    value: 'physical',
                                    label: 'Физическое лицо',
                                },
                                {
                                    value: 'agent',
                                    label: 'Агент',
                                },
                            ]}
                            {...field}
                            onChange={val => changeRegisterTypeChoice(val as RegisterTypeChoice)}
                        />
                    )}
                />
            }
            additionalOptionsLower={
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
                        {t('auth.common.hasAccount')}{' '}
                        <Link to="/auth/login" size="lg" theme="black">
                            {t('auth.common.login')}
                        </Link>
                    </Text>
                </Flex>
            }
        >
            <Flex gap={10}>
                {}
                {registerType === 'physical' && (
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
                    </>
                )}

                {registerType === 'agent' && (
                    <>
                        <Controller
                            control={control}
                            name="organisationName"
                            rules={{
                                required: t('auth.errors.fieldRequired'),
                            }}
                            render={({ field, fieldState }) => (
                                <TextInput
                                    size="lg"
                                    type="text"
                                    placeholder={t('auth.placeholders.organisationName')}
                                    errorMessage={fieldState.error?.message}
                                    {...field}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="INN"
                            rules={{
                                required: t('auth.errors.fieldRequired'),
                            }}
                            render={({ field, fieldState }) => (
                                <TextInput
                                    size="lg"
                                    type="text"
                                    placeholder={t('auth.placeholders.INN')}
                                    errorMessage={fieldState.error?.message}
                                    {...field}
                                />
                            )}
                        />
                    </>
                )}
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
            </Flex>
        </AuthForm>
    );
};

export default Register;
