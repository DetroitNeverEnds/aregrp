import { useEffect, useMemo, useState } from 'react';
import styles from './FromToSelect.module.scss';
import Text from '../../common/Text/Text';
import { Flex } from '../../common/Flex';
import { Dropdown } from '../../common/Dropdown';
import { TextInput } from '../../common/input/TextInput';
import { useTranslation } from 'react-i18next';

export type FromToState = {
    from: number;
    to: number;
};

export interface FromToSelectProps {
    label: string;
    metric: string;
    defaultValue?: FromToState;
    onChange?: (s: FromToState) => void;
    disabled?: boolean;
}

export function FromToSelect({
    defaultValue,
    label,
    metric,
    onChange = _ => {},
    disabled = false,
}: FromToSelectProps) {
    const { t } = useTranslation();

    const [formState, setFormState] = useState<FromToState>(defaultValue || { from: 0, to: 0 });
    useEffect(() => {
        onChange(formState);
    }, [formState, onChange]);

    const triggerContent = useMemo(() => {
        if (!formState.from && !formState.to) {
            return (
                <Text color="gray-50" ellipsis>
                    {label}, {metric}
                </Text>
            );
        }
        return (
            <Text ellipsis>
                {formState.from > 0 && (
                    <>
                        {t('common.from')} {formState.from}
                    </>
                )}{' '}
                {formState.to > 0 && (
                    <>
                        {t('common.to')} {formState.to}
                    </>
                )}
                {metric}
            </Text>
        );
    }, [formState.from, formState.to, label, metric, t]);

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
                                from: Number(val.currentTarget.value) || 0,
                            })
                        }
                        value={formState.from > 0 ? formState.from : undefined}
                    />
                    <TextInput
                        type="number"
                        placeholder={t('common.to')}
                        className={styles.input}
                        width={180}
                        onChange={val =>
                            setFormState({ ...formState, to: Number(val.currentTarget.value) || 0 })
                        }
                        value={formState.to > 0 ? formState.to : undefined}
                    />
                </Flex>
            </Dropdown>
        </Flex>
    );
}

export default FromToSelect;
