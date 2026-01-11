import React, { useState, useRef, useMemo, useCallback } from 'react';
import classNames from 'classnames';
import styles from './TextInput.module.scss';
import { Icon, type IconName } from '../Icon';
import { FlatButton } from '../FlatButton';
import Text from '../Text/Text';

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

export const TextInput: React.FC<TextInputProps> = ({
    size,
    leadingIcon,
    errorMessage,
    className = '',
    disabled = false,
    type = 'text',
    value,
    onChange,
    ...props
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const ref = useRef<HTMLInputElement>(null);

    // Определяем, показывать ли toggle для пароля
    const isPasswordField = useMemo(() => type === 'password', [type]);

    // Определяем актуальный тип инпута (для переключения видимости пароля)
    const actualType = useMemo(
        () => (isPasswordField && isPasswordVisible ? 'text' : type),
        [isPasswordField, isPasswordVisible, type],
    );
    const onClear = useCallback(() => {
        if (ref.current && onChange) {
            // Устанавливаем пустое значение
            ref.current.value = '';

            // Создаем синтетическое событие для совместимости с react-hook-form
            const syntheticEvent = {
                target: ref.current,
                currentTarget: ref.current,
            } as React.ChangeEvent<HTMLInputElement>;

            // Вызываем onChange с синтетическим событием
            onChange(syntheticEvent);
        }
    }, [onChange, ref]);

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
                    {...{ ref, value, disabled, onChange }}
                    {...props}
                    className={styles.input}
                />
                {value && !isPasswordField && (
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
};

export default TextInput;
