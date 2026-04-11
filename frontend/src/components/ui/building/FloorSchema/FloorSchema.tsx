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

        rooms.forEach(room => {
            // Важно: id может начинаться с цифры, поэтому CSS селектор вида "#105" невалиден.
            const group = root.querySelector<SVGGElement>(`g[id="${room.name}"]`);
            if (!group) {
                return;
            }

            group.setAttribute('data-premise-name', room.name);

            const roomPath = group.querySelector<SVGPathElement>('path[id="room"]');
            const isSelected = room.is_available && room.uuid === selectedPremiseId;
            roomPath?.setAttribute(
                'class',
                room.is_available
                    ? isSelected
                        ? styles['floorSchema__room--selected']
                        : styles['floorSchema__room--free']
                    : styles['floorSchema__room--unavailable'],
            );

            const areaTspan = group.querySelector<SVGTSpanElement>('text#label_area tspan');
            if (areaTspan) {
                areaTspan.textContent = room.is_available ? room.label_area : '';
            }

            const priceTspan = group.querySelector<SVGTSpanElement>('text#label_price tspan');
            if (priceTspan) {
                priceTspan.textContent = room.is_available ? room.label_price : '';
            }

            if (!room.is_available) {
                group.removeAttribute('tabindex');
                group.removeAttribute('role');

                return;
            }

            group.setAttribute('tabindex', '0');

            const numberTspan = group.querySelector<SVGTSpanElement>('text#number_area tspan');
            if (numberTspan) {
                numberTspan.textContent = room.name;
            }

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
