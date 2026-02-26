import { useEffect, useMemo, useState } from 'react';
import styles from './MinMaxSelect.module.scss';
import Text from '../../common/Text/Text';
import { Flex } from '../../common/Flex';
import { Dropdown } from '../../common/Dropdown';
import { TextInput } from '../../common/input/TextInput';
import { useTranslation } from 'react-i18next';

export type MinMaxState = {
    min?: number;
    max?: number;
};

export interface MinMaxSelectProps {
    label: string;
    metric: string;
    defaultValue?: MinMaxState;
    onChange?: (s: MinMaxState) => void;
    disabled?: boolean;
}

export function MinMaxSelect({
    defaultValue,
    label,
    metric,
    onChange = _ => {},
    disabled = false,
}: MinMaxSelectProps) {
    const { t } = useTranslation();

    const [formState, setFormState] = useState<MinMaxState>(defaultValue || {});
    useEffect(() => {
        onChange(formState);
    }, [formState, onChange]);

    const triggerContent = useMemo(() => {
        if (!formState.min && !formState.max) {
            return (
                <Text color="gray-50" ellipsis>
                    {label}, {metric}
                </Text>
            );
        }
        return (
            <Text ellipsis>
                {formState.min && (
                    <>
                        {t('common.from')} {formState.min}
                    </>
                )}{' '}
                {formState.max && (
                    <>
                        {t('common.to')} {formState.max}
                    </>
                )}
                {metric}
            </Text>
        );
    }, [formState.min, formState.max, label, metric, t]);

    return (
        <Flex gap={8} className={styles.container} fullWidth>
            <Dropdown
                size="lg"
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
                        onChange={val =>
                            setFormState({
                                ...formState,
                                min: val ? Number(val) : undefined,
                            })
                        }
                        value={formState.min?.toString() || ''}
                        name="from"
                    />
                    <TextInput
                        type="number"
                        placeholder={t('common.to')}
                        className={styles.input}
                        width={180}
                        onChange={val =>
                            setFormState({ ...formState, max: val ? Number(val) : undefined })
                        }
                        value={formState.max?.toString() || ''}
                        name="to"
                    />
                </Flex>
            </Dropdown>
        </Flex>
    );
}

export default MinMaxSelect;
