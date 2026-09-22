// Circle versus rotated rectangle, all in canvas coordinates.
export function overlapsTrash(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    scale: number,
    rotation: number,
    targetX: number,
    targetY: number,
    radius: number,
) {
    'worklet';
    const dx = targetX - centerX;
    const dy = targetY - centerY;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    // Undo rotation to find the nearest point on the item's rectangle.
    const localX = dx * cos + dy * sin;
    const localY = -dx * sin + dy * cos;
    const distanceX = Math.max(Math.abs(localX) - width * Math.abs(scale) / 2, 0);
    const distanceY = Math.max(Math.abs(localY) - height * Math.abs(scale) / 2, 0);
    return distanceX * distanceX + distanceY * distanceY <= radius * radius;
}
