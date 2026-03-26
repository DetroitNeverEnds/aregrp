export type ProfileBookingDealType = 'rent' | 'sale';

export type ProfileBookingRow = {
    id: string;
    dealType: ProfileBookingDealType;
    office: string;
    object: string;
    commission: string;
    /** Отображение даты */
    expiresAt: string;
    /** Для сортировки (мс) */
    expiresAtSort: number;
};

/** Тестовые данные для вкладки «Бронь» */
export const PROFILE_BOOKING_MOCK_ROWS: ProfileBookingRow[] = [
    {
        id: '1',
        dealType: 'rent',
        office: 'Помещение 24',
        object: 'Роторная 1д',
        commission: '20 000 ₽',
        expiresAt: '12.10.2025',
        expiresAtSort: new Date('2025-10-12').getTime(),
    },
    {
        id: '2',
        dealType: 'rent',
        office: 'Помещение 24',
        object: 'Маршрутная 24',
        commission: '200 000 ₽',
        expiresAt: '12.10.2025',
        expiresAtSort: new Date('2025-10-12').getTime(),
    },
    {
        id: '3',
        dealType: 'rent',
        office: 'Офис 12',
        object: 'БЦ «Север»',
        commission: '45 000 ₽',
        expiresAt: '01.11.2025',
        expiresAtSort: new Date('2025-11-01').getTime(),
    },
    {
        id: '4',
        dealType: 'rent',
        office: 'Переговорная A',
        object: 'БЦ «Юг»',
        commission: '15 000 ₽',
        expiresAt: '20.09.2025',
        expiresAtSort: new Date('2025-09-20').getTime(),
    },
    {
        id: '5',
        dealType: 'sale',
        office: 'Помещение 24',
        object: 'Роторная 1д',
        commission: '20 000 ₽',
        expiresAt: '12.10.2025',
        expiresAtSort: new Date('2025-10-12').getTime(),
    },
    {
        id: '6',
        dealType: 'sale',
        office: 'Лот 3',
        object: 'Центральная 5',
        commission: '500 000 ₽',
        expiresAt: '05.12.2025',
        expiresAtSort: new Date('2025-12-05').getTime(),
    },
    {
        id: '7',
        dealType: 'sale',
        office: 'Студия 7',
        object: 'Набережная 2а',
        commission: '120 000 ₽',
        expiresAt: '15.08.2025',
        expiresAtSort: new Date('2025-08-15').getTime(),
    },
];
