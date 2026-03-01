import { useState, useRef, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './Dropdown.module.scss';
import { Flex } from '../Flex';
import Icon from '../Icon';
import FlatButton from '../FlatButton';

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
}

export function Dropdown({
    trigger,
    children,
    isOpened: externalIsOpened,
    onOpenChange,
    disabled = false,
    fullWidth = false,
    // contentSameTriggerWidth = true,
    className,
    triggerClassName,
    dropdownClassName,
    size = 'lg',
}: DropdownProps) {
    const [internalIsOpened, setInternalIsOpened] = useState(externalIsOpened && !disabled);

    const isOpened = externalIsOpened !== undefined ? externalIsOpened : internalIsOpened;

    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = useCallback(() => {
        if (!disabled) {
            const newState = !isOpened;

            if (onOpenChange) {
                onOpenChange(newState);
            } else {
                setInternalIsOpened(newState);
            }
        }
    }, [disabled, isOpened, onOpenChange]);

    const handleClose = useCallback(() => {
        if (!disabled) {
            if (onOpenChange) {
                onOpenChange(false);
            } else {
                setInternalIsOpened(false);
            }
        }
    }, [disabled, onOpenChange]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };

        if (isOpened) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpened, handleClose, containerRef]);

    const triggerClassNames = classNames(
        styles['dropdown-button'],
        styles[`dropdown-button--${size}`],
        {
            [styles['dropdown-button--open']]: isOpened,
            [styles['dropdown-button--disabled']]: disabled,
        },
        triggerClassName,
    );

    const dropdownClassNames = classNames(styles['dropdown-content'], dropdownClassName);

    return (
        <div
            className={classNames(
                styles['dropdown-container'],
                { [styles['dropdown-container--full-width']]: fullWidth },
                className,
            )}
            ref={containerRef}
        >
            <Flex
                direction="row"
                justify="between"
                gap={8}
                className={triggerClassNames}
                ref={triggerRef}
                onClick={handleToggle}
            >
                {trigger}
                <FlatButton
                    onClick={e => {
                        e.stopPropagation();
                        handleToggle();
                    }}
                >
                    <Icon name={isOpened ? 'chevron-up' : 'chevron-down'} size={24} />
                </FlatButton>
            </Flex>

            {isOpened && (
                <div ref={dropdownRef} className={dropdownClassNames} role="listbox">
                    {children}
                </div>
            )}
        </div>
    );
}

export default Dropdown;
