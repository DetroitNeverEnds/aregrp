import React from 'react';
import { Flex } from '../../common/Flex';
import { Form } from '../../common/Form';
import { Text } from '../../common/Text';
import { Button } from '../../common/Button';
import { Divider } from '../../common/Divider';
import { Loader } from '../../common/Loader';
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
            <Flex gap={20} fullWidth>
                <Form onSubmit={onSubmit}>
                    <Flex gap={40}>
                        {/* Заголовок и описание */}
                        <Flex gap={20}>
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
                        <Flex gap={20}>
                            {additionalOptionsUpper && <div>{additionalOptionsUpper}</div>}
                            <Flex gap={10}>{children}</Flex>
                            {additionalOptionsLower && <div>{additionalOptionsLower}</div>}
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
            {isSubmitting && <Loader spinnerSize="lg" aria-label="Отправка формы" />}
        </div>
    );
};

export default AuthForm;
