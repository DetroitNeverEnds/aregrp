import { useMemo, useState } from 'react';

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
    /** Только для `type="thumbs"`: открывать модалку по клику на превью */
    canOpenFull?: boolean;
    size?: 'm' | 'l';
    fit?: 'cover' | 'contain';
    className?: string;
};

type GalleryBodyProps = Omit<GalleryProps, 'media' | 'premise' | 'building'> & {
    media: GalleryMedia[];
};

/** Локальное состояние слайда/модалки; `key={media.length}` снаружи сбрасывает индекс при смене числа элементов. */
const GalleryBody = ({
    media,
    type = 'thumbs',
    canOpenFull = true,
    size = 'm',
    fit = 'cover',
    className,
}: GalleryBodyProps) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);

    const variant = type === 'thumbs' ? 'preview' : 'full';

    const openModal = () => {
        if (type === 'thumbs' && canOpenFull) {
            setModalOpen(true);
        }
    };

    const safeIndex = Math.min(currentMediaIndex, Math.max(0, media.length - 1));
    const current = media[safeIndex];

    return (
        <div className={classNames(styles.container, styles[`container__size-${size}`], className)}>
            <GalleryMainStage
                item={current}
                variant={variant}
                fit={fit}
                onOpen={type === 'thumbs' && canOpenFull ? openModal : undefined}
            />
            <GalleryControls
                currentIndex={safeIndex}
                total={media.length}
                onPrev={() => setCurrentMediaIndex(i => Math.max(0, i - 1))}
                onNext={() => setCurrentMediaIndex(i => Math.min(media.length - 1, i + 1))}
                size={size}
            />
            {type === 'thumbs' && canOpenFull && (
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
    canOpenFull = true,
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
            canOpenFull={canOpenFull}
            size={size}
            fit={fit}
            className={className}
        />
    );
};
