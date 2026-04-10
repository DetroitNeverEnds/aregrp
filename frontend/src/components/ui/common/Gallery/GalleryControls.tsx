import React from 'react';
import classNames from 'classnames';

import styles from './GalleryControls.module.scss';
import { Button } from '@/components/ui/common/Button';
import { Flex } from '@/components/ui/common/Flex';

export type GalleryControlsProps = {
    currentIndex: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
    size: 'm' | 'l';
    /** Кнопки поверх модалки — чуть выше по z-index */
    placement?: 'inline' | 'modal';
};

export const GalleryControls: React.FC<GalleryControlsProps> = ({
    currentIndex,
    total,
    onPrev,
    onNext,
    size,
    placement = 'inline',
}) => {
    const showNav = total > 1;

    return (
        <>
            {showNav && currentIndex > 0 && (
                <Button
                    variant="secondary"
                    icon="chevron-left"
                    onlyIcon
                    type="button"
                    className={classNames(
                        styles.control,
                        styles.control__left,
                        placement === 'modal' && styles.control__modal,
                    )}
                    onClick={onPrev}
                />
            )}
            {showNav && currentIndex < total - 1 && (
                <Button
                    variant="secondary"
                    icon="chevron-right"
                    onlyIcon
                    type="button"
                    className={classNames(
                        styles.control,
                        styles.control__right,
                        placement === 'modal' && styles.control__modal,
                    )}
                    onClick={onNext}
                />
            )}

            {total > 0 && (
                <Flex
                    direction="row"
                    className={classNames(styles.slider, styles[`slider__size-${size}`])}
                    gap={4}
                    fullWidth
                >
                    {Array.from({ length: total }).map((_, index) => (
                        <div
                            key={index}
                            className={classNames(styles.slider__item, {
                                [styles.slider__item__active]: index === currentIndex,
                            })}
                        />
                    ))}
                </Flex>
            )}
        </>
    );
};
