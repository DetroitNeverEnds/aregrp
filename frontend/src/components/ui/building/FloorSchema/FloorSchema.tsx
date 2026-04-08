import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';

import styles from './FloorSchema.module.scss';
import type { FloorPremiseOut } from '@/api';

export type FloorRoom = FloorPremiseOut;

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
            const isSelected = !room.is_occupied && room.uuid === selectedPremiseId;
            roomPath?.setAttribute(
                'class',
                room.is_occupied
                    ? styles['floorSchema__room--occupied']
                    : isSelected
                      ? styles['floorSchema__room--selected']
                      : styles['floorSchema__room--free'],
            );

            if (room.is_occupied) {
                group.removeAttribute('tabindex');
                group.removeAttribute('role');

                return;
            }

            group.setAttribute('tabindex', '0');

            const numberTspan = group.querySelector<SVGTSpanElement>('text#number_area tspan');
            if (numberTspan) {
                numberTspan.textContent = room.name;
            }

            const areaTspan = group.querySelector<SVGTSpanElement>('text#label_area tspan');
            if (areaTspan) {
                areaTspan.textContent = room.label_area;
            }

            const priceTspan = group.querySelector<SVGTSpanElement>('text#label_price tspan');
            if (priceTspan) {
                priceTspan.textContent = room.label_price;
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
