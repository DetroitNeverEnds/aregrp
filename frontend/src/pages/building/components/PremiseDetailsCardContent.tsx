import { useTranslation } from 'react-i18next';
import { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import Helmet from 'react-helmet';
import { Button } from '@/components/ui/common/Button';
import { Card } from '@/components/ui/common/Card/Card';
import { FlatButton } from '@/components/ui/common/FlatButton';
import { Flex } from '@/components/ui/common/Flex';
import { Gallery } from '@/components/ui/common/Gallery/Gallery';
import Text from '@/components/ui/common/Text';
import { Column } from '@/components/ui/layout/Column';
import { useUser } from '@/queries/profile';
import type { PremiseDetail } from '@/api';
import type { SaleType } from '@/api/handlers/types';
import MedicalCrossIcon from '../medical-cross.svg?react';
import { GenerateLinkModal } from '../GenerateLinkModal';
import { PanoramaModal } from '@/components/ui/common/PanoramaModal';
import { Link } from '@/components/ui/common/Link';
import { useLoginLink } from '@/lib/getAuthLink';
import { useCreatePaymentMutation } from '@/mutations';
import { formatRubles } from './formatRubles';
import styles from '../BuildingPage.module.scss';

type PremiseDetailsCardProps = {
    data: PremiseDetail;
    canBook: boolean;
    dealType: SaleType;
    buildingTitle: string;
};

export const PremiseDetailsCardContent = ({
    data: premise,
    canBook,
    dealType,
    buildingTitle,
}: PremiseDetailsCardProps) => {
    const { t } = useTranslation();
    const user = useUser().data?.data;
    const isAuthenticated = user !== undefined;
    const loginLink = useLoginLink();
    const isAgent = user?.user_type === 'agent';

    const [generateLinkOpen, setGenerateLinkOpen] = useState(false);
    const createPaymentM = useCreatePaymentMutation();

    const onBookClick = useCallback(async () => {
        createPaymentM.reset();

        try {
            const payment = await createPaymentM.mutateAsync({
                premise_uuid: premise.uuid,
                sale_type: dealType,
            });
            const confirmationUrl = payment.confirmation?.confirmation_url;

            if (confirmationUrl) {
                window.location.assign(confirmationUrl);
                return;
            }
        } catch {
            return;
        }
    }, [createPaymentM, dealType, premise.uuid]);

    const [panoramaOpen, setPanoramaOpen] = useState(false);
    const panoramasData = useMemo(
        () =>
            premise.panoramas?.map(panorama => ({
                url: panorama,
                key: panorama,
                title: panorama,
            })) ?? [],
        [premise.panoramas],
    );
    const hasPremisePanoramas = panoramasData.length > 0;

    return (
        <>
            <Helmet>
                <title>
                    {premise.name} - {buildingTitle}
                </title>
            </Helmet>
            <Card
                background="gray"
                gap={40}
                align="start"
                fullWidth
                className={styles.premiseDetails}
            >
                <Flex gap={6} align="start" fullWidth>
                    <Flex
                        direction="row"
                        justify="between"
                        align="start"
                        wrap="wrap"
                        fullWidth
                        gap={12}
                    >
                        <Text variant="24-med" ellipsis>
                            {premise.name}
                        </Text>

                        {isAgent && (
                            <FlatButton
                                type="button"
                                className={classNames(styles.premiseDetails__generateLink)}
                                onClick={() => setGenerateLinkOpen(true)}
                            >
                                <MedicalCrossIcon />
                                <Text variant="12-med">{t('pages.building.generateLink')}</Text>
                            </FlatButton>
                        )}
                    </Flex>
                    {premise.sale_price && (
                        <Text variant="24-med" color="primary-700">
                            {formatRubles(premise.sale_price)}
                        </Text>
                    )}
                    {premise.rent_price && (
                        <Text variant="20-med" color="primary-700">
                            {premise.sale_price && 'или '}
                            {formatRubles(premise.rent_price)} / месяц
                        </Text>
                    )}
                </Flex>
                <Flex gap={8} align="start">
                    <Text variant="14-reg" color="gray-70">
                        {t('pages.building.address')}: {premise.address}
                    </Text>
                    <Text variant="14-reg" color="gray-70">
                        {premise.floor?.title ?? premise.floor?.id ?? '—'}
                    </Text>
                    <Text variant="14-reg" color="gray-70">
                        {t('pages.building.area')}: {premise.area} м²
                    </Text>
                    <Text variant="14-reg" color="gray-70">
                        {t('pages.building.tenant')}:{' '}
                        {premise.has_tenant
                            ? t(`components.OfficeCard.hasTennant`)
                            : t(`components.OfficeCard.noTennant`)}
                    </Text>
                </Flex>
            </Card>
            {canBook && (
                <Flex direction="row" gap={6} align="stretch" fullWidth>
                    <Column gap={6} align="center">
                        <Button
                            variant="primary"
                            width="max"
                            disabled={!isAuthenticated || createPaymentM.isPending}
                            onClick={onBookClick}
                        >
                            {t('pages.building.book')}
                        </Button>
                        {!isAuthenticated && (
                            <Text color="gray-50" variant="12-reg">
                                <Link to={loginLink} size="sm">
                                    {t('pages.building.authToBook.auth')}
                                </Link>
                                {t('pages.building.authToBook.toBook')}
                            </Text>
                        )}
                        {isAuthenticated && createPaymentM.error && (
                            <Text color="error-default" variant="12-reg">
                                {t(`errors.${createPaymentM.error.code}`)}
                            </Text>
                        )}
                    </Column>
                </Flex>
            )}
            {hasPremisePanoramas && (
                <Button
                    variant="outlined"
                    size="md"
                    onClick={() => setPanoramaOpen(true)}
                    width="max"
                    icon="panorama-360"
                >
                    {t('pages.building.viewPremisePanorama')}
                </Button>
            )}
            <Gallery premise={premise} orientation="vertical" size="m" type="thumbs" />

            <GenerateLinkModal
                open={generateLinkOpen}
                onClose={() => setGenerateLinkOpen(false)}
                premise={premise}
            />
            {hasPremisePanoramas && (
                <PanoramaModal
                    open={panoramaOpen}
                    onClose={() => setPanoramaOpen(false)}
                    panoramas={panoramasData.slice(0, 1)}
                    title={`${premise.name} — ${t('pages.building.viewPremisePanorama')}`}
                />
            )}
        </>
    );
};
