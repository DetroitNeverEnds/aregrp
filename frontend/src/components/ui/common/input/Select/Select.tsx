import { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import styles from './Select.module.scss';
import Text from '../../Text/Text';
import { Flex } from '../../Flex';
import { Dropdown } from '../../Dropdown';
import type { Size } from '../../Dropdown/Dropdown';

type Label = {
    title: string;
    description?: string;
};

export interface SelectOption<T> {
    value: T;
    label: Label;
}

export interface SelectProps<T> {
    /** Массив опций для выбора */
    options: SelectOption<T>[];
    emptyMessage?: string;
    /** Текущее выбранное значение */
    value?: T | undefined;
    /** Callback при изменении значения */
    onChange?: (value: T | undefined) => void;
    /** Текст placeholder */
    placeholder?: string;
    /** Размер компонента */
    size?: Size;
    /** Отключенное состояние */
    disabled?: boolean;
    /** Сообщение об ошибке */
    errorMessage?: string;
    /** Возможность очистить выбранное значение */
    clearable?: boolean;
    /** Имя поля для форм */
    name?: string;
    /** ID элемента */
    id?: string;
    /** Обязательное поле */
    required?: boolean;
    /** Дополнительные CSS классы */
    className?: string;
    /** Максимальная высота выпадающего списка */
    maxHeight?: number;
}

export function Select<T>({
    options,
    emptyMessage,
    value,
    onChange,
    placeholder = 'Выберите значение',
    size = 'lg',
    disabled = false,
    // required = false,
    className = '',
}: SelectProps<T>) {
    const [selectedValue, setSelectedValue] = useState<T | undefined>(() => value);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const selectedOption = useMemo(
        () => options.find(el => el.value === selectedValue),
        [options, selectedValue],
    );

    const handleSelect = useCallback(
        (option: SelectOption<T>) => {
            if (!disabled) {
                onChange?.(option.value);
                setSelectedValue(option.value);
                setIsDropdownOpen(false);
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
            trigger={
                selectedOption?.label.title ? (
                    <Text variant="16-reg" ellipsis>
                        {selectedOption?.label.title}
                    </Text>
                ) : (
                    <Text variant="16-reg" ellipsis color="gray-50">
                        {placeholder}
                    </Text>
                )
            }
            className={className}
            triggerClassName={
                selectedValue === undefined ? styles.unselectedTrigger : styles.selectedTrigger
            }
        >
            <Flex gap={1} align="start">
                {options.map(option => (
                    <Flex
                        key={String(option.value)}
                        onClick={() => handleSelect(option)}
                        className={classNames(styles['select-option'], {
                            [styles['select-option--selected']]: selectedValue === option.value,
                        })}
                    >
                        <Text ellipsis variant="16-reg">
                            {option.label.title}
                        </Text>
                        <Text variant="10-reg" color="gray-50">
                            {option.label.description}
                        </Text>
                    </Flex>
                ))}
                {options.length === 0 && (
                    <Text variant="16-reg" color="gray-50">
                        {emptyMessage}
                    </Text>
                )}
            </Flex>
        </Dropdown>
    );
}
