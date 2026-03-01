import React, { useEffect, useMemo, useRef, useState } from 'react';

type RoomStatus = 'free' | 'sold' | 'reserved' | 'hidden';

type RoomState = {
    id: number;
    status: RoomStatus;
    price: number | null;
    area: number | null;
    currency: 'RUB' | 'USD' | 'EUR';
};

type PlanProps = {
    /** URL, отдающий SVG строкой (Content-Type: image/svg+xml или text/plain) */
    svgUrl: string;

    /** URL, отдающий JSON со статусами/ценами/площадями */
    roomsStateUrl: string;

    /** Какой этаж показать (если в SVG несколько этажей-групп) */
    floorId: number;

    /** Вызывается при клике на помещение */
    onRoomClick: (roomId: number) => void;

    /** Показывать ли площадь в подписи */
    showArea: boolean;

    /** Форматировать цену */
    formatPrice: (value: number, currency: RoomState['currency']) => string;

    /** Форматировать площадь */
    formatArea: (value: number) => string;

    /** Цвета по статусам */
    statusColors: Record<RoomStatus, string>;

    /** Цвет контура */
    strokeColor: string;

    /** Толщина контура */
    strokeWidth: number;

    /** Если true — текст внутри помещений не перехватывает клики (клик проходит в shape) */
    textClickThrough: boolean;
};

type RoomsStateResponse = {
    floor_id: number;
    generated_at: string;
    rooms: RoomState[];
};

function defaultFormatPrice(value: number, currency: RoomState['currency']) {
    const locale = 'ru-RU';
    const currencyMap: Record<RoomState['currency'], string> = {
        RUB: 'RUB',
        USD: 'USD',
        EUR: 'EUR',
    };

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyMap[currency],
        maximumFractionDigits: 0,
    }).format(value);
}

function defaultFormatArea(value: number) {
    // 16.9 -> "16,9 м²"
    return `${value.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} м²`;
}

