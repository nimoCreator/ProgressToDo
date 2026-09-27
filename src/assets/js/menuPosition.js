// Placement of a context menu next to the element it belongs to (screen coordinates).

export const MENU_GAP = 8;
export const SCREEN_MARGIN = 8;
export const SNAP_DISTANCE = 48;

const AUTO_ORDER = ['right', 'left', 'below', 'above'];

// Where the user may pin a menu: next to a task, or next to / above a list.
export const SNAP_ZONES = {
    list: ['left', 'right', 'above'],
    checkbox: ['left', 'right'],
    bar: ['left', 'right'],
};

function clamp(v, lo, hi) {
    return hi < lo ? lo : Math.min(hi, Math.max(lo, v));
}

// Menu position on one side of the anchor; slid along that side to stay on screen.
export function sidePlacement(side, anchor, menu, screen, gap = MENU_GAP, margin = SCREEN_MARGIN) {
    const yAlongSide = clamp(anchor.top, margin, screen.height - margin - menu.height);
    const xAlongSide = clamp(anchor.right - menu.width, margin, screen.width - margin - menu.width);
    switch (side) {
        case 'right': return { x: anchor.right + gap, y: yAlongSide };
        case 'left': return { x: anchor.left - gap - menu.width, y: yAlongSide };
        case 'below': return { x: xAlongSide, y: anchor.bottom + gap };
        case 'above': return { x: xAlongSide, y: anchor.top - gap - menu.height };
        default: throw new Error(`Unknown side: ${side}`);
    }
}

export function fitsOnScreen(p, menu, screen, margin = SCREEN_MARGIN) {
    return p.x >= margin && p.y >= margin
        && p.x + menu.width <= screen.width - margin
        && p.y + menu.height <= screen.height - margin;
}

export function overlapsAnchor(p, menu, anchor) {
    return p.x < anchor.right && p.x + menu.width > anchor.left
        && p.y < anchor.bottom && p.y + menu.height > anchor.top;
}

function visibleArea(p, menu, screen) {
    const w = Math.max(0, Math.min(p.x + menu.width, screen.width) - Math.max(p.x, 0));
    const h = Math.max(0, Math.min(p.y + menu.height, screen.height) - Math.max(p.y, 0));
    return w * h;
}

export function clampToScreen(p, menu, screen, margin = SCREEN_MARGIN) {
    return {
        x: clamp(p.x, margin, screen.width - margin - menu.width),
        y: clamp(p.y, margin, screen.height - margin - menu.height),
    };
}

// Picks the first side (preferred one first) where the menu is fully on screen without covering
// the anchor. If no side works, uses the side showing most of the menu and pushes it on screen,
// covering the anchor only as a last resort.
// anchor: { left, top, right, bottom }, menu: { width, height }, screen: { width, height }.
export function placeMenu(anchor, menu, screen, preferred = 'auto') {
    const order = preferred === 'auto' || !AUTO_ORDER.includes(preferred)
        ? AUTO_ORDER
        : [preferred, ...AUTO_ORDER.filter(s => s !== preferred)];

    for (const side of order) {
        const p = sidePlacement(side, anchor, menu, screen);
        if (fitsOnScreen(p, menu, screen) && !overlapsAnchor(p, menu, anchor)) {
            return { ...p, side, overlaps: false };
        }
    }

    const best = order
        .map(side => ({ side, p: sidePlacement(side, anchor, menu, screen) }))
        .reduce((a, b) => (visibleArea(b.p, menu, screen) > visibleArea(a.p, menu, screen) ? b : a));
    const p = clampToScreen(best.p, menu, screen);
    return { ...p, side: best.side, overlaps: overlapsAnchor(p, menu, anchor) };
}

// Snap zone of a menu dragged to `p`, or null when it is not close to any allowed zone.
export function findSnapZone(p, kind, anchor, menu, screen, distance = SNAP_DISTANCE) {
    let best = null;
    for (const side of SNAP_ZONES[kind] || []) {
        const target = clampToScreen(sidePlacement(side, anchor, menu, screen), menu, screen);
        const d = Math.hypot(target.x - p.x, target.y - p.y);
        if (d <= distance && (!best || d < best.distance)) best = { side, distance: d, ...target };
    }
    return best;
}
