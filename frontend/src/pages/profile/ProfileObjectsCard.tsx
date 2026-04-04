import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/common/Card/Card';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';
import { Tabs } from '@/components/ui/common/Tabs';
import { DataTable, type TableColumn } from '@/components/ui/common/Table';
import profileStyles from './Profile.module.scss';
import styles from './ProfileObjectsCard.module.scss';
import { Button } from '@/components/ui/common/Button';
import { useMyBookings } from '@/queries';
import type { BookingOut } from '@/api';

type ProfileBookingDealType = 'rent' | 'sale';

function tabFromDealType(dealType: string): ProfileBookingDealType {
    const v = dealType.toLowerCase();
    if (v === 'sale' || v.includes('sale') || v === 'buy') {
        return 'sale';
    }
    return 'rent';
}

function formatExpiresAt(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
        return '—';
    }
    return d.toLocaleDateString('ru-RU');
}

export const ProfileObjectsCard = () => {
    const { t } = useTranslation();
    const [dealType, setDealType] = useState<ProfileBookingDealType>('rent');

    const { data: queryResult, isPending, isFetching } = useMyBookings();

    const apiError = queryResult?.error;
    const bookings = queryResult?.data;

    const rowsForTab = useMemo(() => {
        if (!bookings) {
            return [];
        }
        return bookings.filter(b => tabFromDealType(b.deal_type) === dealType);
    }, [bookings, dealType]);

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
                id: 'expiresAt',
                header: t('pages.profile.booking.columnExpiresAt'),
                thClassName: styles.thGray,
                render: row => formatExpiresAt(row.expires_at),
            },
            {
                id: 'action',
                header: t('pages.profile.booking.columnAction'),
                headerAlign: 'left',
                cellAlign: 'left',
                thClassName: styles.thGray,
                render: () => (
                    <Button size="tiny" variant="outlined" width="auto">
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
                <Tabs
                    value={dealType}
                    onChange={v => {
                        setDealType(v as ProfileBookingDealType);
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
                        data={rowsForTab}
                        columns={columns}
                        size="xl"
                        getRowId={row => String(row.id)}
                        isLoading={isLoading}
                        emptyContent={
                            <Text variant="12-reg" color="gray-50">
                                {t('pages.profile.booking.empty')}
                            </Text>
                        }
                    />
                )}
            </Flex>
        </Card>
    );
};
