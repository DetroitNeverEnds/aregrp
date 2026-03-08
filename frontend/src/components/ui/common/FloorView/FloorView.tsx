import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';

import styles from './FloorView.module.scss';
import type { FloorViewProps } from './types';

type RoomListeners = {
    group: SVGGElement;
    onClick?: () => void;
};

export const FloorView: React.FC<FloorViewProps> = ({ svg, rooms, className }) => {
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) {
            return;
        }

        const listeners: RoomListeners[] = [];

        rooms.forEach(room => {
            // Важно: id может начинаться с цифры, поэтому CSS селектор вида "#105" невалиден.
            const group = root.querySelector<SVGGElement>(`g[id="${room.id_area}"]`);
            if (!group) {
                return;
            }

            group.setAttribute('data-premise-uuid', room.uuid);

            const roomPath = group.querySelector<SVGPathElement>('path[id="room"]');
            roomPath?.setAttribute(
                'class',
                room.is_occupied ? styles['floorView__room--occupied'] : styles['floorView__room'],
            );

            if (room.is_occupied) {
                group.setAttribute('aria-disabled', 'true');
                group.setAttribute('tabindex', '-1');
                group.removeAttribute('role');

                return;
            }

            group.setAttribute('aria-disabled', 'false');
            group.setAttribute('role', 'button');
            group.setAttribute('tabindex', '0');

            const numberTspan = group.querySelector<SVGTSpanElement>('text#number_area tspan');
            if (numberTspan) {
                numberTspan.textContent = room.id_area;
            }

            const areaTspan = group.querySelector<SVGTSpanElement>('text#label_area tspan');
            if (areaTspan) {
                areaTspan.textContent = room.label_area;
            }

            const priceTspan = group.querySelector<SVGTSpanElement>('text#label_price tspan');
            if (priceTspan) {
                priceTspan.textContent = room.label_price;
            }

            const onClick = () => {
                alert(
                    [
                        `uuid: ${room.uuid}`,
                        `room: ${room.name ?? room.id_area}`,
                        `area: ${room.label_area}`,
                        `price: ${room.label_price}`,
                        `occupied: ${String(room.is_occupied)}`,
                    ].join('\n'),
                );
            };

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
    }, [rooms, svg]);

    return (
        <div className={classNames(styles.floorView, className)}>
            <div
                ref={rootRef}
                className={styles.floorView__svgRoot}
                // SVG приходит из API: в прототипе вставляем как есть
                dangerouslySetInnerHTML={{ __html: svg }}
            />
        </div>
    );
};

export default FloorView;
