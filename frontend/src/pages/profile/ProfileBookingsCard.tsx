import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/common/Card/Card';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';
import { DataTable, type TableColumn } from '@/components/ui/common/Table';
import profileStyles from './Profile.module.scss';
import styles from './ProfileBookingsCard.module.scss';
import { Button } from '@/components/ui/common/Button';
import { useMyBookings } from '@/queries';
import type { BookingOut } from '@/api';

function formatExpiresAt(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return '—';
    }
    return d.toLocaleDateString('ru-RU');
}

export const ProfileBoookingsCard = () => {
    const { t } = useTranslation();

    const { data: queryResult, isPending, isFetching } = useMyBookings();

    const apiError = queryResult?.error;
    const bookings = queryResult?.data;

    const columns = useMemo((): TableColumn<BookingOut>[] => {
        return [
            {
                id: 'office',
                header: t('pages.profile.booking.columnOffice'),
                accessorKey: 'premise_name',
                thClassName: styles.thGray,
            },
            {
                id: 'object',
                header: t('pages.profile.booking.columnObject'),
                accessorKey: 'building_name',
                thClassName: styles.thGray,
            },
            {
                id: 'address',
                header: t('pages.profile.booking.columnAddress'),
                accessorKey: 'building_address',
                thClassName: styles.thGray,
            },
            {
                id: 'deal_type',
                header: t('pages.profile.booking.columnDealType'),
                thClassName: styles.thGray,
                render: ({ row }) =>
                    row.deal_type === 'sale'
                        ? t('pages.profile.booking.dealTypeSale')
                        : t('pages.profile.booking.dealTypeRent'),
            },
            {
                id: 'expiresAt',
                header: t('pages.profile.booking.columnExpiresAt'),
                thClassName: styles.thGray,
                render: ({ row }) => formatExpiresAt(row.expires_at),
            },
            {
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
                        to={`/building/${row.building_uuid}?${new URLSearchParams({
                            selectedPremise: row.premise_uuid,
                            sale_type: row.deal_type === 'sale' ? 'sale' : 'rent',
                        })}`}
                    >
                        {t('pages.profile.booking.viewAction')}
                    </Button>
                ),
            },
        ];
    }, [t]);

    const isLoading = isPending || isFetching;

    return (
        <Card
            size="xl"
            direction="column"
            gap={30}
            className={profileStyles.mainPanel}
            align="start"
        >
            <Text variant="24-med">{t('pages.profile.booking.title')}</Text>

            <Flex direction="column" gap={20} fullWidth align="start" className={styles.panel}>
                {apiError ? (
                    <Text variant="14-reg" color="error-default">
                        {t(`errors.${apiError.code}`, t('errors.somethingWrong'))}
                    </Text>
                ) : (
                    <DataTable
                        width="max"
                        data={bookings || []}
                        columns={columns}
                        size="xl"
                        getRowId={row => String(row.id)}
                        isLoading={isLoading}
                        emptyContent={
                            <Text variant="14-reg" color="gray-50">
                                {t('pages.profile.booking.empty')}
                            </Text>
                        }
                    />
                )}
            </Flex>
        </Card>
    );
};
