# План исправления компонента TextInput

## Проблема

В файле `frontend/src/components/ui/common/input/TextInput/TextInput.tsx` на строках 62-70 возникает ошибка TypeScript:

```
[ts] Property 'current' does not exist on type '((instance: HTMLInputElement | null) => void) | RefObject<HTMLInputElement | null>'.
Property 'current' does not exist on type '(instance: HTMLInputElement | null) => void'. (2339)
```

## Анализ проблемы

Проблема заключается в том, что в функции `onClear` мы пытаемся обратиться к `ref.current`, но `ref` может быть двух типов:
1. `RefObject<HTMLInputElement | null>` - объект со свойством `current`
2. `(instance: HTMLInputElement | null) => void` - функция обратного вызова

TypeScript не может гарантировать, что у `ref` есть свойство `current`, так как это может быть функция.

## Решение

Необходимо использовать внутренний ref с помощью `useRef` и комбинировать его с переданным ref через `useImperativeHandle`.

### Изменения в коде:

1. Добавить импорт `useImperativeHandle`
2. Создать внутренний ref с помощью `useRef`
3. Использовать `useImperativeHandle` для экспорта внутреннего ref
4. Использовать внутренний ref в функции `onClear`

### Исправленный код:

```tsx
import React, { useState, useMemo, useCallback, forwardRef, useRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import styles from './TextInput.module.scss';
import { Icon, type IconName } from '../../Icon';
import { FlatButton } from '../../FlatButton';
import Text from '../../Text/Text';

export type TextInputSize = 'lg' | 'md';
export type TextInputWidth = 'auto' | 'max';

type AdditionalInputProps = {
    /** Размер инпута */
    size: TextInputSize;
    /** Иконка слева (например, search, mail-simple) */
    leadingIcon?: IconName;
    /** Сообщение об ошибке (при наличии инпут становится невалидным с темой error) */
    errorMessage?: string;
};
export type TextInputProps = Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    keyof AdditionalInputProps
> &
    AdditionalInputProps;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    (
        {
            size,
            leadingIcon,
            errorMessage,
            className = '',
            disabled = false,
            type = 'text',
            value,
            onChange,
            ...props
        },
        ref,
    ) => {
        const [isPasswordVisible, setIsPasswordVisible] = useState(false);
        const [hasValue, setHasValue] = useState(Boolean(props.defaultValue));
        
        // Создаем внутренний ref для доступа к DOM элементу
        const internalRef = useRef<HTMLInputElement>(null);
        
        // Экспортируем внутренний ref через useImperativeHandle
        useImperativeHandle(ref, () => internalRef.current!);

        // Определяем, показывать ли toggle для пароля
        const isPasswordField = useMemo(() => type === 'password', [type]);

        // Определяем актуальный тип инпута (для переключения видимости пароля)
        const actualType = useMemo(
            () => (isPasswordField && isPasswordVisible ? 'text' : type),
            [isPasswordField, isPasswordVisible, type],
        );

        // Обработчик изменения для отслеживания наличия значения
        const handleChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setHasValue(e.target.value.length > 0);
                onChange?.(e);
            },
            [onChange],
        );

        const onClear = useCallback(() => {
            if (internalRef.current) {
                // Устанавливаем пустое значение
                internalRef.current.value = '';
                setHasValue(false);

                // Создаем синтетическое событие для совместимости с react-hook-form
                const syntheticEvent = {
                    target: internalRef.current,
                    currentTarget: internalRef.current,
                } as React.ChangeEvent<HTMLInputElement>;

                // Вызываем onChange с синтетическим событием
                onChange?.(syntheticEvent);
            }
        }, [onChange]);

        // Определяем, есть ли ошибка
        const hasError = useMemo(() => Boolean(errorMessage), [errorMessage]);

        const containerClassNames = classNames(
            styles['input-container'],
            styles[`input-container--${size}`],
            {
                [styles['input-container--error']]: hasError,
                [styles['input-container--disabled']]: disabled,
                [styles['input--with-leading-icon']]: leadingIcon,
            },
            className,
        );

        return (
            <div className={styles['input-wrapper']}>
                <div className={containerClassNames}>
                    {leadingIcon && <Icon name={leadingIcon} size={20} />}

                    <input
                        type={actualType}
                        ref={internalRef}
                        value={value}
                        disabled={disabled}
                        onChange={handleChange}
                        {...props}
                        className={styles.input}
                    />
                    {hasValue && !isPasswordField && (
                        <FlatButton onClick={onClear}>
                            <Icon name="xmark-gray-circle" size={20} />
                        </FlatButton>
                    )}
                    {isPasswordField && (
                        <FlatButton onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                            <Icon name={isPasswordVisible ? 'eye' : 'eye-slash'} size={20} />
                        </FlatButton>
                    )}
                </div>

                {errorMessage && (
                    <Text variant="12-reg" color="error-default">
                        {errorMessage}
                    </Text>
                )}
            </div>
        );
    },
);

export default TextInput;
```

## Другие потенциальные проблемы

1. **Отсутствие проверки на null в useImperativeHandle**: В текущем решении мы используем `internalRef.current!`, что утверждает, что значение не null. Это безопасно, так как useImperativeHandle будет вызван только после монтирования компонента, когда ref уже будет установлен.

2. **Потенциальная проблема с управляемыми компонентами**: Если компонент используется как управляемый (с пропсом `value`), то прямое изменение `internalRef.current.value` может не сработать корректно. Однако это стандартный подход для реализации кнопки очистки в React компонентах.

3. **Отсутствие обработки случая, когда ref является функцией**: Текущее решение с useImperativeHandle корректно обрабатывает оба типа ref (объект и функцию).

## Объяснение исправлений

1. **Добавление внутреннего ref**: Мы создаем `internalRef` с помощью `useRef` для гарантированного доступа к DOM элементу внутри компонента.

2. **Использование useImperativeHandle**: Этот хук позволяет нам экспортировать значение внутреннего ref через переданный извне ref, обеспечивая совместимость с обоими типами ref.

3. **Использование internalRef в onClear**: Теперь мы безопасно обращаемся к `internalRef.current` без риска ошибки TypeScript.

Эти изменения решают исходную проблему и обеспечивают корректную работу компонента с любым типом ref.