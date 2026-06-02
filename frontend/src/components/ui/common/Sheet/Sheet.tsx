import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import styles from './Sheet.module.scss';
import { Flex, type FlexProps } from '@/components/ui/common/Flex';
import Icon from '@/components/ui/common/Icon';
import FlatButton from '@/components/ui/common/FlatButton';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

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

    useBodyScrollLock(open && lockBodyScroll);

    const panelRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    const [panelHeight, setPanelHeight] = useState<number | undefined>(undefined);

    useLayoutEffect(() => {
        if (!open) {
            setPanelHeight(undefined);
            return;
        }

        const panel = panelRef.current;
        const body = bodyRef.current;
        if (!panel || !body) {
            return;
        }

        const updateHeight = () => {
            const { paddingTop, paddingBottom } = getComputedStyle(panel);
            setPanelHeight(
                body.offsetHeight + parseFloat(paddingTop) + parseFloat(paddingBottom),
            );
        };

        updateHeight();

        const observer = new ResizeObserver(updateHeight);
        observer.observe(body);

        return () => observer.disconnect();
    }, [open, title, showCloseButton]);

    if (!open) {
        return null;
    }

    const showHeader = Boolean(title) || showCloseButton;
    const headerJustify = title && showCloseButton ? 'between' : title ? 'start' : 'end';

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
                ref={panelRef}
                direction="column"
                fullWidth
                gap={0}
                className={classNames(styles.sheet__panel, panelClassName)}
                style={panelHeight !== undefined ? { height: panelHeight } : undefined}
            >
                <div
                    ref={bodyRef}
                    className={styles.sheet__body}
                    style={{ gap: showHeader ? 8 : 0 }}
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
                </div>
            </Flex>
        </div>,
        document.body,
    );
};
