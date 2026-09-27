import { describe, expect, it } from 'vitest';
import {
    findSnapZone, fitsOnScreen, MENU_GAP, overlapsAnchor, placeMenu, SCREEN_MARGIN, sidePlacement,
} from './menuPosition.js';

const screen = { width: 1000, height: 800 };
const menu = { width: 200, height: 300 };
const rect = (left, top, width, height) => ({ left, top, right: left + width, bottom: top + height });

describe('placeMenu', () => {
    it('opens to the right of the item when there is room', () => {
        const anchor = rect(100, 100, 300, 40);
        const p = placeMenu(anchor, menu, screen);
        expect(p).toMatchObject({ side: 'right', x: 400 + MENU_GAP, y: 100, overlaps: false });
    });

    it('opens to the left when the right side is off screen', () => {
        const anchor = rect(700, 100, 250, 40);
        expect(placeMenu(anchor, menu, screen)).toMatchObject({ side: 'left', x: 700 - MENU_GAP - 200 });
    });

    it('slides along the side to stay on screen near the bottom edge', () => {
        const anchor = rect(100, 700, 300, 40);
        const p = placeMenu(anchor, menu, screen);
        expect(p.side).toBe('right');
        expect(p.y).toBe(screen.height - SCREEN_MARGIN - menu.height);
    });

    it('goes below or above a wide item', () => {
        const below = placeMenu(rect(50, 100, 900, 40), menu, screen);
        expect(below).toMatchObject({ side: 'below', y: 140 + MENU_GAP, overlaps: false });
        const above = placeMenu(rect(50, 600, 900, 40), menu, screen);
        expect(above).toMatchObject({ side: 'above', y: 600 - MENU_GAP - 300, overlaps: false });
    });

    it('uses the preferred (pinned) side first when it fits', () => {
        expect(placeMenu(rect(400, 100, 200, 40), menu, screen, 'left').side).toBe('left');
        expect(placeMenu(rect(400, 400, 200, 40), menu, screen, 'above').side).toBe('above');
    });

    it('falls back to another side when the pinned one does not fit', () => {
        expect(placeMenu(rect(20, 100, 200, 40), menu, screen, 'left').side).toBe('right');
    });

    it('stays fully on screen even when it has to cover the item', () => {
        const anchor = rect(0, 0, 1000, 800);
        const p = placeMenu(anchor, menu, screen);
        expect(fitsOnScreen(p, menu, screen)).toBe(true);
        expect(p.overlaps).toBe(true);
    });

    it('never covers the item when any side fits', () => {
        for (let x = 0; x <= 800; x += 50) {
            for (let y = 0; y <= 760; y += 40) {
                const anchor = rect(x, y, 200, 40);
                const p = placeMenu(anchor, menu, screen);
                expect(fitsOnScreen(p, menu, screen)).toBe(true);
                expect(overlapsAnchor(p, menu, anchor)).toBe(false);
            }
        }
    });
});

describe('findSnapZone', () => {
    const anchor = rect(300, 300, 300, 40);

    it('snaps a menu dropped near the side of a task', () => {
        const right = sidePlacement('right', anchor, menu, screen);
        expect(findSnapZone({ x: right.x + 20, y: right.y - 10 }, 'checkbox', anchor, menu, screen).side).toBe('right');
    });

    it('allows "above" only for lists', () => {
        const above = sidePlacement('above', anchor, menu, screen);
        expect(findSnapZone(above, 'list', anchor, menu, screen).side).toBe('above');
        expect(findSnapZone(above, 'checkbox', anchor, menu, screen)).toBeNull();
    });

    it('returns null far from every zone', () => {
        expect(findSnapZone({ x: 10, y: 10 }, 'list', anchor, menu, screen)).toBeNull();
    });
});
