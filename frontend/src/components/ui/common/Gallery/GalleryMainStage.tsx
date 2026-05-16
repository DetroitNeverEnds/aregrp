import React from 'react';
import classNames from 'classnames';

import styles from './GalleryMainStage.module.scss';
import type { GalleryMedia } from './Gallery.types';
import { Button } from '@/components/ui/common/Button';

export type GalleryMainStageProps = {
    item: GalleryMedia;
    variant: 'preview' | 'full';
    fit: 'cover' | 'contain';
    className?: string;
    onClick?: () => void;
};

/**
 * Основная сцена галереи:
 * в `preview` режиме показывает превью, в `full` — полноразмерный media-контент.
 */
export const GalleryMainStage: React.FC<GalleryMainStageProps> = ({
    item,
    variant,
    fit,
    className,
    onClick,
}) => {
    const mediaClass = classNames(styles.media, styles[`media__fit-${fit}`], className);
    const fullSrc = item.full_url ?? item.url;

    return (
        <>
            {variant === 'preview' && (
                <div
                    key={item.url}
                    className={classNames(styles.mainStage, {
                        [styles.mainStage__clickable]: onClick !== undefined,
                    })}
                    onClick={onClick}
                >
                    <img src={item.url} alt="" className={mediaClass} />
                    {item.type === 'video' && (
                        <div className={styles.videoPreviewOverlay} aria-hidden>
                            <Button
                                variant="secondary"
                                icon="play"
                                onlyIcon
                                iconColor="gray-100"
                                onClick={e => {
                                    e.stopPropagation();
                                    onClick?.();
                                }}
                            />
                        </div>
                    )}
                </div>
            )}
            {variant === 'full' && (
                <>
                    <div
                        className={classNames(styles.mainStage, {
                            [styles.mainStage__clickable]: onClick !== undefined,
                        })}
                        key={fullSrc}
                        onClick={onClick}
                    >
                        {item.type === 'photo' && <img src={fullSrc} className={mediaClass} />}
                        {item.type === 'video' && (
                            <video
                                key={fullSrc}
                                className={mediaClass}
                                src={fullSrc}
                                controls
                                muted={true}
                                playsInline
                                autoPlay
                                loop
                            />
                        )}
                    </div>
                </>
            )}
        </>
    );
};
