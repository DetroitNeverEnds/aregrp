import React, { useMemo, useState } from 'react';

import styles from './Gallery.module.scss';
import { Flex } from '@/components/ui/common/Flex';
import type { BuildingCatalogue, PremiseListItem } from '@/api';
import _ from 'lodash';
import classNames from 'classnames';
import { Button } from '@/components/ui/common/Button';

export type GalleryMedia = {
    type: 'photo' | 'video';
    url: string;
};

export type GalleryProps = {
    media?: GalleryMedia[];
    premise?: PremiseListItem;
    building?: BuildingCatalogue;

    size?: 'm' | 'l';
    fit?: 'cover' | 'contain';
    className?: string;
};

export const Gallery = ({
    media: rawMedia,
    premise,
    building,
    size = 'm',
    fit = 'cover',
    className,
}: GalleryProps) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);
    const media: GalleryMedia[] = useMemo(() => {
        return _.concat(
            rawMedia || [],
            premise?.media.photos.map(item => ({
                type: 'photo',
                url: item.url,
            })) || [],
            premise?.media.videos.map(item => ({
                type: 'video',
                url: item.url,
            })) || [],
            building?.media.map(el => ({ type: el.type, url: el.link })) || [],
        );
    }, [building?.media, rawMedia, premise?.media.photos, premise?.media.videos]);

    return (
        <div className={classNames(styles.container, styles[`container__size-${size}`], className)}>
            {media.map((media, index) => (
                <React.Fragment key={media.url}>
                    {media.type === 'photo' && (
                        <img
                            key={index}
                            src={media.url}
                            className={classNames(styles.media, styles[`media__fit-${fit}`], {
                                [styles.media__inactive]: index !== currentMediaIndex,
                            })}
                        />
                    )}
                    {media.type === 'video' && (
                        <video
                            key={index}
                            src={media.url}
                            className={classNames(styles.media, styles[`media__fit-${fit}`], {
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
            <Flex
                direction="row"
                className={classNames(styles.slider, styles[`slider__size-${size}`])}
                gap={4}
                fullWidth
            >
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
