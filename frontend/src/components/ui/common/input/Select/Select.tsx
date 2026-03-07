import { useCallback, useMemo, useState, type ReactNode } from 'react';
import classNames from 'classnames';
import styles from './Select.module.scss';
import Text from '../../Text/Text';
import { Flex } from '../../Flex';
import { Dropdown } from '../../Dropdown';
import type { Size } from '../../Dropdown/Dropdown';
import { Checkbox } from '../Checkbox';
import _ from 'lodash';
import FlatButton from '@/components/ui/common/FlatButton';
import Icon from '@/components/ui/common/Icon';

type Label = {
    title: string | ReactNode;
    description?: string;
};

export interface SelectOption<T> {
    value: T;
    label: Label;
}

interface BaseSelectProps<T> {
    options: SelectOption<T>[];
    emptyMessage?: string;
    placeholder?: string;
    size?: Size;
    fullWidth?: boolean;
    disabled?: boolean;
    errorMessage?: string;
    clearable?: boolean;
    name?: string;
    id?: string;
    required?: boolean;
    className?: string;
    maxHeight?: number;
}

export interface SelectProps<T> extends BaseSelectProps<T> {
    multiple?: boolean;
    value?: T[];
    onChange?: (value: T[]) => void;
}

export function Select<T>(props: SelectProps<T>) {
    const {
        options,
        emptyMessage,
        value,
        onChange,
        multiple = false,
        placeholder = 'Выберите значение',
        size = 'lg',
        fullWidth = false,
        disabled = false,
        className = '',
        clearable = false,
    } = props;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const selectedOptions = useMemo<number[]>(
        () =>
            value
                ?.map(option => options.findIndex(item => item.value === option))
                .filter(i => i >= 0) || [],
        [value, options],
    );

    const handleSelect = useCallback(
        (selectedIndex: number) => {
            if (!disabled) {
                if (multiple) {
                    const newOptions = selectedOptions.includes(selectedIndex)
                        ? selectedOptions.filter(i => i !== selectedIndex)
                        : [selectedIndex, ...selectedOptions].sort();
                    onChange?.(_.at(options, newOptions).map(i => i.value));
                } else {
                    onChange?.([options[selectedIndex].value]);
                    setIsDropdownOpen(false);
                }
            }
        },
        [disabled, multiple, onChange, options, selectedOptions],
    );

    const handleClear = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            if (!disabled) {
                onChange?.([]);
            }
        },
        [disabled, onChange],
    );

    return (
        <Dropdown
            size={size}
            isOpened={isDropdownOpen}
            onOpenChange={setIsDropdownOpen}
            disabled={disabled}
            fullWidth={fullWidth}
            trigger={
                selectedOptions.length > 0 ? (
                    <Flex direction="row" justify="between" className={styles.trigger}>
                        <Text variant="16-reg" ellipsis>
                            {selectedOptions
                                .map(optionIndex => options[optionIndex].label.title)
                                .join(', ')}
                        </Text>
                        {clearable && (
                            <FlatButton onClick={handleClear}>
                                <Icon name="x-close" />
                            </FlatButton>
                        )}
                    </Flex>
                ) : (
                    <Text variant="16-reg" ellipsis color="gray-50">
                        {placeholder}
                    </Text>
                )
            }
            className={className}
        >
            <Flex gap={1} align="start" direction="column">
                {options.map((option, index) =>
                    multiple ? (
                        <Flex
                            key={String(option.value)}
                            onClick={() => handleSelect(index)}
                            className={classNames(
                                styles['select-option'],
                                styles['select-option--multi'],
                                {
                                    [styles['select-option--selected']]:
                                        selectedOptions.includes(index),
                                },
                            )}
                            gap={8}
                            direction="row"
                        >
                            <Checkbox size="sm" checked={selectedOptions.includes(index)} />
                            <Flex direction="column" align="start" gap={4} style={{ flex: 1 }}>
                                <Text ellipsis variant="16-reg">
                                    {option.label.title}
                                </Text>
                                {option.label.description && (
                                    <Text variant="10-reg" color="gray-70">
                                        {option.label.description}
                                    </Text>
                                )}
                            </Flex>
                        </Flex>
                    ) : (
                        <Flex
                            key={String(option.value)}
                            onClick={() => handleSelect(index)}
                            className={classNames(styles['select-option'], {
                                [styles['select-option--selected']]:
                                    selectedOptions.includes(index),
                            })}
                            direction="column"
                            align="start"
                            gap={4}
                        >
                            <Text ellipsis variant="16-reg">
                                {option.label.title}
                            </Text>
                            {option.label.description && (
                                <Text variant="10-reg" color="gray-70">
                                    {option.label.description}
                                </Text>
                            )}
                        </Flex>
                    ),
                )}
                {options.length === 0 && (
                    <Text variant="16-reg" color="gray-50">
                        {emptyMessage}
                    </Text>
                )}
            </Flex>
        </Dropdown>
    );
}

export interface SingleSelectProps<T> extends BaseSelectProps<T> {
    value?: T | undefined;
    onChange?: (value: T | undefined) => void;
}

export function SingleSelect<T>({ onChange, value, ...props }: SingleSelectProps<T>) {
    return (
        <Select<T>
            {...props}
            multiple={false}
            value={value ? [value] : []}
            onChange={val => onChange?.(val ? val[0] : undefined)}
        />
    );
}
