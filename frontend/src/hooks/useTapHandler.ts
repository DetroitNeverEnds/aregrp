import { useCallback, useRef } from 'react';

const DEFAULT_THRESHOLD_PX = 8;

/**
 * Возвращает обработчики pointer-событий, которые вызывают callback только при
 * «чистом» тапе — без перемещения пальца и без перехвата жеста браузером (скролл/зум).
 *
 * Решает задачу: не активировать интерактивный элемент (карту, маркер), когда
 * пользователь просто листает страницу и случайно проводит пальцем по нему.
 *
 * @param onTap    Функция, вызываемая при подтверждённом тапе.
 * @param threshold Максимальное смещение в px, при котором жест считается тапом (по умолчанию 8).
 */
export function useTapHandler(onTap: () => void, threshold = DEFAULT_THRESHOLD_PX) {
    const startX = useRef(0);
    const startY = useRef(0);
    const isDrag = useRef(false);
    const isCancelled = useRef(false);

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        startX.current = e.clientX;
        startY.current = e.clientY;
        isDrag.current = false;
        isCancelled.current = false;
    }, []);

    const onPointerMove = useCallback(
        (e: React.PointerEvent) => {
            const dx = e.clientX - startX.current;
            const dy = e.clientY - startY.current;
            if (Math.sqrt(dx * dx + dy * dy) > threshold) {
                isDrag.current = true;
            }
        },
        [threshold],
    );

    // Браузер перехватил жест (скролл / зум) — не считаем это тапом
    const onPointerCancel = useCallback(() => {
        isCancelled.current = true;
    }, []);

    const onPointerUp = useCallback(() => {
        if (!isDrag.current && !isCancelled.current) {
            onTap();
        }
    }, [onTap]);

    return { onPointerDown, onPointerMove, onPointerCancel, onPointerUp };
}
