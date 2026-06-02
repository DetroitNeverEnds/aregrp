import React from 'react';

import { type ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';

import { FlatButton } from '@/components/ui/common/FlatButton';
import { Icon } from '@/components/ui/common/Icon';

import styles from './FloorSchemaControls.module.scss';

export type FloorSchemaControlsProps = {
    transformRef: React.RefObject<ReactZoomPanPinchContentRef | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
};

export const FloorSchemaControls: React.FC<FloorSchemaControlsProps> = ({
    transformRef,
    containerRef,
}) => {
    const handleZoomIn = () => {
        transformRef.current?.zoomIn();
    };

    const handleZoomOut = () => {
        transformRef.current?.zoomOut();
    };

    const handleFit = () => {
        const ref = transformRef.current;
        const container = containerRef.current;
        if (!ref || !container) {
            return;
        }

        const content = ref.instance.contentComponent;
        if (!content) {
            return;
        }

        const fitScale = Math.min(
            container.offsetWidth / content.offsetWidth,
            container.offsetHeight / content.offsetHeight,
        );

        ref.centerView(fitScale);
    };

    return (
        <div className={styles.floorSchemaControls}>
            <FlatButton
                className={styles.floorSchemaControls__btn}
                onClick={handleZoomIn}
                aria-label="Увеличить"
            >
                <Icon name="plus" size={20} />
            </FlatButton>
            <FlatButton
                className={styles.floorSchemaControls__btn}
                onClick={handleZoomOut}
                aria-label="Уменьшить"
            >
                <Icon name="minus" size={20} />
            </FlatButton>
            <FlatButton
                className={styles.floorSchemaControls__btn}
                onClick={handleFit}
                aria-label="Вписать в экран"
            >
                <Icon name="fit-screen" size={20} />
            </FlatButton>
        </div>
    );
};

export default FloorSchemaControls;
