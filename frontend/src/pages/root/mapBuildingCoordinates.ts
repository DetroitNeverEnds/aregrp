/**
 * Координаты для карты без lat/lng из API: раскладка вокруг центра (золотой угол),
 * чтобы метки не накладывались и оставались в одном кадре с разумным zoom.
 */
export function coordinateAroundCenter(
    center: [number, number],
    index: number,
    total: number,
): [number, number] {
    if (total <= 1) {
        return center;
    }
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const r = 0.004 * Math.sqrt(index + 1);
    const theta = index * goldenAngle;
    return [center[0] + r * Math.cos(theta), center[1] + r * Math.sin(theta)];
}
