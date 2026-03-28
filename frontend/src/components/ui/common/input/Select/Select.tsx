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
import { TextInput } from '@/components/ui/common/input/TextInput';

type Label = {
    // Заголовок опции
    title: string | ReactNode;
    /** Мета-строка, которая будет использоваться для поиска
        (напрмер, если заголовок - ReactNode)

        Имеет приоритет над заголовком при поиске.
    */
    titleFilterMeta?: string;
    // Описание опции
    description?: string;
};

export interface SelectOption<T> {
    value: T;
    label: Label;
}

function selectOptionMatchesQuery<T>(option: SelectOption<T>, query: string): boolean {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
        return true;
    }
    const titlePart =
        option.label.titleFilterMeta ||
        (typeof option.label.title === 'string' ? option.label.title.toLowerCase() : '');
    const descPart = (option.label.description ?? '').toLowerCase();
    return titlePart.includes(normalized) || descPart.includes(normalized);
}

interface BaseSelectProps<T> {
    options: SelectOption<T>[];
    /** Показать поле поиска и отфильтровать опции по подстроке (заголовок и описание). */
    filterable?: boolean;
    /** Плейсхолдер поля поиска при `filterable`. */
    filterPlaceholder?: string;
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
        filterable = false,
        filterPlaceholder = 'Поиск...',
    } = props;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [filterQuery, setFilterQuery] = useState('');

    const openDropdowOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                setFilterQuery('');
            }
            setIsDropdownOpen(open);
        },
        [setFilterQuery],
    );

    const visibleOptionIndices = useMemo(() => {
        if (!filterable) {
            return options.map((_, index) => index);
        }
        return options
            .map((option, index) => (selectOptionMatchesQuery(option, filterQuery) ? index : -1))
            .filter(i => i >= 0);
    }, [options, filterable, filterQuery]);

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
            onOpenChange={openDropdowOpenChange}
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
            <Flex gap={16} align="start" direction="column" fullWidth>
                {filterable && (
                    <TextInput
                        value={filterQuery}
                        onChange={setFilterQuery}
                        placeholder={filterPlaceholder}
                        leadingIcon="search"
                        size="md"
                        clearable
                        disabled={disabled}
                    />
                )}
                <Flex gap={1} align="start" direction="column" fullWidth>
                    {visibleOptionIndices.map(index => {
                        const option = options[index];
                        return (
                            <Flex
                                key={String(option.value)}
                                onClick={() => handleSelect(index)}
                                className={classNames(styles['select-option'], {
                                    [styles['select-option--multi']]: multiple,
                                    [styles['select-option--selected']]:
                                        selectedOptions.includes(index),
                                })}
                                gap={8}
                                direction="row"
                            >
                                {multiple && (
                                    <div onClick={e => e.stopPropagation()}>
                                        <Checkbox
                                            size="sm"
                                            checked={selectedOptions.includes(index)}
                                            onChange={() => handleSelect(index)}
                                        />
                                    </div>
                                )}
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
                        );
                    })}
                </Flex>
                {visibleOptionIndices.length === 0 && (
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
