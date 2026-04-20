import React from 'react';
import { Flex } from '@/components/ui/common/Flex';
import { Form } from '@/components/ui/common/Form';
import { Text } from '@/components/ui/common/Text';
import { Button } from '@/components/ui/common/Button';
import { Divider } from '@/components/ui/common/Divider';
import { Loader } from '@/components/ui/common/Loader';
import styles from './AuthForm.module.scss';

export interface AuthFormProps {
    /** Заголовок формы */
    title: string;

    /** Описание под заголовком (опционально) */
    description?: string;

    /** Содержимое формы (поля ввода) */
    children: React.ReactNode;

    /** Дополнительные опции между полями и кнопкой (чекбоксы, ссылки) */
    additionalOptionsUpper?: React.ReactNode;
    /** Дополнительные опции между полями и кнопкой (чекбоксы, ссылки) */
    additionalOptionsLower?: React.ReactNode;

    /** Обработчик отправки формы */
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;

    /** Текст кнопки отправки */
    submitText: string;

    /** Футер формы (обычно ссылки на другие страницы) */
    footer?: React.ReactNode;

    errorMessage?: string;

    /** Состояние загрузки/отправки */
    isSubmitting?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
    title,
    description,
    children,
    additionalOptionsUpper,
    additionalOptionsLower,
    onSubmit,
    submitText,
    footer,
    errorMessage,
    isSubmitting = false,
}) => {
    return (
        <div className={styles.formWrapper}>
            <Flex gap={20} align="start" fullWidth>
                <Form onSubmit={onSubmit}>
                    <Flex align="start" gap={40}>
                        {/* Заголовок и описание */}
                        <Flex align="start" gap={20} fullWidth>
                            <Text variant="h3">{title}</Text>
                            {description && (
                                <Text variant="16-reg" color="gray-50">
                                    {description}
                                </Text>
                            )}
                            {errorMessage && (
                                <Text variant="16-reg" color="error-default">
                                    {errorMessage}
                                </Text>
                            )}
                        </Flex>

                        {/* Содержимое формы */}
                        <Flex gap={20} fullWidth align="start">
                            {additionalOptionsUpper && additionalOptionsUpper}
                            <Flex gap={10} fullWidth align="start">
                                {children}
                            </Flex>
                            {additionalOptionsLower && additionalOptionsLower}
                        </Flex>

                        {/* Кнопка отправки */}
                        <Button
                            variant="primary"
                            size="lg"
                            width="max"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {submitText}
                        </Button>
                    </Flex>
                </Form>

                {/* Футер */}
                {footer && (
                    <>
                        <Divider />
                        {footer}
                    </>
                )}
            </Flex>

            {/* Лоадер при отправке */}
            {isSubmitting && <Loader variant="overlay" spinnerSize="lg" />}
        </div>
    );
};

export default AuthForm;
