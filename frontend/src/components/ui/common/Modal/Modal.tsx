import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import styles from './Modal.module.scss';
import { Flex, type FlexProps } from '../Flex';
import Icon from '../Icon';
import FlatButton from '../FlatButton';

export interface ModalProps extends FlexProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    closeOnBackdropClick?: boolean;
    lockBodyScroll?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    open,
    onClose,
    children,
    closeOnBackdropClick = true,
    lockBodyScroll = true,
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

    return createPortal(
        <Flex justify="center" align="center" className={styles.root}>
            <div className={styles.backdrop} onClick={closeOnBackdropClick ? onClose : undefined} />
            <Flex className={styles.panel}>
                <Flex direction="row" justify="end" fullWidth className={styles.header}>
                    <FlatButton onClick={onClose}>
                        <Icon name="x-close" size={32} />
                    </FlatButton>
                </Flex>
                <Flex
                    {...flexProps}
                    fullWidth
                    className={classNames(styles.content, flexProps.className)}
                >
                    {children}
                </Flex>
            </Flex>
        </Flex>,
        document.body,
    );
};
