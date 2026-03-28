import { useCallback, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';
import { Button } from '@/components/ui/common/Button';
import { TextInput } from '@/components/ui/common/input/TextInput';
import Form from '@/components/ui/common/Form';
import type { UserData } from '@/api';
import { useUpdateProfileMutation } from '@/mutations/profile';

import styles from './Profile.module.scss';

type ProfileEditFormValues = {
    organization_name: string;
    full_name: string;
    phone: string;
    inn: string;
};

const getFormDefaults = (user: UserData): ProfileEditFormValues => ({
    organization_name: user.organization_name ?? '',
    full_name: user.full_name ?? '',
    phone: user.phone ?? '',
    inn: user.inn ?? '',
});

type FieldLabelProps = { label: string; children: ReactNode };

const FieldLabel = ({ label, children }: FieldLabelProps) => (
    <Flex
        direction="column"
        gap={6}
        align="start"
        fullWidth
        className={styles.mainPanel__formField}
    >
        <Text variant="12-reg" color="gray-70">
            {label}
        </Text>
        {children}
    </Flex>
);

type ProfileMainInfoEditFormProps = {
    user: UserData;
    onSaved: () => void;
    onCancel: () => void;
};

export const ProfileMainInfoEditForm = ({
    user,
    onSaved,
    onCancel,
}: ProfileMainInfoEditFormProps) => {
    const { t } = useTranslation();

    const { control, handleSubmit, formState, setError } = useForm<ProfileEditFormValues>({
        defaultValues: getFormDefaults(user),
    });

    const updateMutation = useUpdateProfileMutation({
        onSuccess: () => {
            onSaved();
        },
        onError: error => {
            setError('root', {
                type: 'manual',
                message: t(`auth.errors.${error.code}`, { defaultValue: error.detail }),
            });
        },
    });

    const onSubmit = useCallback(
        (data: ProfileEditFormValues) => {
            updateMutation.mutate(data);
        },
        [updateMutation],
    );

    const requiredRule = { required: t('auth.errors.fieldRequired') };

    return (
        <Form onSubmit={handleSubmit(onSubmit)} className={styles.mainPanel__form}>
            <Flex direction="column" gap={24} align="start" fullWidth>
                {formState.errors.root?.message && (
                    <Text variant="14-reg" color="error-default">
                        {formState.errors.root.message}
                    </Text>
                )}
                {user.user_type === 'agent' ? (
                    <Flex gap={12} fullWidth>
                        <FieldLabel label={t('pages.profile.orgNameLabel')}>
                            <Controller
                                control={control}
                                name="organization_name"
                                rules={requiredRule}
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
                        </FieldLabel>
                        <FieldLabel label={t('pages.profile.phoneLabel')}>
                            <Controller
                                control={control}
                                name="phone"
                                rules={requiredRule}
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
                        </FieldLabel>
                        <FieldLabel label={t('pages.profile.innLabel')}>
                            <Controller
                                control={control}
                                name="inn"
                                rules={requiredRule}
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
                        </FieldLabel>
                    </Flex>
                ) : (
                    <Flex direction="row" gap={12} fullWidth align="start">
                        <FieldLabel label={t('pages.profile.fullNameLabel')}>
                            <Controller
                                control={control}
                                name="full_name"
                                rules={requiredRule}
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
                        </FieldLabel>
                        <FieldLabel label={t('pages.profile.phoneLabel')}>
                            <Controller
                                control={control}
                                name="phone"
                                rules={requiredRule}
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
                        </FieldLabel>
                    </Flex>
                )}
                <Flex direction="row" gap={12}>
                    <Button variant="primary" type="submit" disabled={updateMutation.isPending}>
                        {t('pages.profile.save')}
                    </Button>
                    <Button
                        variant="outlined"
                        type="button"
                        onClick={onCancel}
                        disabled={updateMutation.isPending}
                    >
                        {t('pages.profile.cancel')}
                    </Button>
                </Flex>
            </Flex>
        </Form>
    );
};
