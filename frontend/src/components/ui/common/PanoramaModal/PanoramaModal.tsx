import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import type { Viewer } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/markers-plugin/index.css';
import type { BuildingFloorOut } from '@/api/handlers/buildings/types';
import type { SaleType } from '@/api/handlers/types';
import { Button } from '@/components/ui/common/Button';
import { Flex } from '@/components/ui/common/Flex';
import { Modal } from '@/components/ui/common/Modal';
import { Text } from '@/components/ui/common/Text';
import styles from './PanoramaModal.module.scss';

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

type PanoramaModalBaseProps = {
    open: boolean;
    onClose: () => void;
    title?: string;
};

export type PanoramaModalProps = PanoramaModalBaseProps &
    (
        | {
              mode: 'building';
              floors: BuildingFloorOut[];
              initialFloorKey: string;
              saleType?: SaleType;
          }
        | { mode: 'premise'; panoramas: string[] }
    );

export const PanoramaModal: React.FC<PanoramaModalProps> = props => {
    const { open, onClose, title, mode } = props;
    const saleType = mode === 'building' ? props.saleType ?? 'sale' : 'sale';

    const [activeFloorKey, setActiveFloorKey] = useState(
        mode === 'building' ? props.initialFloorKey : '',
    );
    const [activePanoramaIndex, setActivePanoramaIndex] = useState(0);

    useEffect(() => {
        if (!open) {
            return;
        }
        if (mode === 'building') {
            setActiveFloorKey(props.initialFloorKey);
        }
        setActivePanoramaIndex(0);
    }, [open, mode, mode === 'building' ? props.initialFloorKey : null]);

    const panoramaUrls = useMemo(() => {
        if (mode === 'premise') {
            return props.panoramas;
        }
        const floor = props.floors.find(item => item.key === activeFloorKey);
        return floor?.panoramas ?? [];
    }, [mode, props, activeFloorKey]);

    const floorsWithPanoramas = useMemo(
        () => (mode === 'building' ? props.floors.filter(f => f.panoramas.length > 0) : []),
        [mode, props],
    );

    const plugins = useMemo(
        () =>
            panoramaUrls.length > 1
                ? [
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
                  ]
                : [],
        [panoramaUrls.length],
    );

    const onReady = useCallback(
        (viewer: Viewer) => {
            if (panoramaUrls.length <= 1) {
                return;
            }

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

    const onFloorSelect = useCallback((floorKey: string) => {
        setActiveFloorKey(floorKey);
        setActivePanoramaIndex(0);
    }, []);

    const currentPanoramaUrl = panoramaUrls[activePanoramaIndex];

    return (
        <Modal
            open={open}
            onClose={onClose}
            panelClassName={styles.panoramaModal__panel}
            className={styles.panoramaModal__content}
        >
            {title && panoramaUrls.length > 0 && (
                <Text variant="20-med" className={styles.panoramaModal__title}>
                    {title}
                    {panoramaUrls.length > 1 &&
                        ` — Комната ${activePanoramaIndex + 1} из ${panoramaUrls.length}`}
                </Text>
            )}
            <div className={styles.panoramaModal__viewer}>
                {currentPanoramaUrl ? (
                    <ReactPhotoSphereViewer
                        key={`${activeFloorKey}-${currentPanoramaUrl}`}
                        src={currentPanoramaUrl}
                        height="100%"
                        width="100%"
                        navbar={['zoom', 'fullscreen']}
                        plugins={plugins as never}
                        onReady={onReady}
                    />
                ) : null}
            </div>
            {mode === 'building' && floorsWithPanoramas.length > 0 && (
                <Flex direction="row" gap={12} className={styles.panoramaModal__floors}>
                    {floorsWithPanoramas.map(floor => (
                        <Button
                            key={floor.key}
                            variant={activeFloorKey === floor.key ? 'primary' : 'secondary'}
                            onClick={() => onFloorSelect(floor.key)}
                            disabled={
                                (saleType === 'sale' && !floor.has_sale) ||
                                (saleType === 'rent' && !floor.has_rent)
                            }
                        >
                            {floor.title}
                        </Button>
                    ))}
                </Flex>
            )}
        </Modal>
    );
};

export default PanoramaModal;
