import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import styles from './Modal.module.scss';

export interface ModalProps {
    /** Открыто ли окно */
    open: boolean;
    /** Закрытие (Escape, клик по фону при `closeOnBackdropClick`) */
    onClose: () => void;
    children: React.ReactNode;
    /** Закрывать по клику на затемнённый фон */
    closeOnBackdropClick?: boolean;
    /** Блокировать прокрутку `body` пока открыто */
    lockBodyScroll?: boolean;
    /** Доп. класс панели (белая карточка) */
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({
    open,
    onClose,
    children,
    closeOnBackdropClick = true,
    lockBodyScroll = true,
    className = '',
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

    const handleBackdropClick = () => {
        if (closeOnBackdropClick) {
            onClose();
        }
    };

    return createPortal(
        <div className={styles.root}>
            <div
                className={styles.backdrop}
                aria-hidden
                data-testid="modal-backdrop"
                onClick={handleBackdropClick}
            />
            <div className={classNames(styles.panel, className)} role="dialog" aria-modal="true">
                {children}
            </div>
        </div>,
        document.body,
    );
};
