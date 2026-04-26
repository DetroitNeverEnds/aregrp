import { useSyncExternalStore } from 'react';
import { BREAKPOINT_DESKTOP_MIN_PX } from '@/constants/breakpoints';

export type Gadget = 'mobile' | 'desktop';

function subscribeMinWidth(minWidthPx: number, onChange: () => void): () => void {
    const query = `(min-width: ${minWidthPx}px)`;
    const mq = window.matchMedia(query);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
}

function snapshotMinWidth(minWidthPx: number): boolean {
    return window.matchMedia(`(min-width: ${minWidthPx}px)`).matches;
}

export function useMediaQueryMinWidth(minWidthPx: number): boolean {
    return useSyncExternalStore(
        onStoreChange => subscribeMinWidth(minWidthPx, onStoreChange),
        () => snapshotMinWidth(minWidthPx),
        () => false,
    );
}

export function useIsDesktop(): boolean {
    return useMediaQueryMinWidth(BREAKPOINT_DESKTOP_MIN_PX);
}

export function useIsMobile(): boolean {
    return !useIsDesktop();
}

/**
 * Текущий layout-гаджет по брейкпоинту `BREAKPOINT_DESKTOP_MIN_PX`.
 * Реакция на смену: `useEffect(..., [gadget])` (или `[useIsDesktop()]`).
 */
export function useGadget(): Gadget {
    return useIsDesktop() ? 'desktop' : 'mobile';
}
