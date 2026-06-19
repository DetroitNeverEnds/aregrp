import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import type { Viewer } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/markers-plugin/index.css';
import { Modal } from '@/components/ui/common/Modal';
import { Text } from '@/components/ui/common/Text';
import styles from './PanoramaModal.module.scss';

const SECOND_PANORAMA_URL =
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/cayley_interior.jpg';

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
    const viewerRef = useRef<Viewer | null>(null);
    const [isSecond, setIsSecond] = useState(false);

    const plugins = useMemo(
        () => [
            [
                MarkersPlugin,
                {
                    markers: [
                        {
                            id: 'go-next',
                            position: { yaw: '20deg', pitch: '0deg' },
                            html: HOTSPOT_HTML('Следующая комната'),
                            anchor: 'center center',
                            tooltip: 'Перейти в следующую комнату',
                        },
                    ],
                },
            ],
        ],
        [],
    );

    const onReady = useCallback(
        (viewer: Viewer) => {
            viewerRef.current = viewer;
            const markersPlugin = viewer.getPlugin<MarkersPlugin>(MarkersPlugin);

            markersPlugin.addEventListener('select-marker', ({ marker }) => {
                if (marker.id === 'go-next') {
                    setIsSecond(true);
                    viewer.setPanorama(SECOND_PANORAMA_URL).then(() => {
                        markersPlugin.clearMarkers();
                        markersPlugin.addMarker({
                            id: 'go-back',
                            position: { yaw: '180deg', pitch: '0deg' },
                            html: HOTSPOT_HTML('Вернуться назад'),
                            anchor: 'center center',
                            tooltip: 'Вернуться в предыдущую комнату',
                        });
                    });
                } else if (marker.id === 'go-back') {
                    setIsSecond(false);
                    viewer.setPanorama(panoramaUrl).then(() => {
                        markersPlugin.clearMarkers();
                        markersPlugin.addMarker({
                            id: 'go-next',
                            position: { yaw: '20deg', pitch: '0deg' },
                            html: HOTSPOT_HTML('Следующая комната'),
                            anchor: 'center center',
                            tooltip: 'Перейти в следующую комнату',
                        });
                    });
                }
            });
        },
        [panoramaUrl],
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
                    {isSecond && ' — Следующая комната'}
                </Text>
            )}
            <div className={styles.panoramaModal__viewer}>
                <ReactPhotoSphereViewer
                    src={panoramaUrl}
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
