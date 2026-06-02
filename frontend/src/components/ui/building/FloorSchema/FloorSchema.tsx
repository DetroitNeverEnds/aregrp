import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
    TransformWrapper,
    TransformComponent,
    type ReactZoomPanPinchContentRef,
} from 'react-zoom-pan-pinch';

import { FloorSchemaControls } from './FloorSchemaControls';
import styles from './FloorSchema.module.scss';

export type FloorRoom = {
    uuid: string;
    name: string;
    label_area: string;
    label_price: string;
    is_available: boolean;
    is_occupied: boolean;
};

type RoomListeners = {
    group: SVGGElement;
    onClick?: () => void;
};

const ROOM_ID_PREFIX = 'room_';

const extractRoomToken = (value: string): string | undefined => {
    const normalizedValue = value.trim();
    if (!normalizedValue) {
        return undefined;
    }

    return normalizedValue.startsWith(ROOM_ID_PREFIX)
        ? normalizedValue.slice(ROOM_ID_PREFIX.length)
        : normalizedValue;
};

const setTextLabelByPrefix = (group: SVGGElement, labelPrefix: string, value: string) => {
    const label = group.querySelector<SVGTextElement>(`text[id^="${labelPrefix}"]`);
    if (!label) {
        return;
    }

    const tspan = label.querySelector<SVGTSpanElement>('tspan');
    if (tspan) {
        tspan.textContent = value;
        return;
    }

    label.textContent = value;
};

const setElementsVisibilityByPrefix = (group: SVGGElement, prefix: string, isVisible: boolean) => {
    const elements = group.querySelectorAll<SVGElement>(`[id^="${prefix}"]`);
    elements.forEach(element => {
        if (isVisible) {
            element.removeAttribute('display');
        } else {
            element.setAttribute('display', 'none');
        }
    });
};

export type FloorSchemaProps = {
    svg: string;
    rooms: FloorRoom[];
    className?: string;
    selectedPremiseId?: string;
    onRoomSelect?: (room: FloorRoom) => void;
};

export const FloorSchema: React.FC<FloorSchemaProps> = ({
    svg,
    rooms,
    selectedPremiseId,
    onRoomSelect,
    className,
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const transformRef = useRef<ReactZoomPanPinchContentRef | null>(null);
    const [minScale, setMinScale] = useState(0.1);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) {
            return;
        }

        const listeners: RoomListeners[] = [];
        const roomsByToken = new Map<string, FloorRoom>();
        rooms.forEach(room => {
            const roomToken = extractRoomToken(room.name);
            if (!roomToken || roomsByToken.has(roomToken)) {
                return;
            }

            roomsByToken.set(roomToken, room);
        });

        // Track pointer movement to distinguish click from drag
        let dragStartX = 0;
        let dragStartY = 0;
        let didDrag = false;

        const onPointerDown = (e: PointerEvent) => {
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            didDrag = false;
        };

        const onPointerMove = (e: PointerEvent) => {
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            if (Math.sqrt(dx * dx + dy * dy) > 5) {
                didDrag = true;
            }
        };

        root.addEventListener('pointerdown', onPointerDown);
        root.addEventListener('pointermove', onPointerMove);

        const roomGroups = root.querySelectorAll<SVGGElement>(`g[id^="${ROOM_ID_PREFIX}"]`);
        roomGroups.forEach(group => {
            const roomId = group.id;
            const roomToken = extractRoomToken(roomId);
            if (!roomToken) {
                return;
            }

            const room = roomsByToken.get(roomToken);
            const isAvailable = room?.is_available ?? false;
            const isSelected = Boolean(room && isAvailable && room.uuid === selectedPremiseId);

            const roomGeometry = group.querySelector<SVGElement>('[id^="poly"]');
            roomGeometry?.setAttribute(
                'class',
                isAvailable
                    ? isSelected
                        ? styles['floorSchema__room--selected']
                        : styles['floorSchema__room--free']
                    : styles['floorSchema__room--unavailable'],
            );

            setTextLabelByPrefix(group, 'label_area', isAvailable && room ? room.label_area : '');
            setTextLabelByPrefix(group, 'label_price', isAvailable && room ? room.label_price : '');
            setElementsVisibilityByPrefix(group, 'label_lock', !isAvailable);
            setElementsVisibilityByPrefix(group, 'label_busy', Boolean(room?.is_occupied));

            if (!isAvailable || !room) {
                group.removeAttribute('tabindex');
                group.removeAttribute('role');
                return;
            }

            group.setAttribute('tabindex', '0');
            group.setAttribute('role', 'button');

            const onClick = () => {
                if (didDrag) {
                    return;
                }
                const isAlreadySelected = room.uuid === selectedPremiseId;
                onRoomSelect?.(room);
                if (!isAlreadySelected) {
                    transformRef.current?.zoomToElement(group as unknown as HTMLElement, 2.5);
                }
            };
            group.addEventListener('click', onClick);

            listeners.push({
                group,
                onClick,
            });
        });

        return () => {
            root.removeEventListener('pointerdown', onPointerDown);
            root.removeEventListener('pointermove', onPointerMove);
            listeners.forEach(({ group, onClick }) => {
                if (onClick) {
                    group.removeEventListener('click', onClick);
                }
            });
        };
    }, [onRoomSelect, rooms, selectedPremiseId, svg]);

    // Fit SVG into the container viewport on floor change; derive minScale from fit
    useEffect(() => {
        const ref = transformRef.current;
        const container = containerRef.current;
        if (!ref || !container) {
            return;
        }

        const content = ref.instance.contentComponent;
        if (!content || content.offsetWidth === 0) {
            return;
        }

        const fitScale = Math.min(
            container.offsetWidth / content.offsetWidth,
            container.offsetHeight / content.offsetHeight,
        );

        setMinScale(fitScale);
        ref.centerView(fitScale, 0);
    }, [svg]);

    return (
        <div ref={containerRef} className={classNames(styles.floorSchema, className)}>
            <TransformWrapper
                ref={transformRef}
                minScale={minScale}
                maxScale={3}
                centerOnInit
                limitToBounds
                // centerZoomedOut
                doubleClick={{ disabled: true }}
                panning={{ velocityDisabled: true }}
                autoAlignment={{ sizeX: 100, sizeY: 100 }}
            >
                <TransformComponent wrapperClass={styles.floorSchema__canvas}>
                    <div
                        ref={rootRef}
                        className={styles.floorSchema__svgRoot}
                        dangerouslySetInnerHTML={{ __html: svg }}
                    />
                </TransformComponent>
                <FloorSchemaControls transformRef={transformRef} containerRef={containerRef} />
            </TransformWrapper>
        </div>
    );
};

export default FloorSchema;
