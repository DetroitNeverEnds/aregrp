import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import styles from './Select.module.scss';
import { Icon } from '../../Icon';
import { FlatButton } from '../../FlatButton';
import Text from '../../Text/Text';
import { Flex } from '../../Flex';

export type SelectSize = 'lg' | 'sm';

type EasyLabel = {
    title: string;
    description?: string;
};

export interface SelectOption<T> {
    value: T;
    label: EasyLabel;
}

export interface SelectProps<T> {
    /** Массив опций для выбора */
    options: SelectOption<T>[];
    /** Текущее выбранное значение */
    value?: T | undefined;
    /** Callback при изменении значения */
    onChange?: (value: T | undefined) => void;
    /** Текст placeholder */
    placeholder?: string;
    /** Размер компонента */
    size?: SelectSize;
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
    value,
    onChange,
    placeholder = 'Выберите значение',
    size = 'lg',
    disabled = false,
    errorMessage,
    clearable = false,
    name,
    id,
    required = false,
    className = '',
    maxHeight = 300,
}: SelectProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    // const dropdownRef = useRef<HTMLDivElement>(null);
    const hiddenInputRef = useRef<HTMLInputElement>(null);

    // Находим выбранную опцию
    const selectedOption = useMemo(() => options.find(el => el.value === value), [options, value]);

    // Определяем, есть ли ошибка
    const hasError = useMemo(() => Boolean(errorMessage), [errorMessage]);

    // Определяем, есть ли значение
    const hasValue = useMemo(() => Boolean(value), [value]);

    // Закрытие при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setFocusedIndex(-1);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Обработчик открытия/закрытия
    const handleToggle = useCallback(() => {
        if (!disabled) {
            setIsOpen(prev => !prev);
            if (!isOpen) {
                setFocusedIndex(-1);
            }
        }
    }, [disabled, isOpen]);

    // Обработчик выбора опции
    const handleSelect = useCallback(
        (option: SelectOption<T>) => {
            if (!disabled) {
                onChange?.(option.value);
                setIsOpen(false);
                setFocusedIndex(-1);
            }
        },
        [disabled, onChange],
    );

    // Обработчик очистки
    const handleClear = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!disabled) {
                onChange?.(undefined);
                setIsOpen(false);
            }
        },
        [disabled, onChange],
    );

    // // Обработчик клавиатуры
    // const handleKeyDown = useCallback(
    //     (e: React.KeyboardEvent) => {
    //         if (disabled) return;

    //         const selectOptions = options.filter(isSelectOption);

    //         switch (e.key) {
    //             case 'Enter':
    //             case ' ':
    //                 e.preventDefault();
    //                 if (!isOpen) {
    //                     setIsOpen(true);
    //                 } else if (focusedIndex >= 0 && focusedIndex < selectOptions.length) {
    //                     handleSelect(selectOptions[focusedIndex]);
    //                 }
    //                 break;

    //             case 'Escape':
    //                 e.preventDefault();
    //                 setIsOpen(false);
    //                 setFocusedIndex(-1);
    //                 break;

    //             case 'ArrowDown':
    //                 e.preventDefault();
    //                 if (!isOpen) {
    //                     setIsOpen(true);
    //                 } else {
    //                     setFocusedIndex(prev =>
    //                         prev < selectOptions.length - 1 ? prev + 1 : prev,
    //                     );
    //                 }
    //                 break;

    //             case 'ArrowUp':
    //                 e.preventDefault();
    //                 if (isOpen) {
    //                     setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
    //                 }
    //                 break;

    //             case 'Home':
    //                 e.preventDefault();
    //                 if (isOpen) {
    //                     setFocusedIndex(0);
    //                 }
    //                 break;

    //             case 'End':
    //                 e.preventDefault();
    //                 if (isOpen) {
    //                     setFocusedIndex(selectOptions.length - 1);
    //                 }
    //                 break;
    //         }
    //     },
    //     [disabled, isOpen, focusedIndex, options, handleSelect],
    // );

    // Скролл к сфокусированному элементу
    // useEffect(() => {
    //     if (isOpen && focusedIndex >= 0 && dropdownRef.current) {
    //         const focusedElement = dropdownRef.current.children[focusedIndex] as HTMLElement;
    //         if (focusedElement) {
    //             focusedElement.scrollIntoView({
    //                 block: 'nearest',
    //                 behavior: 'smooth',
    //             });
    //         }
    //     }
    // }, [focusedIndex, isOpen]);

    const containerClassNames = classNames(
        styles['select-container'],
        styles[`select-container--${size}`],
        {
            [styles['select-container--error']]: hasError,
            [styles['select-container--disabled']]: disabled,
            [styles['select-container--open']]: isOpen,
        },
        className,
    );

    const fieldClassNames = classNames(styles['select-field'], {
        [styles['select-field--filled']]: hasValue,
    });

    return (
        <Flex gap={8} fullWidth>
            <div
                ref={containerRef}
                className={containerClassNames}
                // onKeyDown={handleKeyDown}
                // tabIndex={disabled ? -1 : 0}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-disabled={disabled}
                aria-required={required}
                aria-invalid={hasError}
            >
                <Flex direction="row" gap={8} className={fieldClassNames} onClick={handleToggle}>
                    <Text
                        ellipsis
                        variant="16-reg"
                        color={selectedOption ? undefined : 'gray-50'}
                        className={styles['select-value']}
                    >
                        {selectedOption?.label.title || placeholder}
                    </Text>

                    {clearable && hasValue && !disabled && (
                        <FlatButton onClick={handleClear} aria-label="Очистить">
                            <Icon name="xmark-gray-circle" size={20} />
                        </FlatButton>
                    )}

                    <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} />
                </Flex>

                {isOpen && !disabled && (
                    <Flex
                        align="stretch"
                        // ref={dropdownRef}
                        className={styles['select-dropdown']}
                        style={{ maxHeight: `${maxHeight}px` }}
                        role="listbox"
                    >
                        {options.map((option, index) => (
                            <Flex
                                key={String(option.value)}
                                gap={4}
                                align="start"
                                className={classNames(styles['select-option'], {
                                    [styles['select-option--selected']]: option.value === value,
                                    [styles['select-option--focused']]: index === focusedIndex,
                                })}
                                onClick={() => handleSelect(option)}
                            >
                                <Text variant="12-reg">{option.label.title}</Text>
                                {option.label.description && (
                                    <Text variant="10-reg" color="gray-50">
                                        {option.label.description}
                                    </Text>
                                )}
                            </Flex>
                        ))}
                    </Flex>
                )}

                {/* Скрытый input для работы с формами */}
                <input
                    ref={hiddenInputRef}
                    type="hidden"
                    name={name}
                    id={id}
                    value={String(value) || ''}
                    required={required}
                />
            </div>

            {errorMessage && (
                <Text variant="12-reg" color="error-default">
                    {errorMessage}
                </Text>
            )}
        </Flex>
    );
}

export default Select;
