import React from 'react';
import classNames from 'classnames';
import { Flex } from '@/components/ui/common/Flex';
import { Form } from '@/components/ui/common/Form';
import { Text } from '@/components/ui/common/Text';
import { Button } from '@/components/ui/common/Button';
import { Divider } from '@/components/ui/common/Divider';
import { Loader } from '@/components/ui/common/Loader';
import styles from './AuthForm.module.scss';
import { useIsMobile } from '@/hooks';

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
    const compact = useIsMobile();

    const outerGap = compact ? 24 : 20;
    const mainGap = compact ? 24 : 40;
    const titleBlockGap = compact ? 16 : 20;
    const fieldsColumnGap = compact ? 16 : 20;
    const fieldsInnerGap = compact ? 12 : 10;

    return (
        <div className={classNames(styles.formWrapper, compact && styles.formWrapper_compact)}>
            <Flex gap={outerGap} align="start" fullWidth>
                <Form onSubmit={onSubmit}>
                    <Flex align="start" gap={mainGap}>
                        {/* Заголовок и описание */}
                        <Flex align="start" gap={titleBlockGap} fullWidth>
                            <Text
                                variant={compact ? 'h5' : 'h3'}
                                color={compact ? 'gray-100' : undefined}
                            >
                                {title}
                            </Text>
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
                        <Flex gap={fieldsColumnGap} fullWidth align="start">
                            {additionalOptionsUpper && additionalOptionsUpper}
                            <Flex gap={fieldsInnerGap} fullWidth align="start">
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
