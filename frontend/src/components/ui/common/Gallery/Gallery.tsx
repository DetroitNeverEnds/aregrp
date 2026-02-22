import React, { useMemo, useState } from 'react';

import styles from './Gallery.module.scss';
import { Flex } from '@/components/ui/common/Flex';
import type { PremiseListItem } from '@/api';
import _ from 'lodash';
import classNames from 'classnames';
import { Button } from '@/components/ui/common/Button';

export type Media = {
    type: 'photo' | 'video';
    url: string;
};

export type GalleryProps = {
    media?: Media[];
    premise?: PremiseListItem;

    className?: string;
};

export const Gallery = (props: GalleryProps) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);
    const media: Media[] = useMemo(() => {
        return _.concat(
            props.media || [],
            props.premise?.media.photos.map(proto => ({
                type: 'photo',
                url: proto.url,
            })) || [],
            props.premise?.media.videos.map(proto => ({
                type: 'video',
                url: proto.url,
            })) || [],
        );
    }, [props.media, props.premise]);

    return (
        <div className={classNames(styles.container, props.className)}>
            {media.map((media, index) => (
                <React.Fragment>
                    {media.type === 'photo' && (
                        <img
                            key={index}
                            src={media.url}
                            className={classNames(styles.media, {
                                [styles.media__inactive]: index !== currentMediaIndex,
                            })}
                        />
                    )}
                    {media.type === 'video' && (
                        <video
                            key={index}
                            src={media.url}
                            className={classNames(styles.media, {
                                [styles.media__inactive]: index !== currentMediaIndex,
                            })}
                        />
                    )}
                </React.Fragment>
            ))}

            {/* Left control */}
            {currentMediaIndex > 0 && (
                <Button
                    variant="outlined"
                    icon="chevron-left"
                    onlyIcon
                    className={classNames(styles.control, styles.control__left)}
                    onClick={() => setCurrentMediaIndex(currentMediaIndex - 1)}
                />
            )}

            {/* Right control */}
            {currentMediaIndex < media.length - 1 && (
                <Button
                    variant="outlined"
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
