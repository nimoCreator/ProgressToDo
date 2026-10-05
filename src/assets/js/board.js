// Board (infinite canvas) helpers shared by the canvas components and the rest of the app.

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 2;
export const GRID_SIZE = 16;
export const FOCUS_EVENT = 'progresstodo:focus';

export function clampZoom(zoom) {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function snapToGrid(value, grid = GRID_SIZE) {
    return Math.round(value / grid) * grid;
}

// Screen point -> world point for a viewport { x, y, zoom } (screen = world * zoom + offset).
export function screenToWorld(viewport, sx, sy) {
    return { x: (sx - viewport.x) / viewport.zoom, y: (sy - viewport.y) / viewport.zoom };
}

// Returns a viewport zoomed to `zoom` while keeping screen point (sx, sy) over the same world point.
export function zoomAround(viewport, sx, sy, zoom) {
    const z = clampZoom(zoom);
    const world = screenToWorld(viewport, sx, sy);
    return { x: sx - world.x * z, y: sy - world.y * z, zoom: z };
}

// Viewport that fits all rects ({ x, y, width, height } in world units) into a screen of size w x h.
export function fitRects(rects, w, h, { padding = 80, maxZoom = 1 } = {}) {
    if (!rects.length) return { x: 0, y: 0, zoom: 1 };
    const minX = Math.min(...rects.map(r => r.x));
    const minY = Math.min(...rects.map(r => r.y));
    const maxX = Math.max(...rects.map(r => r.x + r.width));
    const maxY = Math.max(...rects.map(r => r.y + r.height));
    const zoom = clampZoom(Math.min(
        (w - padding * 2) / Math.max(1, maxX - minX),
        (h - padding * 2) / Math.max(1, maxY - minY),
        maxZoom,
    ));
    return {
        x: w / 2 - ((minX + maxX) / 2) * zoom,
        y: h / 2 - ((minY + maxY) / 2) * zoom,
        zoom,
    };
}

// Speed (px per frame) to pan the board when a dragged pointer is near a screen edge.
export function edgePanSpeed(pos, size, margin = 60, maxSpeed = 18) {
    if (pos < margin) return ((margin - Math.max(pos, 0)) / margin) * maxSpeed;
    if (pos > size - margin) return -((Math.min(pos, size) - (size - margin)) / margin) * maxSpeed;
    return 0;
}

// Reorders items by height so a row-major grid groups similar heights together: consecutive
// items end up in the same row, so each row is short items or tall items, not a mix.
export function orderByHeight(items) {
    return [...items].sort((a, b) => a.height - b.height);
}

// Lays items (id, width, height) out into a tidy grid, row by row, near-square by default.
// Returns [{ id, x, y }]; each row's height is its tallest item, each column's width its widest.
export function arrangeGrid(items, { gap = 48, columns } = {}) {
    if (!items.length) return [];
    const cols = Math.max(1, columns || Math.ceil(Math.sqrt(items.length)));
    const colWidths = Array(cols).fill(0);
    items.forEach((it, i) => {
        const c = i % cols;
        colWidths[c] = Math.max(colWidths[c], it.width);
    });
    const colX = [];
    let x = 0;
    for (let c = 0; c < cols; c++) {
        colX.push(x);
        x += colWidths[c] + gap;
    }

    const positions = [];
    let y = 0;
    let rowHeight = 0;
    items.forEach((it, i) => {
        const c = i % cols;
        if (c === 0 && i !== 0) {
            y += rowHeight + gap;
            rowHeight = 0;
        }
        positions.push({ id: it.id, x: colX[c], y });
        rowHeight = Math.max(rowHeight, it.height);
    });
    return positions;
}

// Asks the board to bring a todo into view and highlight it (used by Starred/Urgent and AI Assist).
export function focusTodo(id) {
    window.dispatchEvent(new CustomEvent(FOCUS_EVENT, { detail: { id } }));
}
