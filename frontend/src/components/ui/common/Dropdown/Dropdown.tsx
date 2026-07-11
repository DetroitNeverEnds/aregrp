import { useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
    useFloating,
    useDismiss,
    useClick,
    useInteractions,
    flip,
    autoUpdate,
} from '@floating-ui/react';
import classNames from 'classnames';
import styles from './Dropdown.module.scss';
import { Flex } from '@/components/ui/common/Flex';
import Icon from '@/components/ui/common/Icon';
import FlatButton from '@/components/ui/common/FlatButton';

export type Size = 'lg' | 'sm' | 'tiny';

export interface DropdownProps {
    trigger: ReactNode;
    children: ReactNode;
    size?: Size;
    onOpenChange?: (isOpen: boolean) => void;
    disabled?: boolean;
    contentSameTriggerWidth?: boolean;
    fullWidth?: boolean;
    className?: string;
    triggerClassName?: string;
    dropdownClassName?: string;
    isOpened?: boolean;
    maxHeight?: number;
    isError?: boolean;
}

export function Dropdown({
    trigger,
    children,
    isOpened,
    onOpenChange,
    disabled = false,
    fullWidth = false,
    className,
    maxHeight = 500,
    triggerClassName,
    dropdownClassName,
    size = 'lg',
    isError: error = false,
}: DropdownProps) {
    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (disabled && open) return;
            onOpenChange?.(open);
        },
        [disabled, onOpenChange],
    );

    const { refs, floatingStyles, context } = useFloating({
        placement: 'bottom-start',
        open: isOpened,
        onOpenChange: handleOpenChange,
        whileElementsMounted: autoUpdate,
        middleware: [flip()],
    });
    const { setReference, setFloating } = refs;
    const dismiss = useDismiss(context, { outsidePressEvent: 'mousedown' });
    const click = useClick(context, { enabled: !disabled });
    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

    const triggerClassNames = classNames(
        styles['dropdown-container'],
        styles[`dropdown-container--${size}`],
        className,
        {
            [styles['dropdown-container__full-width']]: fullWidth,
            [styles['dropdown-container--open']]: isOpened,
            [styles['dropdown-container--disabled']]: disabled,
            [styles['dropdown-container--error']]: error,
        },
        triggerClassName,
    );

    return (
        <>
            <Flex
                direction="row"
                justify="between"
                gap={8}
                className={triggerClassNames}
                ref={setReference}
                {...getReferenceProps()}
            >
                {trigger}
                <FlatButton tabIndex={-1} disabled={disabled}>
                    <Icon name={isOpened ? 'chevron-up' : 'chevron-down'} size={24} />
                </FlatButton>
            </Flex>
            {isOpened &&
                createPortal(
                    <div ref={setFloating} style={floatingStyles} {...getFloatingProps()}>
                        <Flex
                            className={classNames(styles['dropdown-content'], dropdownClassName)}
                            data-testid="dropdown-panel"
                        >
                            <div
                                className={styles['dropdown-content__inner']}
                                style={{ maxHeight }}
                            >
                                {children}
                            </div>
                        </Flex>
                    </div>,
                    document.body,
                )}
        </>
    );
}

export default Dropdown;
