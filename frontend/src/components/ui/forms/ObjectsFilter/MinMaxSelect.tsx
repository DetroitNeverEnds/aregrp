import { useMemo } from 'react';
import styles from './MinMaxSelect.module.scss';
import Text from '@/components/ui/common/Text/Text';
import { Flex } from '@/components/ui/common/Flex';
import { Dropdown } from '@/components/ui/common/Dropdown';
import { TextInput } from '@/components/ui/common/input/TextInput';
import { useTranslation } from 'react-i18next';

export type MinMaxState = {
    min?: number;
    max?: number;
};

export interface MinMaxSelectProps {
    label: string;
    metric: string;
    defaultValue?: MinMaxState;
    value?: MinMaxState;
    onChange?: (s: MinMaxState) => void;
    disabled?: boolean;
}

export function MinMaxSelect({
    // defaultValue,
    label,
    metric,
    value,
    onChange = _ => {},
    disabled = false,
}: MinMaxSelectProps) {
    const { t } = useTranslation();
    const { min, max } = value || {};

    const triggerContent = useMemo(() => {
        if (!min && !max) {
            return (
                <Text color="gray-50" ellipsis>
                    {label}, {metric}
                </Text>
            );
        }
        return (
            <Text ellipsis>
                {min && (
                    <>
                        {t('common.from')} {min}
                    </>
                )}{' '}
                {max && (
                    <>
                        {t('common.to')} {max}
                    </>
                )}
                {metric}
            </Text>
        );
    }, [min, max, t, metric, label]);

    return (
        <Flex gap={8} className={styles.container} fullWidth>
            <Dropdown
                size="lg"
                fullWidth
                trigger={triggerContent}
                disabled={disabled}
                dropdownClassName={styles['from-to-select-dropdown']}
                contentSameTriggerWidth={false}
            >
                <Flex direction="row" gap={4} className={styles.card}>
                    <TextInput
                        type="number"
                        placeholder={t('common.from')}
                        className={styles.input}
                        width={180}
                        onChange={val => onChange({ min: val ? Number(val) : undefined, max })}
                        value={min}
                        name="from"
                    />
                    <TextInput
                        type="number"
                        placeholder={t('common.to')}
                        className={styles.input}
                        width={180}
                        onChange={val => onChange({ min, max: val ? Number(val) : undefined })}
                        value={max}
                        name="to"
                    />
                </Flex>
            </Dropdown>
        </Flex>
    );
}

export default MinMaxSelect;
