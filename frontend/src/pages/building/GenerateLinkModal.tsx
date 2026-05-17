import { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { PremiseDetail } from '@/api';
import { Button } from '@/components/ui/common/Button';
import { Flex } from '@/components/ui/common/Flex';
import Form from '@/components/ui/common/Form';
import { TextInput } from '@/components/ui/common/input/TextInput';
import { Modal } from '@/components/ui/common/Modal';
import Text from '@/components/ui/common/Text';

import styles from './GenerateLinkModal.module.scss';

export type GenerateLinkFormValues = {
    clientName: string;
    phone: string;
};

type GenerateLinkModalContentProps = {
    premise: PremiseDetail;
};

const formatRubles = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
        return '—';
    }
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const GenerateLinkModalContent = ({ premise }: GenerateLinkModalContentProps) => {
    const { t } = useTranslation();

    const { control, handleSubmit } = useForm<GenerateLinkFormValues>({
        defaultValues: { clientName: '', phone: '' },
        mode: 'onSubmit',
    });

    const onSubmit = useCallback(
        (data: GenerateLinkFormValues) => {
            // TODO: вызов API генерации ссылки для агента
            console.log({ data, premise });
        },
        [premise],
    );

    return (
        <Form onSubmit={handleSubmit(onSubmit)} className={styles.content}>
            <Flex direction="column" gap={0} fullWidth align="start">
                <Text variant="h3" color="gray-100">
                    {t('pages.building.generateLinkModal.objectLabel')}
                </Text>
                <Text variant="h3" color="gray-100" ellipsis>
                    {premise.name}
                </Text>
            </Flex>
            <Flex direction="column" gap={8} fullWidth align="start">
                <Text variant="14-reg">
                    {t('pages.building.area')}: {premise.area} м²
                </Text>
                <Text variant="14-reg">
                    {t('pages.building.floor')}: {premise.floor ?? '—'}
                </Text>
                <Text variant="14-reg">
                    {t('pages.building.tenant')}:{' '}
                    {premise.has_tenant
                        ? t('components.OfficeCard.hasTennant')
                        : t('components.OfficeCard.noTennant')}
                </Text>
                <Text variant="14-reg">
                    {t('pages.building.price')}
                    {': '}
                    {premise.sale_price && formatRubles(premise.sale_price)}
                    {premise.sale_price && premise.rent_price && ' или '}
                    {premise.rent_price && `${formatRubles(premise.rent_price)} / месяц`}
                </Text>
            </Flex>
            <Text variant="24-med" color="gray-100">
                {t('pages.building.generateLinkModal.sectionTitle')}
            </Text>
            <Flex direction="column" gap={8} fullWidth>
                <Controller
                    name="clientName"
                    control={control}
                    rules={{
                        required: t(
                            'pages.building.generateLinkModal.validation.clientNameRequired',
                        ),
                        minLength: {
                            value: 2,
                            message: t('pages.building.generateLinkModal.validation.clientNameMin'),
                        },
                    }}
                    render={({ field, fieldState }) => (
                        <TextInput
                            size="lg"
                            width="max"
                            placeholder={t(
                                'pages.building.generateLinkModal.clientNamePlaceholder',
                            )}
                            {...field}
                            errorMessage={fieldState.error?.message}
                        />
                    )}
                />
                <Controller
                    name="phone"
                    control={control}
                    rules={{
                        required: t('pages.building.generateLinkModal.validation.phoneRequired'),
                        minLength: {
                            value: 5,
                            message: t('pages.building.generateLinkModal.validation.phoneMin'),
                        },
                    }}
                    render={({ field, fieldState }) => (
                        <TextInput
                            size="lg"
                            width="max"
                            placeholder={t('pages.building.generateLinkModal.phonePlaceholder')}
                            {...field}
                            errorMessage={fieldState.error?.message}
                        />
                    )}
                />
            </Flex>
            <Button variant="primary" theme="light" size="lg" width="max" type="submit">
                {t('pages.building.generateLink')}
            </Button>
        </Form>
    );
};

export type GenerateLinkModalProps = {
    open: boolean;
    onClose: () => void;
    premise: PremiseDetail;
};

export const GenerateLinkModal = (props: GenerateLinkModalProps) => {
    const { open, onClose, premise } = props;

    return (
        <Modal open={open} onClose={onClose}>
            <GenerateLinkModalContent premise={premise} />
        </Modal>
    );
};
