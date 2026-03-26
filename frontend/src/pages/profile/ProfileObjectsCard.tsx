import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/common/Card/Card';
import { Flex } from '@/components/ui/common/Flex';
import Text from '@/components/ui/common/Text';
import { Tabs } from '@/components/ui/common/Tabs';
import { DataTable, type TableColumn, type TableSortDirection } from '@/components/ui/common/Table';
import type { ProfileBookingDealType, ProfileBookingRow } from './profileObjectsMock';
import { PROFILE_BOOKING_MOCK_ROWS } from './profileObjectsMock';

import profileStyles from './Profile.module.scss';
import styles from './ProfileObjectsCard.module.scss';
import { Button } from '@/components/ui/common/Button';

export const ProfileObjectsCard = () => {
    const { t } = useTranslation();
    const [dealType, setDealType] = useState<ProfileBookingDealType>('rent');
    const [sortDirection, setSortDirection] = useState<TableSortDirection>(null);

    const rowsForTab = useMemo(
        () => PROFILE_BOOKING_MOCK_ROWS.filter(row => row.dealType === dealType),
        [dealType],
    );

    const sortedRows = useMemo(() => {
        const rows = [...rowsForTab];
        if (sortDirection === null) {
            return rows;
        }
        rows.sort((a, b) => {
            const cmp = a.expiresAtSort - b.expiresAtSort;
            return sortDirection === 'asc' ? cmp : -cmp;
        });
        return rows;
    }, [rowsForTab, sortDirection]);

    const columns = useMemo((): TableColumn<ProfileBookingRow>[] => {
        return [
            {
                id: 'office',
                header: t('pages.profile.booking.columnOffice'),
                accessorKey: 'office',
                thClassName: styles.thGray,
            },
            {
                id: 'object',
                header: t('pages.profile.booking.columnObject'),
                accessorKey: 'object',
                thClassName: styles.thGray,
            },
            {
                id: 'commission',
                header: t('pages.profile.booking.columnCommission'),
                accessorKey: 'commission',
                thClassName: styles.thGray,
            },
            {
                id: 'expiresAt',
                header: t('pages.profile.booking.columnExpiresAt'),
                accessorKey: 'expiresAt',
                thClassName: styles.thGray,
            },
            {
                id: 'action',
                header: t('pages.profile.booking.columnAction'),
                headerAlign: 'left',
                cellAlign: 'left',
                thClassName: styles.thGray,
                render: () => (
                    <Button size="md" variant="outlined" width="max">
                        {t('pages.profile.booking.viewAction')}
                    </Button>
                ),
            },
        ];
    }, [t]);

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
                        setSortDirection(null);
                    }}
                    tabs={[
                        { value: 'rent', label: t('pages.profile.booking.tabRent') },
                        { value: 'sale', label: t('pages.profile.booking.tabSale') },
                    ]}
                />

                <DataTable
                    width="max"
                    data={sortedRows}
                    columns={columns}
                    size="xl"
                    getRowId={row => row.id}
                    emptyContent={
                        <Text variant="12-reg" color="gray-50">
                            {t('pages.profile.booking.empty')}
                        </Text>
                    }
                />
            </Flex>
        </Card>
    );
};
