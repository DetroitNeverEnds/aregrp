import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { PremiseDetail } from '@/api';
import { Button } from '@/components/ui/common/Button';
import { Flex } from '@/components/ui/common/Flex';
import Form from '@/components/ui/common/Form';
import { TextInput } from '@/components/ui/common/input/TextInput';
import { Modal } from '@/components/ui/common/Modal';
import Text from '@/components/ui/common/Text';
import { useCreateReferralLinkMutation } from '@/mutations';

import styles from './GenerateLinkModal.module.scss';

export type GenerateLinkFormValues = {
    phone: string;
};

type GenerateLinkModalContentProps = {
    premise: PremiseDetail;
    generatedUrl: string | null;
    onGeneratedUrl: (url: string) => void;
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

const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
};

const GenerateLinkModalContent = ({
    premise,
    generatedUrl,
    onGeneratedUrl,
}: GenerateLinkModalContentProps) => {
    const { t } = useTranslation();
    const [copyDone, setCopyDone] = useState(false);

    const { control, handleSubmit } = useForm<GenerateLinkFormValues>({
        defaultValues: { phone: '' },
        mode: 'onSubmit',
    });

    const createReferralLinkM = useCreateReferralLinkMutation();

    const onSubmit = useCallback(
        async (data: GenerateLinkFormValues) => {
            createReferralLinkM.reset();
            setCopyDone(false);

            try {
                const result = await createReferralLinkM.mutateAsync({
                    premise_uuid: premise.uuid,
                    phone: data.phone,
                });
                onGeneratedUrl(result.url);
            } catch {
                return;
            }
        },
        [createReferralLinkM, onGeneratedUrl, premise.uuid],
    );

    const onCopyClick = useCallback(async () => {
        if (!generatedUrl) {
            return;
        }
        const ok = await copyToClipboard(generatedUrl);
        if (ok) {
            setCopyDone(true);
        }
    }, [generatedUrl]);

    const errorMessage =
        createReferralLinkM.error &&
        t(`auth.errors.${createReferralLinkM.error.code}`, {
            defaultValue: createReferralLinkM.error.detail,
        });

    if (generatedUrl) {
        return (
            <Flex direction="column" gap={20} fullWidth align="start" className={styles.content}>
                <Text variant="24-med" color="gray-100">
                    {t('pages.building.generateLinkModal.successTitle')}
                </Text>
                <Text variant="14-reg">{t('pages.building.generateLinkModal.successHint')}</Text>
                <TextInput
                    size="lg"
                    width="max"
                    value={generatedUrl}
                    onChange={() => {}}
                    readOnly
                    clearable={false}
                />
                {copyDone && (
                    <Text variant="14-reg">{t('pages.building.generateLinkModal.copyDone')}</Text>
                )}
                <Button
                    variant="primary"
                    theme="light"
                    size="lg"
                    width="max"
                    type="button"
                    onClick={onCopyClick}
                >
                    {t('pages.building.generateLinkModal.copyLink')}
                </Button>
            </Flex>
        );
    }

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
                    {t('pages.building.floor')}: {premise.floor_id ?? '—'}
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
                            disabled={createReferralLinkM.isPending}
                        />
                    )}
                />
                {errorMessage && (
                    <Text variant="14-reg" color="error-default">
                        {errorMessage}
                    </Text>
                )}
            </Flex>
            <Button
                variant="primary"
                theme="light"
                size="lg"
                width="max"
                type="submit"
                disabled={createReferralLinkM.isPending}
            >
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
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

    const handleClose = useCallback(() => {
        setGeneratedUrl(null);
        onClose();
    }, [onClose]);

    return (
        <Modal open={open} onClose={handleClose}>
            <GenerateLinkModalContent
                premise={premise}
                generatedUrl={generatedUrl}
                onGeneratedUrl={setGeneratedUrl}
            />
        </Modal>
    );
};
