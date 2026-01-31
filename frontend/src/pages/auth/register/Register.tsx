import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { AuthForm } from '../../../components/ui/auth/AuthForm';
import { TextInput } from '../../../components/ui/common/input/TextInput';
import { Checkbox } from '../../../components/ui/common/input/Checkbox';
import { Link } from '../../../components/ui/common/Link';
import { Text } from '../../../components/ui/common/Text';
import { Flex } from '../../../components/ui/common/Flex';
import RadioButtons from '../../../components/ui/common/input/RadioButtons';
import { useRegisterMutation } from '../../../mutations';
import type { RegisterMutationData, UserType } from '../../../mutations/auth';

type RegisterFormData = RegisterMutationData;

export const Register: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { handleSubmit, control, setValue, watch, setError } = useForm<RegisterFormData>({
        defaultValues: {
            userType: 'individual',
            fullName: '',
            organisationName: '',
            INN: '',
            email: '',
            phone: '',
            password1: '',
            password2: '',
            policyAgrement: false,
        },
    });

    const { mutate: registerMutate, isPending } = useRegisterMutation({
        onSuccess: data => {
            console.log('Регистрация успешна:', data.user);
            // TODO: Сохранить токены и данные пользователя
            navigate('/');
        },
        onError: error => {
            console.error('Ошибка регистрации:', error);
            setError('root', {
                type: 'manual',
                message: t(`errors.${error.code}`),
            });
        },
    });

    const onSubmit = useCallback(
        (data: RegisterFormData) => {
            registerMutate(data);
        },
        [registerMutate],
    );

    const changeRegisterTypeChoice = useCallback(
        (type: UserType) => {
            switch (type) {
                case 'individual':
                    setValue('fullName', '');
                    break;
                case 'agent':
                    setValue('organisationName', '');
                    setValue('INN', '');
                    break;
            }
            setValue('userType', type);
        },
        [setValue],
    );

    // eslint-disable-next-line react-hooks/incompatible-library
    const userType = watch('userType');

    return (
        <AuthForm
            title={t('auth.register.title')}
            submitText={t('auth.register.submit')}
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={isPending}
            additionalOptionsUpper={
                <Controller
                    control={control}
                    name="userType"
                    render={({ field, fieldState }) => (
                        <RadioButtons
                            size="lg"
                            direction="horizontal"
                            errorMessage={fieldState.error?.message}
                            options={[
                                {
                                    value: 'individual',
                                    label: 'Физическое лицо',
                                },
                                {
                                    value: 'agent',
                                    label: 'Агент',
                                },
                            ]}
                            {...field}
                            onChange={val => changeRegisterTypeChoice(val as UserType)}
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
                {userType === 'individual' && (
                    <>
                        <Controller
                            control={control}
                            name="fullName"
                            rules={{
                                required: t('auth.errors.fieldRequired'),
                            }}
                            render={({ field, fieldState }) => (
                                <TextInput
                                    size="lg"
                                    type="text"
                                    placeholder={t('auth.placeholders.fullName')}
                                    errorMessage={fieldState.error?.message}
                                    {...field}
                                />
                            )}
                        />
                    </>
                )}

                {userType === 'agent' && (
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
