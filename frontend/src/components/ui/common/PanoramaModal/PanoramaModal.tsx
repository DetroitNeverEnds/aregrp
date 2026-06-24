import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import type { Viewer } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/markers-plugin/index.css';
import { Modal } from '@/components/ui/common/Modal';
import { Text } from '@/components/ui/common/Text';
import styles from './PanoramaModal.module.scss';

const SECOND_PANORAMA_URL = '/panoramas/panorama-2.jpg';
const THIRD_PANORAMA_URL = '/panoramas/panorama-3.jpg';

const HOTSPOT_HTML = (label: string) =>
    `<div style="
        background: rgba(0,0,0,0.6);
        color: #fff;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 13px;
        font-family: sans-serif;
        cursor: pointer;
        white-space: nowrap;
        border: 1px solid rgba(255,255,255,0.4);
        backdrop-filter: blur(4px);
    ">➜ ${label}</div>`;

export interface PanoramaModalProps {
    open: boolean;
    onClose: () => void;
    panoramaUrl: string;
    title?: string;
}

export const PanoramaModal: React.FC<PanoramaModalProps> = ({
    open,
    onClose,
    panoramaUrl,
    title,
}) => {
    const panoramaUrls = useMemo(() => [panoramaUrl, SECOND_PANORAMA_URL, THIRD_PANORAMA_URL], [panoramaUrl]);
    const [activePanoramaIndex, setActivePanoramaIndex] = useState(0);

    useEffect(() => {
        if (open) {
            setActivePanoramaIndex(0);
        }
    }, [open, panoramaUrl]);

    const plugins = useMemo(
        () => [
            [
                MarkersPlugin,
                {
                    markers: [
                        {
                            id: 'go-next-room',
                            position: { yaw: '20deg', pitch: '0deg' },
                            html: HOTSPOT_HTML('Следующая комната'),
                            anchor: 'center center',
                            tooltip: 'Перейти в следующую комнату',
                        },
                        {
                            id: 'go-prev-room',
                            position: { yaw: '200deg', pitch: '0deg' },
                            html: HOTSPOT_HTML('Предыдущая комната'),
                            anchor: 'center center',
                            tooltip: 'Вернуться в предыдущую комнату',
                        },
                    ],
                },
            ],
        ],
        [],
    );

    const onReady = useCallback(
        (viewer: Viewer) => {
            const markersPlugin = viewer.getPlugin<MarkersPlugin>(MarkersPlugin);

            markersPlugin.addEventListener('select-marker', ({ marker }) => {
                if (marker.id === 'go-next-room') {
                    const nextIndex = (activePanoramaIndex + 1) % panoramaUrls.length;
                    viewer.setPanorama(panoramaUrls[nextIndex]).then(() => {
                        setActivePanoramaIndex(nextIndex);
                    });
                } else if (marker.id === 'go-prev-room') {
                    const prevIndex =
                        (activePanoramaIndex - 1 + panoramaUrls.length) % panoramaUrls.length;
                    viewer.setPanorama(panoramaUrls[prevIndex]).then(() => {
                        setActivePanoramaIndex(prevIndex);
                    });
                }
            });
        },
        [activePanoramaIndex, panoramaUrls],
    );

    return (
        <Modal
            open={open}
            onClose={onClose}
            panelClassName={styles.panoramaModal__panel}
            className={styles.panoramaModal__content}
        >
            {title && (
                <Text variant="20-med" className={styles.panoramaModal__title}>
                    {title}
                    {` — Комната ${activePanoramaIndex + 1} из ${panoramaUrls.length}`}
                </Text>
            )}
            <div className={styles.panoramaModal__viewer}>
                <ReactPhotoSphereViewer
                    src={panoramaUrls[activePanoramaIndex]}
                    height="100%"
                    width="100%"
                    navbar={['zoom', 'fullscreen']}
                    plugins={plugins as never}
                    onReady={onReady}
                />
            </div>
        </Modal>
    );
};

export default PanoramaModal;
