import { Controller, useForm } from 'react-hook-form';
import { Flex } from '../../common/Flex';
import { Form } from '../../common/Form';
import styles from './ObjectsFilter.module.scss';
import { Button } from '../../common/Button';
import Switch from '../../common/input/Switch';
import FromToSelect from './FromToSelect';
import { Select, type SelectOption } from '../../common/input/Select';
import { useTranslation } from 'react-i18next';
import type { SaleType } from '../../../../api';
import { useBuildings } from '../../../../queries/premises';
import { useMemo } from 'react';
import { Column } from '../../layout/TwoColumnsContainer';

type SearchParams = {
    type: SaleType;
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

export const ObjectsFilter = ({ defaultValues, onSubmit }: ObjectsFilterProps) => {
    const { t } = useTranslation();
    const businessCenterOptionsData = useBuildings().data?.data;
    const businessCenterOptions: SelectOption<string>[] = useMemo(
        () =>
            businessCenterOptionsData?.map(bc => ({
                value: bc.uuid,
                label: {
                    title: bc.name,
                },
            })) || [],
        [businessCenterOptionsData],
    );

    const { control, handleSubmit, setValue } = useForm<SearchParams>({
        defaultValues,
    });

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="row" align="center" gap={12} className={styles.filterBody}>
                <Controller
                    render={({ field: { value, onChange } }) => (
                        <Switch
                            options={[
                                {
                                    value: 'sale',
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
                <Column>
                    <Controller
                        render={({ field: { value, onChange } }) => (
                            <Select
                                options={businessCenterOptions || []}
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
                </Column>
                <Column>
                    <FromToSelect
                        label={t('common.price')}
                        metric={'₽'}
                        onChange={({ from, to }) => {
                            setValue('priceFrom', from);
                            setValue('priceTo', to);
                        }}
                    />
                </Column>
                <Column>
                    <FromToSelect
                        label={t('common.area')}
                        metric={'м²'}
                        onChange={({ from, to }) => {
                            setValue('areaFrom', from);
                            setValue('areaTo', to);
                        }}
                    />
                </Column>

                <Button type="submit" variant="primary" size="lg" icon="search">
                    Поиск объектов
                </Button>
            </Flex>
        </Form>
    );
};
