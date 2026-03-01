import React, { useCallback } from 'react';
import classNames from 'classnames';
import styles from './Switch.module.scss';
import { Text } from '../../Text';
import { Flex } from '../../Flex';

export interface SwitchOption {
    /** Значение опции */
    value: string;
    /** Метка опции (текст или React компонент) */
    label: React.ReactNode;
}

export interface SwitchProps {
    /** Массив из двух опций для переключения */
    options: [SwitchOption, SwitchOption];
    /** Выбранное значение */
    value?: string;
    /** Обработчик изменения значения */
    onChange?: (value: string) => void;
    /** Отключить компонент */
    disabled?: boolean;
    /** Дополнительный CSS класс */
    className?: string;

    fullWidth?: boolean;
}

export const Switch = React.forwardRef<HTMLDivElement, SwitchProps>(
    ({ options, value, onChange, disabled = false, className = '', fullWidth = false }, ref) => {
        const handleChange = useCallback(
            (optionValue: string) => {
                if (!disabled && onChange && value !== optionValue) {
                    onChange(optionValue);
                }
            },
            [disabled, onChange, value],
        );

        // const handleKeyDown = useCallback(
        //     (e: React.KeyboardEvent, optionValue: string) => {
        //         if (disabled) return;

        //         if (e.key === ' ' || e.key === 'Enter') {
        //             e.preventDefault();
        //             handleChange(optionValue);
        //         }
        //     },
        //     [disabled, handleChange],
        // );

        const containerClassNames = classNames(
            styles['switch-container'],
            {
                [styles['switch-container--disabled']]: disabled,
            },
            className,
        );

        return (
            <Flex
                direction="row"
                gap={4}
                className={containerClassNames}
                role="radiogroup"
                fullWidth={fullWidth}
                ref={ref}
            >
                {options.map(option => {
                    const isActive = value === option.value;

                    const buttonClassNames = classNames(styles['switch-button'], {
                        [styles['switch-button--active']]: isActive,
                        [styles['switch-button--disabled']]: disabled,
                    });

                    return (
                        <button
                            key={option.value}
                            type="button"
                            className={buttonClassNames}
                            onClick={() => handleChange(option.value)}
                            disabled={disabled}
                            role="radio"
                        >
                            <Text
                                ellipsis
                                variant="16-reg"
                                className={styles['switch-button__text']}
                            >
                                {option.label}
                            </Text>
                        </button>
                    );
                })}
            </Flex>
        );
    },
);

Switch.displayName = 'Switch';

export default Switch;
