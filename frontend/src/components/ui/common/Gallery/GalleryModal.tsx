import React from 'react';

import { Modal } from '@/components/ui/common/Modal';
import styles from './GalleryModal.module.scss';
import type { GalleryMedia } from './Gallery.types';
import { GalleryMainStage } from './GalleryMainStage';
import { GalleryControls } from './GalleryControls';
import { Flex } from '../Flex';

export type GalleryModalProps = {
    open: boolean;
    onClose: () => void;
    media: GalleryMedia[];
    currentIndex: number;
    onIndexChange: (index: number) => void;
    size: 'm' | 'l';
};

export const GalleryModal: React.FC<GalleryModalProps> = ({
    open,
    onClose,
    media,
    currentIndex,
    onIndexChange,
    size,
}) => {
    const item = media[currentIndex];
    if (!item) {
        return null;
    }

    return (
        <Modal open={open} onClose={onClose} align="stretch" justify="start" fullWidth>
            <Flex className={styles.modalStage}>
                <GalleryMainStage
                    key={`${item.url}-${currentIndex}`}
                    item={item}
                    variant="full"
                    fit="contain"
                />
                <GalleryControls
                    placement="modal"
                    currentIndex={currentIndex}
                    total={media.length}
                    onPrev={() => onIndexChange((currentIndex - 1 + media.length) % media.length)}
                    onNext={() => onIndexChange((currentIndex + 1) % media.length)}
                    size={size}
                />
            </Flex>
        </Modal>
    );
};
