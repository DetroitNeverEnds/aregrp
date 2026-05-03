import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';

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

const getFallbackRoomName = (roomGroupId: string): string =>
    roomGroupId.startsWith(ROOM_ID_PREFIX) ? roomGroupId.slice(ROOM_ID_PREFIX.length) : roomGroupId;

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
    const rootRef = useRef<HTMLDivElement | null>(null);

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

        const roomGroups = root.querySelectorAll<SVGGElement>(`g[id^="${ROOM_ID_PREFIX}"]`);
        roomGroups.forEach(group => {
            const roomId = group.id;
            const roomToken = extractRoomToken(roomId);
            if (!roomToken) {
                return;
            }

            const room = roomsByToken.get(roomToken);
            const fallbackName = getFallbackRoomName(roomId);
            const roomName = room?.name || fallbackName;
            const isAvailable = room?.is_available ?? false;
            const isSelected = Boolean(room && isAvailable && room.uuid === selectedPremiseId);

            group.setAttribute('data-premise-name', roomName);

            const roomGeometry = group.querySelector<SVGElement>('[id^="poly"]');
            roomGeometry?.setAttribute(
                'class',
                isAvailable
                    ? isSelected
                        ? styles['floorSchema__room--selected']
                        : styles['floorSchema__room--free']
                    : styles['floorSchema__room--unavailable'],
            );

            setTextLabelByPrefix(group, 'label_name', roomName);
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

            const onClick = () => onRoomSelect?.(room);
            group.addEventListener('click', onClick);

            listeners.push({
                group,
                onClick,
            });
        });

        return () => {
            listeners.forEach(({ group, onClick }) => {
                if (onClick) {
                    group.removeEventListener('click', onClick);
                }
            });
        };
    }, [onRoomSelect, rooms, selectedPremiseId, svg]);

    return (
        <div className={classNames(styles.floorSchema, className)}>
            <div
                ref={rootRef}
                className={styles.floorSchema__svgRoot}
                // SVG приходит из API: в прототипе вставляем как есть
                dangerouslySetInnerHTML={{ __html: svg }}
            />
        </div>
    );
};

export default FloorSchema;
