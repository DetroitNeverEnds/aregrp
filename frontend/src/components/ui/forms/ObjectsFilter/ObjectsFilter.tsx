import { Controller, useForm } from 'react-hook-form';
import styles from './ObjectsFilter.module.scss';
import MinMaxSelect from './MinMaxSelect';
import { useTranslation } from 'react-i18next';
import { useBuildings } from '@/queries/premises';
import { useEffect, useMemo } from 'react';
import { Column } from '@/components/ui/layout/TwoColumnsContainer';
import { Select, type SelectOption } from '@/components/ui/common/input/Select';
import Form from '@/components/ui/common/Form';
import { Flex } from '@/components/ui/common/Flex';
import Switch from '@/components/ui/common/input/Switch';
import { Button } from '@/components/ui/common/Button';
import { useFilterSearchParams } from '@/components/ui/forms/ObjectsFilter/useFilterSearchParams';
import type { PremiseFilterParams } from '@/api';

type ObjectsFilterProps = {
    defaultValues?: PremiseFilterParams;
};

export const ObjectsFilter = ({ defaultValues }: ObjectsFilterProps) => {
    const { t } = useTranslation();
    const { filter, gotoFilter } = useFilterSearchParams();
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

    const onSubmit = (values: PremiseFilterParams) => {
        gotoFilter(values);
    };

    const { control, handleSubmit, setValue, reset } = useForm<PremiseFilterParams>({
        defaultValues: { sale_type: 'sale', ...(defaultValues || {}), ...filter },
    });

    useEffect(() => {
        reset({ sale_type: 'sale', ...(defaultValues || {}), ...filter });
    }, [filter, reset, defaultValues]);

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
                                    label: t('common.rentment'),
                                },
                            ]}
                            value={value}
                            onChange={onChange}
                        />
                    )}
                    control={control}
                    name="sale_type"
                />

                <Column>
                    <Controller
                        render={({ field: { value, onChange } }) => (
                            <Select<string>
                                options={businessCenterOptions || []}
                                placeholder={t('components.objectFilter.allCenters')}
                                size="lg"
                                fullWidth
                                value={value?.split(',') || []}
                                onChange={uuids => onChange(uuids.join(','))}
                                className={styles.bcSelect}
                                multiple
                                clearable
                            />
                        )}
                        control={control}
                        name="building_uuids"
                    />
                </Column>
                <Column>
                    <MinMaxSelect
                        label={t('common.price')}
                        metric={'₽'}
                        onChange={({ min: from, max: to }) => {
                            setValue('min_price', from);
                            setValue('max_price', to);
                        }}
                        defaultValue={{ min: filter.min_price, max: filter.max_price }}
                    />
                </Column>
                <Column>
                    <MinMaxSelect
                        label={t('common.area')}
                        metric={'м²'}
                        onChange={({ min: from, max: to }) => {
                            setValue('min_area', from);
                            setValue('max_area', to);
                        }}
                        defaultValue={{ min: filter.min_area, max: filter.max_area }}
                    />
                </Column>

                <Button type="submit" variant="primary" size="lg" icon="search">
                    {t('components.objectFilter.searchObjects')}
                </Button>
            </Flex>
        </Form>
    );
};
