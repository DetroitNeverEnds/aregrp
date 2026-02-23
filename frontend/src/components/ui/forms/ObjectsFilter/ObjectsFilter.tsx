import { Controller, useForm } from 'react-hook-form';
import styles from './ObjectsFilter.module.scss';
import FromToSelect from './FromToSelect';
import { useTranslation } from 'react-i18next';
import { useBuildings } from '@/queries/premises';
import { useMemo } from 'react';
import { Column } from '@/components/ui/layout/TwoColumnsContainer';
import { Select, type SelectOption } from '@/components/ui/common/input/Select';
import Form from '@/components/ui/common/Form';
import { Flex } from '@/components/ui/common/Flex';
import Switch from '@/components/ui/common/input/Switch';
import { Button } from '@/components/ui/common/Button';
import type { ObjectsFilterSearchParams } from '@/components/ui/forms/ObjectsFilter/types';
import { useFilterSearchParams } from '@/components/ui/forms/ObjectsFilter/useFilterSearchParams';

type ObjectsFilterProps = {
    defaultValues?: ObjectsFilterSearchParams;
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

    const onSubmit = (values: ObjectsFilterSearchParams) => {
        gotoFilter(values);
    };

    const { control, handleSubmit, setValue } = useForm<ObjectsFilterSearchParams>({
        defaultValues: { ...filter, ...(defaultValues || {}) },
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
                        defaultValue={{ from: filter.priceFrom || 0, to: filter.priceTo || 0 }}
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
                        defaultValue={{ from: filter.areaFrom || 0, to: filter.areaTo || 0 }}
                    />
                </Column>

                <Button type="submit" variant="primary" size="lg" icon="search">
                    Поиск объектов
                </Button>
            </Flex>
        </Form>
    );
};
