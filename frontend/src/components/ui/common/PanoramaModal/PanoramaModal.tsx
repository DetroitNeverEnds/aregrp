import { useCallback, useMemo, useState } from 'react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';
import '@photo-sphere-viewer/markers-plugin/index.css';
import { Button } from '@/components/ui/common/Button';
import { Flex } from '@/components/ui/common/Flex';
import { Modal, type ModalProps } from '@/components/ui/common/Modal';
import { Text } from '@/components/ui/common/Text';
import styles from './PanoramaModal.module.scss';

export type PanoramaModalProps = Pick<ModalProps, 'open' | 'onClose'> & {
    title?: string;
    panoramas: {
        url?: string;
        key: string;
        title: string;
    }[];
    initialPanoramaKey?: string;
    forceShowNavigation?: boolean;
};

export const PanoramaModal = (props: PanoramaModalProps) => {
    const { open, onClose, title } = props;
    const initialPanorama = props.panoramas.find(
        panorama => panorama.key === props.initialPanoramaKey,
    );
    const firstAvailablePanorama = props.panoramas.find(panorama => panorama.url);

    const [activePanoramaKey, setActivePanoramaKey] = useState(
        initialPanorama?.url ? initialPanorama.key : (firstAvailablePanorama?.key ?? ''),
    );
    const activePanoramaIndex = useMemo(
        () => props.panoramas.findIndex(panorama => panorama.key === activePanoramaKey),
        [props.panoramas, activePanoramaKey],
    );

    const panoramaUrls = useMemo(
        () => props.panoramas.map(panorama => panorama.url),
        [props.panoramas],
    );

    // const onReady = useCallback(
    //     (viewer: Viewer) => {
    //         if (panoramaUrls.length <= 1) {
    //             return;
    //         }

    //         const markersPlugin = viewer.getPlugin<MarkersPlugin>(MarkersPlugin);

    //         markersPlugin.addEventListener('select-marker', ({ marker }) => {
    //             if (marker.id === 'go-next-room') {
    //                 const nextIndex = (activePanoramaIndex + 1) % panoramaUrls.length;
    //                 viewer.setPanorama(panoramaUrls[nextIndex]).then(() => {
    //                     setActivePanoramaIndex(nextIndex);
    //                 });
    //             } else if (marker.id === 'go-prev-room') {
    //                 const prevIndex =
    //                     (activePanoramaIndex - 1 + panoramaUrls.length) % panoramaUrls.length;
    //                 viewer.setPanorama(panoramaUrls[prevIndex]).then(() => {
    //                     setActivePanoramaIndex(prevIndex);
    //                 });
    //             }
    //         });
    //     },
    //     [activePanoramaIndex, panoramaUrls],
    // );

    const onPanoramaSelect = useCallback((floorKey: string) => {
        setActivePanoramaKey(floorKey);
    }, []);
    const currentPanoramaUrl = panoramaUrls[activePanoramaIndex];

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
                </Text>
            )}

            {firstAvailablePanorama?.url ? (
                <div className={styles.panoramaModal__viewer}>
                    {currentPanoramaUrl ? (
                        <ReactPhotoSphereViewer
                            key={`${activePanoramaKey}-${currentPanoramaUrl}`}
                            src={currentPanoramaUrl}
                            height="100%"
                            width="100%"
                            navbar={['zoom', 'fullscreen']}
                            // onReady={onReady}
                        />
                    ) : null}
                </div>
            ) : (
                <Text variant="20-med">Нет доступных панорам</Text>
            )}

            {/* {mode === 'building' && floorsWithPanoramas.length > 0 && (
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
            )} */}

            {(props.panoramas.length > 1 || props.forceShowNavigation) && (
                <Flex direction="row" gap={12} className={styles.panoramaModal__floors}>
                    {props.panoramas.map(panorama => (
                        <Button
                            key={panorama.key}
                            variant={activePanoramaKey === panorama.key ? 'primary' : 'secondary'}
                            onClick={() => onPanoramaSelect(panorama.key)}
                            disabled={!panorama.url}
                        >
                            {panorama.title}
                        </Button>
                    ))}
                </Flex>
            )}
        </Modal>
    );
};

export default PanoramaModal;
