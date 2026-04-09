import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/common/Card/Card';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';
import { Tabs } from '@/components/ui/common/Tabs';
import { DataTable, type TableColumn } from '@/components/ui/common/Table';
import { Button } from '@/components/ui/common/Button';
import profileStyles from './Profile.module.scss';
import styles from './ProfileBookingsCard.module.scss';
import { useProfilePremises, useUser } from '@/queries';
import type { ProfilePremiseRowOut } from '@/api';
import type { ProfileBookingDealType } from './profileObjectsMock';

type ObjectsDealType = ProfileBookingDealType;

function formatCommissionRub(value: number | null | undefined): string {
    if (value === null || value === undefined) {
        return '—';
    }
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDate(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        return '—';
    }
    return d.toLocaleDateString('ru-RU');
}

export const ProfileObjectsCard = () => {
    const { t } = useTranslation();
    const [dealType, setDealType] = useState<ObjectsDealType>('rent');

    const userResult = useUser().data;

    const {
        data: queryResult,
        isPending,
        isFetching,
    } = useProfilePremises({
        query: dealType,
    });

    const apiError = queryResult?.error;
    const list = queryResult?.data;
    const rows = list?.items ?? [];

    const columns = useMemo((): TableColumn<ProfilePremiseRowOut>[] => {
        const office: TableColumn<ProfilePremiseRowOut> = {
            id: 'office',
            header: t('pages.profile.booking.columnOffice'),
            accessorKey: 'premise',
            thClassName: styles.thGray,
            render: ({ row }) => row.premise.name,
        };
        const objectCol: TableColumn<ProfilePremiseRowOut> = {
            id: 'object',
            header: t('pages.profile.booking.columnObject'),
            accessorKey: 'building',
            thClassName: styles.thGray,
            render: ({ row }) => row.building.name,
        };
        const commission: TableColumn<ProfilePremiseRowOut> = {
            id: 'commission',
            header: t('pages.profile.objects.columnCommission'),
            thClassName: styles.thGray,
            render: ({ row }) => formatCommissionRub(row.commission),
        };
        const contractType: TableColumn<ProfilePremiseRowOut> = {
            id: 'contractType',
            header: t('pages.profile.objects.columnContractType'),
            thClassName: styles.thGray,
            render: ({ row }) => row.contract_type?.trim() || '—',
        };
        const expires: TableColumn<ProfilePremiseRowOut> = {
            id: 'expires',
            header: t('pages.profile.objects.columnExpiresAt'),
            thClassName: styles.thGray,
            render: ({ row }) =>
                formatDate(row.rent_expires_at ?? row.contract_signed_on ?? undefined),
        };
        const action: TableColumn<ProfilePremiseRowOut> = {
            id: 'action',
            header: t('pages.profile.booking.columnAction'),
            headerAlign: 'left',
            cellAlign: 'left',
            thClassName: styles.thGray,
            render: ({ row }) => (
                <Button
                    size="tiny"
                    variant="outlined"
                    width="auto"
                    to={`/building/${row.building.uuid}?${new URLSearchParams({
                        selectedPremise: row.premise.uuid,
                        sale_type: dealType,
                    })}`}
                >
                    {t('pages.profile.booking.viewAction')}
                </Button>
            ),
        };

        const middle = userResult?.data?.user_type === 'agent' ? [commission] : [];

        if (dealType === 'rent') {
            return [office, objectCol, ...middle, contractType, action];
        }
        if (dealType === 'sale') {
            return [office, objectCol, ...middle, expires, action];
        }
        return [];
    }, [dealType, userResult?.data?.user_type, t]);

    const isLoading = isPending || isFetching;

    return (
        <Card
            size="xl"
            direction="column"
            gap={30}
            className={profileStyles.mainPanel}
            align="start"
        >
            <Text variant="24-med">{t('pages.profile.objects.title')}</Text>

            <Flex direction="column" gap={20} fullWidth align="start" className={styles.panel}>
                <Tabs
                    value={dealType}
                    onChange={v => {
                        setDealType(v as ObjectsDealType);
                    }}
                    tabs={[
                        { value: 'rent', label: t('pages.profile.booking.tabRent') },
                        { value: 'sale', label: t('pages.profile.booking.tabSale') },
                    ]}
                />

                {apiError ? (
                    <Text variant="12-reg" color="error-default">
                        {t(`errors.${apiError.code}`, t('errors.somethingWrong'))}
                    </Text>
                ) : (
                    <DataTable
                        width="max"
                        data={rows}
                        columns={columns}
                        size="xl"
                        getRowId={row => `${row.premise.uuid}-${row.building.uuid}`}
                        isLoading={isLoading}
                        emptyContent={
                            <Text variant="12-reg" color="gray-50">
                                {t('pages.profile.objects.empty')}
                            </Text>
                        }
                    />
                )}
            </Flex>
        </Card>
    );
};
