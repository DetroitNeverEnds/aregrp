import { Controller, useForm } from 'react-hook-form';
import { Flex } from '../../common/Flex';
import { Form } from '../../common/Form';
import styles from './ObjectsFilter.module.scss';
import { Button } from '../../common/Button';
import Switch from '../../common/input/Switch';
import FromToSelect from './FromToSelect';
import { Select } from '../../common/input/Select';
import { useTranslation } from 'react-i18next';

type Type = 'buy' | 'rent';

type SearchParams = {
    type: Type;
    businessCenters?: string[];
    priceFrom?: number;
    priceTo?: number;
    areaFrom?: number;
    areaTo?: number;
};

type ObjectsFilterProps = {
    defaultValues?: SearchParams;
    onSubmit: (values: SearchParams) => void;
};

// Моковые данные для бизнес-центров
const businessCenterOptions = [
    { value: 'bc1', label: { title: 'Бизнес-центр 1' } },
    { value: 'bc2', label: { title: 'Бизнес-центр 2' } },
    { value: 'bc3', label: { title: 'Бизнес-центр 3' } },
    { value: 'bc4', label: { title: 'Бизнес-центр 4' } },
];

export const ObjectsFilter = ({ defaultValues, onSubmit }: ObjectsFilterProps) => {
    const { t } = useTranslation();

    const { control, handleSubmit, setValue } = useForm<SearchParams>({
        defaultValues: { ...{ type: 'buy' }, ...(defaultValues || {}) },
    });

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="row" align="center" gap={12} className={styles.filterBody}>
                <Controller
                    render={({ field: { value, onChange } }) => (
                        <Switch
                            options={[
                                {
                                    value: 'buy',
                                    label: t('common.buyment'),
                                },
                                {
                                    value: 'rent',
                                    label: t('common.sellment'),
                                },
                            ]}
                            value={value}
                            onChange={onChange}
                        />
                    )}
                    control={control}
                    name="type"
                />

                {/* TODO: Заменить на мультиселект */}
                <Controller
                    render={({ field: { value, onChange } }) => (
                        <Select
                            options={businessCenterOptions}
                            placeholder={t('components.objectFilter.allCenters')}
                            size="lg"
                            value={value}
                            onChange={onChange}
                            className={styles.bcSelect}
                        />
                    )}
                    control={control}
                    name="businessCenters"
                />

                <FromToSelect
                    label={t('common.price')}
                    metric={'₽'}
                    onChange={({ from, to }) => {
                        setValue('priceFrom', from);
                        setValue('priceTo', to);
                    }}
                />
                <FromToSelect
                    label={t('common.area')}
                    metric={'м²'}
                    onChange={({ from, to }) => {
                        setValue('areaFrom', from);
                        setValue('areaTo', to);
                    }}
                />

                <Button type="submit" variant="primary" size="lg" icon="search">
                    Поиск объектов
                </Button>
            </Flex>
        </Form>
    );
};
