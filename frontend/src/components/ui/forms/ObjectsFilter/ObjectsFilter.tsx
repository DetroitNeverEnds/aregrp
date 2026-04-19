import { Controller, useForm } from 'react-hook-form';
import styles from './ObjectsFilter.module.scss';
import MinMaxSelect from './MinMaxSelect';
import { useTranslation } from 'react-i18next';
import { useBuildings } from '@/queries/premises';
import { useMemo } from 'react';
import classNames from 'classnames';
import { Column } from '@/components/ui/layout/Column';
import { Select, type SelectOption } from '@/components/ui/common/input/Select';
import Form from '@/components/ui/common/Form';
import { Flex } from '@/components/ui/common/Flex';
import Switch from '@/components/ui/common/input/Switch';
import { Button } from '@/components/ui/common/Button';
import Text from '@/components/ui/common/Text';
import { TextInput } from '@/components/ui/common/input/TextInput';
import { useFilterSearchParams } from '@/components/ui/forms/ObjectsFilter/useFilterSearchParams';
import type { PremiseFilterParams } from '@/api';
import breakpointStyles from '@/styles/breakpoint-utilities.module.scss';
import Container from '../../layout/Container';

type ObjectsFilterProps = {
    defaultValues?: PremiseFilterParams;
};

export const ObjectsFilterWrapper = ({ defaultValues }: ObjectsFilterProps) => {
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

    const { control, handleSubmit, setValue, watch } = useForm<PremiseFilterParams>({
        defaultValues: { sale_type: 'sale', ...(defaultValues || {}), ...filter },
    });

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Flex
                direction="row"
                align="center"
                gap={12}
                className={classNames(styles.filterBody, breakpointStyles.desktopOnly)}
            >
                <Controller
                    render={({ field: { value, onChange } }) => (
                        <Switch
                            options={[
                                {
                                    value: 'sale',
                                    label: t('common.sale'),
                                },
                                {
                                    value: 'rent',
                                    label: t('common.rent'),
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
                                filterable
                                filterPlaceholder={t('components.objectFilter.searchCenters')}
                                clearable
                                emptyMessage={t('components.objectFilter.nothingFound')}
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
                        // eslint-disable-next-line react-hooks/incompatible-library
                        value={{ min: watch('min_price'), max: watch('max_price') }}
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
                        value={{ min: watch('min_area'), max: watch('max_area') }}
                    />
                </Column>

                <Button type="submit" variant="primary" size="lg" icon="search">
                    {t('components.objectFilter.searchObjects')}
                </Button>
            </Flex>

            <Container
                gap="secondary"
                className={classNames(styles.filterBody, breakpointStyles.mobileOnly)}
            >
                <Controller
                    render={({ field: { value, onChange } }) => (
                        <Switch
                            options={[
                                {
                                    value: 'sale',
                                    label: t('common.sale'),
                                },
                                {
                                    value: 'rent',
                                    label: t('common.rent'),
                                },
                            ]}
                            value={value}
                            onChange={onChange}
                            fullWidth
                        />
                    )}
                    control={control}
                    name="sale_type"
                />
                <Controller
                    render={({ field: { value, onChange } }) => (
                        <Select<string>
                            options={businessCenterOptions || []}
                            placeholder={t('components.objectFilter.allCenters')}
                            size="lg"
                            fullWidth
                            value={value?.split(',') || []}
                            onChange={uuids => onChange(uuids.join(','))}
                            multiple
                            filterable
                            filterPlaceholder={t('components.objectFilter.searchCenters')}
                            clearable
                            emptyMessage={t('components.objectFilter.nothingFound')}
                            className={styles.bcSelect}
                        />
                    )}
                    control={control}
                    name="building_uuids"
                />
                <Flex gap={4} align="start" fullWidth>
                    <Text variant="12-reg" color="gray-100">
                        {t('common.price')}
                    </Text>
                    <Flex direction="row" gap={4} fullWidth>
                        <Controller
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <TextInput
                                        type="number"
                                        placeholder={t('common.from')}
                                        value={value}
                                        onChange={value => onChange(value)}
                                    />
                                );
                            }}
                            control={control}
                            name="min_price"
                        />
                        <Controller
                            render={({ field: { value, onChange } }) => (
                                <TextInput
                                    type="number"
                                    placeholder={t('common.to')}
                                    value={value}
                                    onChange={value => onChange(value)}
                                />
                            )}
                            control={control}
                            name="max_price"
                        />
                    </Flex>
                </Flex>
                <Flex gap={4} align="start" fullWidth>
                    <Text variant="12-reg" color="gray-100">
                        {t('common.area')}
                    </Text>
                    <Flex direction="row" gap={4} fullWidth>
                        <Controller
                            render={({ field: { value, onChange } }) => (
                                <TextInput
                                    type="number"
                                    placeholder={t('common.from')}
                                    value={value}
                                    onChange={value => onChange(value)}
                                />
                            )}
                            control={control}
                            name="min_area"
                        />
                        <Controller
                            render={({ field: { value, onChange } }) => (
                                <TextInput
                                    type="number"
                                    placeholder={t('common.to')}
                                    value={value}
                                    onChange={value => onChange(value)}
                                />
                            )}
                            control={control}
                            name="max_area"
                        />
                    </Flex>
                </Flex>
                <Button type="submit" variant="primary" size="lg" icon="search" width="max">
                    {t('components.objectFilter.searchObjects')}
                </Button>
            </Container>
        </Form>
    );
};

export const ObjectsFilter = (props: ObjectsFilterProps) => {
    const { filter } = useFilterSearchParams();
    return <ObjectsFilterWrapper key={JSON.stringify(filter)} {...props} />;
};
