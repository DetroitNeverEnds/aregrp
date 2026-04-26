import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/common/Button';
import { Flex } from '@/components/ui/common/Flex';
import MinMaxSelect from '@/components/ui/forms/ObjectsFilter/MinMaxSelect';
import breakpointStyles from '@/styles/breakpoint-utilities.module.scss';
import { TextInput } from '../../common/input/TextInput';
import Text from '../../common/Text';

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

    const handleChange = useCallback((changes: Partial<BuildingOfficeFilterValue>) => {
        setDraft(prev => ({ ...prev, ...changes }));
    }, []);

    const handleSearch = () => {
        onChange(draft);
    };

    return (
        <>
            <Flex direction="row" align="center" gap={12} className={breakpointStyles.desktopOnly}>
                <MinMaxSelect
                    key={`price-${value.min_price}-${value.max_price}`}
                    label={t('common.price')}
                    metric="₽"
                    value={{ min: draft.min_price, max: draft.max_price }}
                    onChange={s => handleChange({ min_price: s.min, max_price: s.max })}
                />
                <MinMaxSelect
                    key={`area-${value.min_area}-${value.max_area}`}
                    label={t('common.area')}
                    metric="м²"
                    value={{ min: draft.min_area, max: draft.max_area }}
                    onChange={s => handleChange({ min_area: s.min, max_area: s.max })}
                />
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon="search"
                    onClick={handleSearch}
                >
                    {t('components.objectFilter.searchObjects')}
                </Button>
            </Flex>
            <Flex align="start" gap={24} fullWidth className={breakpointStyles.mobileOnly}>
                <Flex align="start" gap={12} fullWidth>
                    <Text variant="14-reg">{t('common.price')}, ₽</Text>
                    <Flex direction="row" gap={12}>
                        <TextInput
                            value={draft.min_price}
                            size="lg"
                            type="number"
                            onChange={v => handleChange({ min_price: v ? Number(v) : undefined })}
                            placeholder={t('common.from')}
                        />
                        <TextInput
                            value={draft.max_price}
                            size="lg"
                            type="number"
                            onChange={v => handleChange({ max_price: v ? Number(v) : undefined })}
                            placeholder={t('common.to')}
                        />
                    </Flex>
                </Flex>
                <Flex align="start" gap={12} fullWidth>
                    <Text variant="14-reg">{t('common.area')}, м²</Text>
                    <Flex direction="row" gap={12}>
                        <TextInput
                            value={draft.min_area}
                            size="lg"
                            type="number"
                            onChange={v => handleChange({ min_area: v ? Number(v) : undefined })}
                            placeholder={t('common.from')}
                        />
                        <TextInput
                            value={draft.max_area}
                            size="lg"
                            type="number"
                            onChange={v => handleChange({ max_area: v ? Number(v) : undefined })}
                            placeholder={t('common.to')}
                        />
                    </Flex>
                </Flex>
                <Button
                    type="submit"
                    icon="search"
                    onClick={handleSearch}
                    variant="primary"
                    size="lg"
                    width="max"
                >
                    {t('components.objectFilter.searchObjects')}
                </Button>
            </Flex>
        </>
    );
};
