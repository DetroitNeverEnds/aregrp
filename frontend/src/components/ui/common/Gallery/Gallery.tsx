import React, { useMemo, useState } from 'react';

import styles from './Gallery.module.scss';
import { Flex } from '@/components/ui/common/Flex';
import type { BuildingCatalogue, MediaItem, PremiseListItem } from '@/api';
import _ from 'lodash';
import classNames from 'classnames';
import { Button } from '@/components/ui/common/Button';

export type GalleryProps = {
    media?: MediaItem[];
    premise?: PremiseListItem;
    building?: BuildingCatalogue;

    className?: string;
};

export const Gallery = (props: GalleryProps) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);
    const media: MediaItem[] = useMemo(() => {
        return _.concat(
            props.media || [],
            props.premise?.media.photos.map(item => ({
                type: 'photo',
                link: item.url,
            })) || [],
            props.premise?.media.videos.map(item => ({
                type: 'video',
                link: item.url,
            })) || [],
            props.building?.media || [],
        );
    }, [
        props.building?.media,
        props.media,
        props.premise?.media.photos,
        props.premise?.media.videos,
    ]);

    return (
        <div className={classNames(styles.container, props.className)}>
            {media.map((media, index) => (
                <React.Fragment key={media.link}>
                    {media.type === 'photo' && (
                        <img
                            key={index}
                            src={media.link}
                            className={classNames(styles.media, {
                                [styles.media__inactive]: index !== currentMediaIndex,
                            })}
                        />
                    )}
                    {media.type === 'video' && (
                        <video
                            key={index}
                            src={media.link}
                            className={classNames(styles.media, {
                                [styles.media__inactive]: index !== currentMediaIndex,
                            })}
                            // controls
                            autoPlay
                        />
                    )}
                </React.Fragment>
            ))}

            {/* Left control */}
            {currentMediaIndex > 0 && (
                <Button
                    variant="secondary"
                    icon="chevron-left"
                    onlyIcon
                    className={classNames(styles.control, styles.control__left)}
                    onClick={() => setCurrentMediaIndex(currentMediaIndex - 1)}
                />
            )}

            {/* Right control */}
            {currentMediaIndex < media.length - 1 && (
                <Button
                    variant="secondary"
                    icon="chevron-right"
                    onlyIcon
                    className={classNames(styles.control, styles.control__right)}
                    onClick={() => setCurrentMediaIndex(currentMediaIndex + 1)}
                />
            )}

            {/* Lower slider */}
            <Flex direction="row" className={styles.slider} gap={4} fullWidth>
                {media.map((_, index) => (
                    <div
                        key={index}
                        className={classNames(styles.slider__item, {
                            [styles.slider__item__active]: index === currentMediaIndex,
                        })}
                    />
                ))}
            </Flex>
        </div>
    );
};
