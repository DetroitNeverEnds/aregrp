import { useCallback, useState } from 'react';
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
    title: string;
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

type SingleOnChange<T> = (value: T | undefined) => void;
type MultiOnChange<T> = (value: T[]) => void;

interface SingleSelectProps<T> extends BaseSelectProps<T> {
    multiple?: false;
    value?: T | undefined;
    onChange?: SingleOnChange<T>;
}

interface MultiSelectProps<T> extends BaseSelectProps<T> {
    multiple: true;
    value?: T[];
    onChange?: MultiOnChange<T>;
}

export type SelectProps<T> = SingleSelectProps<T> | MultiSelectProps<T>;

export function Select<T>(props: SelectProps<T>) {
    const {
        options,
        emptyMessage,
        value,
        onChange,
        placeholder = 'Выберите значение',
        size = 'lg',
        fullWidth = false,
        disabled = false,
        className = '',
        multiple = false,
        clearable = false,
    } = props;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [selectedOptions, setSelectedOptions] = useState<number[]>(() =>
        (multiple
            ? (value as T[]).map(option => options.findIndex(item => item.value === option))
            : value
              ? [options.findIndex(item => item.value === (value as T))]
              : []
        ).filter(i => i >= 0),
    );

    const handleSelect = useCallback(
        (selectedIndex: number) => {
            if (!disabled) {
                if (multiple) {
                    const newOptions = selectedOptions.includes(selectedIndex)
                        ? selectedOptions.filter(i => i !== selectedIndex)
                        : [selectedIndex, ...selectedOptions].sort();
                    setSelectedOptions(newOptions);
                    (onChange as MultiOnChange<T> | undefined)?.(
                        _.at(options, newOptions).map(i => i.value),
                    );
                } else {
                    setSelectedOptions([selectedIndex]);
                    (onChange as SingleOnChange<T> | undefined)?.(options[selectedIndex].value);
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
                setSelectedOptions([]);
                if (multiple) {
                    (onChange as MultiOnChange<T> | undefined)?.([]);
                } else {
                    (onChange as SingleOnChange<T> | undefined)?.(undefined);
                    setIsDropdownOpen(false);
                }
            }
        },
        [disabled, multiple, onChange],
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
                            <Checkbox
                                size="sm"
                                checked={selectedOptions.includes(index)}
                                // onChange={() => handleSelect(index)}
                                // onClick={e => e.stopPropagation()}
                                // onClick={() => {}}
                                // onChange={() => {}}
                            />
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
