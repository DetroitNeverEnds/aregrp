import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import styles from './Sheet.module.scss';
import { Flex, type FlexProps } from '@/components/ui/common/Flex';
import Icon from '@/components/ui/common/Icon';
import FlatButton from '@/components/ui/common/FlatButton';

export interface SheetProps extends FlexProps {
    /** Открыт ли лист */
    open: boolean;
    /** Закрытие по кнопке, фону или Escape */
    onClose: () => void;
    children: React.ReactNode;
    closeOnBackdropClick?: boolean;
    lockBodyScroll?: boolean;
    /** Заголовок над контентом (слева от кнопки закрытия) */
    title?: React.ReactNode;
    /** Показывать кнопку закрытия в шапке */
    showCloseButton?: boolean;
    panelClassName?: string;
    rootClassName?: string;
}

/**
 * Выезжающая снизу панель (bottom sheet) для мобильных сценариев: затемнение фона,
 * блокировка скролла страницы, закрытие по Escape и клику по подложке.
 */
export const Sheet: React.FC<SheetProps> = ({
    open,
    onClose,
    children,
    closeOnBackdropClick = true,
    lockBodyScroll = true,
    title,
    showCloseButton = true,
    panelClassName,
    rootClassName,
    ...flexProps
}) => {
    useEffect(() => {
        if (!open) {
            return;
        }
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    useEffect(() => {
        if (!open || !lockBodyScroll) {
            return;
        }
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open, lockBodyScroll]);

    if (!open) {
        return null;
    }

    const showHeader = Boolean(title) || showCloseButton;
    const headerJustify =
        title && showCloseButton ? 'between' : title ? 'start' : 'end';

    return createPortal(
        <div
            className={classNames(styles.sheet__root, rootClassName)}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={styles.sheet__backdrop}
                onClick={closeOnBackdropClick ? onClose : undefined}
            />
            <Flex
                direction="column"
                fullWidth
                gap={showHeader ? 8 : 0}
                className={classNames(styles.sheet__panel, panelClassName)}
            >
                {showHeader ? (
                    <Flex
                        direction="row"
                        align="center"
                        justify={headerJustify}
                        fullWidth
                        gap={12}
                        className={styles.sheet__header}
                    >
                        {title ? <div className={styles.sheet__title}>{title}</div> : null}
                        {showCloseButton ? (
                            <FlatButton type="button" onClick={onClose} aria-label="Закрыть">
                                <Icon name="x-close" size={32} />
                            </FlatButton>
                        ) : null}
                    </Flex>
                ) : null}
                <Flex
                    {...flexProps}
                    fullWidth
                    className={classNames(styles.sheet__content, flexProps.className)}
                >
                    {children}
                </Flex>
            </Flex>
        </div>,
        document.body,
    );
};