function coerceRoomId(value: string | null): number | null {
    if (!value) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

function setInlineStyle(el: Element, styles: Record<string, string>) {
    const anyEl = el as HTMLElement;
    const prev = anyEl.getAttribute('style') || '';
    const add = Object.entries(styles)
        .map(([k, v]) => `${k}:${v}`)
        .join(';');
    anyEl.setAttribute('style', prev ? `${prev};${add}` : add);
}

export function FloorPlanInteractiveSVG({
    svgUrl,
    roomsStateUrl,
    floorId,
    onRoomClick,
    showArea,
    formatPrice = defaultFormatPrice,
    formatArea = defaultFormatArea,
    statusColors = {
        free: '#6CCF8D',
        sold: '#D66C6C',
        reserved: '#F2C94C',
        hidden: '#BDBDBD',
    },
    strokeColor = '#2F2F2F',
    strokeWidth = 1.2,
    textClickThrough = true,
}: PlanProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [svgText, setSvgText] = useState<string>('');
    const [roomsState, setRoomsState] = useState<Map<number, RoomState>>(new Map());
    const [error, setError] = useState<string | null>(null);

    const floorSelector = useMemo(() => `[data-floor-id="${floorId}"]`, [floorId]);

    // 1) Грузим SVG
    useEffect(() => {
        let cancelled = false;

        async function loadSvg() {
            try {
                setError(null);
                const res = await fetch(svgUrl, { credentials: 'include' });
                if (!res.ok) {
                    throw new Error(`SVG fetch failed: ${res.status} ${res.statusText}`);
                }
                const text = await res.text();
                if (!cancelled) setSvgText(text);
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : 'SVG fetch failed');
            }
        }

        loadSvg();
        return () => {
            cancelled = true;
        };
    }, [svgUrl]);

    // 2) Грузим JSON со статусами/ценами/площадями (при открытии страницы)
    useEffect(() => {
        let cancelled = false;

        async function loadRooms() {
            try {
                setError(null);
                const res = await fetch(roomsStateUrl, { credentials: 'include' });
                if (!res.ok) {
                    throw new Error(`Rooms state fetch failed: ${res.status} ${res.statusText}`);
                }
                const json = (await res.json()) as RoomsStateResponse;

                const map = new Map<number, RoomState>();
                for (const r of json.rooms) map.set(r.id, r);

                if (!cancelled) setRoomsState(map);
            } catch (e) {
                if (!cancelled)
                    setError(e instanceof Error ? e.message : 'Rooms state fetch failed');
            }
        }

        loadRooms();
        return () => {
            cancelled = true;
        };
    }, [roomsStateUrl]);

    // 3) После того как SVG встроился в DOM — навешиваем клики и применяем данные
    useEffect(() => {
        const root = containerRef.current;
        if (!root) return;
        if (!svgText) return;

        const svgEl = root.querySelector('svg');
        if (!svgEl) return;

        const floorGroup = svgEl.querySelector(floorSelector);
        if (!floorGroup) {
            setError(`В SVG не найден этаж: ${floorSelector}`);
            return;
        }

        // Скрываем все этажи, кроме активного
        const allFloors = svgEl.querySelectorAll('[data-floor-id]');
        allFloors.forEach(f => {
            const isActive = f === floorGroup;
            setInlineStyle(f, { display: isActive ? 'inline' : 'none' });
        });

        // Настройки для кликабельности
        // - Текст может не перехватывать клики, чтобы клик шел в shape
        if (textClickThrough) {
            const texts = floorGroup.querySelectorAll('text,[data-label]');
            texts.forEach(t => setInlineStyle(t, { 'pointer-events': 'none' }));
        }

        // Базовые стили для всех shapes
        const shapes = floorGroup.querySelectorAll('.room-shape');
        shapes.forEach(shape => {
            setInlineStyle(shape, {
                cursor: 'pointer',
                stroke: strokeColor,
                'stroke-width': String(strokeWidth),
            });
        });

        // Применяем данные комнат (цвета + подписи)
        function applyRoomState() {
            const roomGroups = floorGroup.querySelectorAll<SVGGElement>('g[data-room-id]');
            roomGroups.forEach(g => {
                const roomId = coerceRoomId(g.getAttribute('data-room-id'));
                if (roomId == null) return;

                const state = roomsState.get(roomId);

                // Красим shape
                const shape = g.querySelector<SVGElement>('.room-shape');
                if (shape) {
                    const fill = state?.status ? statusColors[state.status] : statusColors.hidden;

                    setInlineStyle(shape, {
                        fill,
                        opacity: state?.status === 'hidden' ? '0.35' : '1',
                    });
                }

                // Цена
                const priceNode = g.querySelector<SVGTextElement>('[data-label="price"]');
                if (priceNode) {
                    const text =
                        state?.price != null ? formatPrice(state.price, state.currency) : '—';
                    priceNode.textContent = text;
                }

                // Площадь
                const areaNode = g.querySelector<SVGTextElement>('[data-label="area"]');
                if (areaNode) {
                    if (!showArea) {
                        areaNode.textContent = '';
                    } else {
                        const text = state?.area != null ? formatArea(state.area) : '—';
                        areaNode.textContent = text;
                    }
                }
            });
        }

        applyRoomState();

        // Делегирование кликов: один listener на этаж, ищем ближайший g[data-room-id]
        function onClick(e: MouseEvent) {
            const target = e.target as Element | null;
            if (!target) return;

            const roomGroup = target.closest('g[data-room-id]');
            if (!roomGroup) return;

            const roomId = coerceRoomId(roomGroup.getAttribute('data-room-id'));
            if (roomId == null) return;

            // Если помещение скрыто — можно запретить клик
            const st = roomsState.get(roomId);
            if (st?.status === 'hidden') return;

            onRoomClick(roomId);
        }

        floorGroup.addEventListener('click', onClick);

        return () => {
            floorGroup.removeEventListener('click', onClick);
        };
    }, [
        svgText,
        roomsState,
        floorSelector,
        statusColors,
        strokeColor,
        strokeWidth,
        onRoomClick,
        showArea,
        formatPrice,
        formatArea,
        textClickThrough,
    ]);

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
            }}
        >
            {error ? (
                <div
                    style={{
                        padding: 12,
                        border: '1px solid #e0e0e0',
                        borderRadius: 8,
                        background: '#fff5f5',
                        color: '#8a1f1f',
                        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial',
                        fontSize: 14,
                    }}
                >
                    {error}
                </div>
            ) : null}

            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '100%',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    // SVG будет подстраиваться под контейнер
                }}
                // SVG обязательно inline, чтобы можно было навешивать клики и менять fill/text
                dangerouslySetInnerHTML={{ __html: svgText }}
            />
        </div>
    );
}
