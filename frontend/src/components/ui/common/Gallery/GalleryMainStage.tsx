import React from 'react';
import classNames from 'classnames';

import styles from './GalleryMainStage.module.scss';
import type { GalleryMedia } from './Gallery.types';
import { Button } from '../Button';

export type GalleryMainStageProps = {
    item: GalleryMedia;
    variant: 'preview' | 'full';
    fit: 'cover' | 'contain';
    className?: string;
    /** В режиме preview: клик открывает полный просмотр */
    onOpen?: () => void;
};

export const GalleryMainStage: React.FC<GalleryMainStageProps> = ({
    item,
    variant,
    fit,
    className,
    onOpen,
}) => {
    const mediaClass = classNames(styles.media, styles[`media__fit-${fit}`], className);
    const fullSrc = item.full_url ?? item.url;

    return (
        <>
            {variant === 'preview' && (
                <div
                    key={item.url}
                    className={classNames(styles.mainStage, {
                        [styles.mainStage__clickable]: onOpen !== undefined,
                    })}
                    onClick={onOpen}
                >
                    <img src={item.url} alt="" className={mediaClass} />
                    {item.type === 'video' && (
                        <div className={styles.videoPreviewOverlay} aria-hidden>
                            <Button
                                variant="secondary"
                                icon="play"
                                onlyIcon
                                iconColor="gray-100"
                                onClick={onOpen}
                            />
                        </div>
                    )}
                </div>
            )}
            {variant === 'full' && (
                <>
                    <div className={styles.mainStage} key={fullSrc}>
                        {item.type === 'photo' && <img src={fullSrc} className={mediaClass} />}
                        {item.type === 'video' && (
                            <video
                                key={fullSrc}
                                className={mediaClass}
                                src={fullSrc}
                                controls={false}
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
