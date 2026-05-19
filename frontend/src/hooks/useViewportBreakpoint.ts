import { useSyncExternalStore } from 'react';
import { BREAKPOINT_DESKTOP_MIN_PX } from '@/constants/breakpoints';

export type Device = 'mobile' | 'desktop';

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

export function useDevice(): Device {
    if (useMediaQueryMinWidth(BREAKPOINT_DESKTOP_MIN_PX)) {
        return 'desktop';
    }
    return 'mobile';
}

export function useIsDesktop(): boolean {
    return useDevice() === 'desktop';
}

export function useIsMobile(): boolean {
    return useDevice() === 'mobile';
}
