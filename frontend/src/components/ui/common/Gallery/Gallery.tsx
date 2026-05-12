import { useEffect, useMemo, useState } from 'react';

import styles from './Gallery.module.scss';
import type { BuildingCatalogue, PremiseListItem } from '@/api';
import classNames from 'classnames';
import { GalleryMainStage } from './GalleryMainStage';
import { GalleryControls } from './GalleryControls';
import { GalleryModal } from './GalleryModal';
import type { GalleryMedia } from './Gallery.types';

export type { GalleryMedia } from './Gallery.types';

export type GalleryProps = {
    media?: GalleryMedia[];
    premise?: PremiseListItem;
    building?: BuildingCatalogue;

    type?: 'thumbs' | 'full';
    /** Только для `type="thumbs"`: либо открыть модалку, либо выполнить колбэк по клику на превью */
    onClick?: (() => void) | 'openFull';
    size?: 'm' | 'l';
    fit?: 'cover' | 'contain';
    className?: string;
};

type GalleryBodyProps = Omit<GalleryProps, 'media' | 'premise' | 'building'> & {
    media: GalleryMedia[];
};

const preloadedImageUrls = new Set<string>();

const preloadImage = (url?: string) => {
    if (!url || preloadedImageUrls.has(url)) {
        return;
    }

    const image = new Image();
    image.src = url;
    preloadedImageUrls.add(url);
};

/** Локальное состояние слайда/модалки; `key={media.length}` снаружи сбрасывает индекс при смене числа элементов. */
const GalleryBody = ({
    media,
    type = 'thumbs',
    onClick = 'openFull',
    size = 'm',
    fit = 'cover',
    className,
}: GalleryBodyProps) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);

    const variant = type === 'thumbs' ? 'preview' : 'full';

    const isOpenFullClick = type === 'thumbs' && onClick === 'openFull';
    const stageClickHandler =
        onClick === 'openFull'
            ? type === 'thumbs'
                ? () => setModalOpen(true)
                : undefined
            : onClick;

    const safeIndex = Math.min(currentMediaIndex, Math.max(0, media.length - 1));
    const current = media[safeIndex];

    useEffect(() => {
        if (media.length === 0) {
            return;
        }

        const prevIndex = (safeIndex - 1 + media.length) % media.length;
        const nextIndex = (safeIndex + 1) % media.length;
        const candidates = [media[safeIndex], media[prevIndex], media[nextIndex]];

        candidates.forEach(item => {
            if (item?.type !== 'photo') {
                return;
            }

            preloadImage(item.url);
            preloadImage(item.full_url);
        });
    }, [media, safeIndex]);

    return (
        <div className={classNames(styles.container, styles[`container__size-${size}`], className)}>
            <GalleryMainStage
                item={current}
                variant={variant}
                fit={fit}
                onClick={stageClickHandler}
            />
            <GalleryControls
                currentIndex={safeIndex}
                total={media.length}
                onPrev={() => setCurrentMediaIndex(i => (i - 1 + media.length) % media.length)}
                onNext={() => setCurrentMediaIndex(i => (i + 1) % media.length)}
                size={size}
            />
            {isOpenFullClick && (
                <GalleryModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    media={media}
                    currentIndex={safeIndex}
                    onIndexChange={setCurrentMediaIndex}
                    size={size}
                />
            )}
        </div>
    );
};

export const Gallery = ({
    media: rawMedia,
    premise,
    building,
    type = 'thumbs',
    onClick = 'openFull',
    size = 'm',
    fit = 'cover',
    className,
}: GalleryProps) => {
    const media = useMemo((): GalleryMedia[] => {
        return [...(rawMedia ?? []), ...(premise?.media ?? []), ...(building?.media ?? [])];
    }, [rawMedia, premise?.media, building?.media]);

    if (media.length === 0) {
        return (
            <div
                className={classNames(
                    styles.container,
                    styles[`container__size-${size}`],
                    className,
                )}
            />
        );
    }

    return (
        <GalleryBody
            key={JSON.stringify(media)}
            media={media}
            type={type}
            onClick={onClick}
            size={size}
            fit={fit}
            className={className}
        />
    );
};
