import React from 'react';
import { Flex } from '../../common/Flex';
import { Form } from '../../common/Form';
import { Text } from '../../common/Text';
import { Button } from '../../common/Button';
import { Divider } from '../../common/Divider';

export interface AuthFormProps {
    /** Заголовок формы */
    title: string;

    /** Описание под заголовком (опционально) */
    description?: string;

    /** Содержимое формы (поля ввода) */
    children: React.ReactNode;

    /** Дополнительные опции между полями и кнопкой (чекбоксы, ссылки) */
    additionalOptions?: React.ReactNode;

    /** Обработчик отправки формы */
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;

    /** Текст кнопки отправки */
    submitText: string;

    /** Футер формы (обычно ссылки на другие страницы) */
    footer?: React.ReactNode;

    /** Состояние загрузки/отправки */
    isSubmitting?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
    title,
    description,
    children,
    additionalOptions,
    onSubmit,
    submitText,
    footer,
    isSubmitting = false,
}) => {
    return (
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
                    </Flex>

                    {/* Содержимое формы */}
                    <Flex gap={20}>
                        <Flex gap={10}>{children}</Flex>
                        {additionalOptions && <div>{additionalOptions}</div>}
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
    );
};

export default AuthForm;
