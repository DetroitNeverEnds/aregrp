export const formatRubles = (value: number | null | undefined) => {
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
