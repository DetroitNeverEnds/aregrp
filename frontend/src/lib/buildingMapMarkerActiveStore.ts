let activeUuid: string | undefined = undefined;
const listeners = new Set<() => void>();

export function subscribeActiveBuildingMarker(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function getActiveBuildingMarkerUuid(): string | undefined {
    return activeUuid;
}

export function setActiveBuildingMarkerUuid(uuid: string | undefined) {
    if (activeUuid === uuid) return;
    activeUuid = uuid;
    listeners.forEach(l => l());
}
