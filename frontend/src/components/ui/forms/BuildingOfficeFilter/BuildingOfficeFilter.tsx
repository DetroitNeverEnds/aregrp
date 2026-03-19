import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/common/Button';
import { Flex } from '@/components/ui/common/Flex';
import MinMaxSelect from '@/components/ui/forms/ObjectsFilter/MinMaxSelect';

export type BuildingOfficeFilterValue = {
    min_price?: number;
    max_price?: number;
    min_area?: number;
    max_area?: number;
};

type BuildingOfficeFilterProps = {
    value: BuildingOfficeFilterValue;
    onChange: (value: BuildingOfficeFilterValue) => void;
};

export const BuildingOfficeFilter = ({ value, onChange }: BuildingOfficeFilterProps) => {
    const { t } = useTranslation();
    const [draft, setDraft] = useState<BuildingOfficeFilterValue>(value);

    const handlePriceChange = useCallback(({ min, max }: { min?: number; max?: number }) => {
        setDraft(prev => ({ ...prev, min_price: min, max_price: max }));
    }, []);

    const handleAreaChange = useCallback(({ min, max }: { min?: number; max?: number }) => {
        setDraft(prev => ({ ...prev, min_area: min, max_area: max }));
    }, []);

    const handleSearch = () => {
        onChange(draft);
    };

    return (
        <Flex direction="row" align="center" gap={12}>
            <MinMaxSelect
                key={`price-${value.min_price}-${value.max_price}`}
                label={t('common.price')}
                metric="₽"
                defaultValue={{ min: draft.min_price, max: draft.max_price }}
                onChange={handlePriceChange}
            />
            <MinMaxSelect
                key={`area-${value.min_area}-${value.max_area}`}
                label={t('common.area')}
                metric="м²"
                defaultValue={{ min: draft.min_area, max: draft.max_area }}
                onChange={handleAreaChange}
            />
            <Button type="button" variant="primary" size="lg" icon="search" onClick={handleSearch}>
                {t('components.objectFilter.searchObjects')}
            </Button>
        </Flex>
    );
};
