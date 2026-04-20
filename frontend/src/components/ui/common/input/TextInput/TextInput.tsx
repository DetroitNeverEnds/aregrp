import React, { useMemo, useCallback, type ReactNode, forwardRef } from 'react';
import classNames from 'classnames';
import styles from './TextInput.module.scss';
import { Icon, type IconName } from '@/components/ui/common/Icon';
import { FlatButton } from '@/components/ui/common/FlatButton';
import Text from '@/components/ui/common/Text/Text';

export type TextInputSize = 'lg' | 'md';
export type TextInputWidth = 'auto' | 'max';

type AdditionalInputProps = {
    /** Размер инпута */
    size?: TextInputSize;
    /** Иконка слева (например, search, mail-simple) */
    leadingIcon?: IconName;
    /** Сообщение об ошибке (при наличии инпут становится невалидным с темой error) */
    errorMessage?: string;
    /** Trailing label */
    trailingLabel?: string | ReactNode;
    /** Показывать кнопку очистки */
    clearable?: boolean;
    /** Обработчик изменения значения */
    onChange: (val: string) => void;
};
export type TextInputProps = Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    keyof AdditionalInputProps
> &
    AdditionalInputProps;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    (
        {
            size = 'md',
            leadingIcon,
            errorMessage,
            className = '',
            disabled = false,
            type = 'text',
            value = '',
            onChange,
            trailingLabel,
            clearable = true,
            ...props
        },
        ref,
    ) => {
        const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
        const hasValue = useMemo(() => Boolean(value), [value]);

        // Определяем, показывать ли toggle для пароля
        const isPasswordField = useMemo(() => type === 'password', [type]);

        // Определяем актуальный тип инпута (для переключения видимости пароля)
        const actualType = useMemo(
            () => (isPasswordField && isPasswordVisible ? 'text' : type),
            [isPasswordField, isPasswordVisible, type],
        );

        // Обработчик изменения
        const handleChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                onChange(e.target.value);
            },
            [onChange],
        );

        const onClear = useCallback(() => {
            onChange('');
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
                        value={value}
                        disabled={disabled}
                        onChange={handleChange}
                        ref={ref}
                        {...props}
                        className={classNames(styles.input, styles[`input--${size}`])}
                    />
                    {clearable && hasValue && !isPasswordField && (
                        <FlatButton onClick={onClear}>
                            <Icon name="xmark-gray-circle" size={20} />
                        </FlatButton>
                    )}
                    {trailingLabel}
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

TextInput.displayName = 'TextInput';

export default TextInput;
