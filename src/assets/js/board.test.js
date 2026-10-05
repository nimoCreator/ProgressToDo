import { describe, expect, it } from 'vitest';
import {
    arrangeGrid, clampZoom, edgePanSpeed, fitRects, MAX_ZOOM, MIN_ZOOM, orderByHeight, screenToWorld, snapToGrid,
    zoomAround,
} from './board.js';

describe('clampZoom / snapToGrid', () => {
    it('keeps zoom within limits', () => {
        expect(clampZoom(10)).toBe(MAX_ZOOM);
        expect(clampZoom(0.01)).toBe(MIN_ZOOM);
        expect(clampZoom(1.3)).toBe(1.3);
    });

    it('snaps to the 16px grid', () => {
        expect(snapToGrid(7)).toBe(0);
        expect(snapToGrid(9)).toBe(16);
        expect(snapToGrid(-9)).toBe(-16);
    });
});

describe('screenToWorld / zoomAround', () => {
    it('converts screen to world coordinates', () => {
        expect(screenToWorld({ x: 100, y: 50, zoom: 2 }, 300, 250)).toEqual({ x: 100, y: 100 });
    });

    it('keeps the world point under the cursor fixed while zooming', () => {
        const v = { x: 40, y: -20, zoom: 0.8 };
        const before = screenToWorld(v, 500, 300);
        const next = zoomAround(v, 500, 300, 1.7);
        const after = screenToWorld(next, 500, 300);
        expect(next.zoom).toBe(1.7);
        expect(after.x).toBeCloseTo(before.x);
        expect(after.y).toBeCloseTo(before.y);
    });

    it('clamps the zoom it applies', () => {
        expect(zoomAround({ x: 0, y: 0, zoom: 1 }, 0, 0, 50).zoom).toBe(MAX_ZOOM);
    });
});

describe('fitRects', () => {
    it('centers the bounding box and caps zoom at 100%', () => {
        const v = fitRects([{ x: 0, y: 0, width: 100, height: 100 }], 1000, 800);
        expect(v.zoom).toBe(1);
        expect(v).toMatchObject({ x: 450, y: 350 });
    });

    it('zooms out so a large layout fits inside the padding', () => {
        const v = fitRects([
            { x: 0, y: 0, width: 400, height: 300 },
            { x: 1600, y: 800, width: 400, height: 400 },
        ], 1000, 800, { padding: 100 });
        expect(v.zoom).toBeCloseTo(0.4);
        expect(screenToWorld(v, 500, 400)).toEqual({ x: 1000, y: 600 });
    });

    it('returns the default view without items', () => {
        expect(fitRects([], 1000, 800)).toEqual({ x: 0, y: 0, zoom: 1 });
    });
});

describe('orderByHeight', () => {
    it('sorts ascending without mutating the input', () => {
        const items = [{ id: 'c', height: 300 }, { id: 'a', height: 100 }, { id: 'b', height: 200 }];
        expect(orderByHeight(items).map(i => i.id)).toEqual(['a', 'b', 'c']);
        expect(items.map(i => i.id)).toEqual(['c', 'a', 'b']);
    });

    it('keeps row-major grid rows shorter than unsorted input would', () => {
        const items = [100, 150, 200, 250, 300, 350].map((height, i) => ({ id: `${i}`, width: 100, height }));
        const sorted = orderByHeight(items);
        const positions = arrangeGrid(sorted, { gap: 10, columns: 3 });
        const rowOf = (id) => positions.find(p => p.id === id).y;
        // Row 0 (y === 0) should hold the three shortest items, row 1 the three tallest.
        expect(sorted.filter(it => rowOf(it.id) === 0).map(it => it.height)).toEqual([100, 150, 200]);
        expect(sorted.filter(it => rowOf(it.id) !== 0).map(it => it.height)).toEqual([250, 300, 350]);
    });
});

describe('arrangeGrid', () => {
    it('returns nothing for an empty list', () => {
        expect(arrangeGrid([])).toEqual([]);
    });

    it('packs items into a near-square grid by default', () => {
        const items = [
            { id: 'a', width: 200, height: 100 },
            { id: 'b', width: 300, height: 150 },
            { id: 'c', width: 200, height: 400 },
        ];
        // sqrt(3) rounds up to 2 columns.
        const pos = arrangeGrid(items, { gap: 10 });
        expect(pos.map(p => p.id)).toEqual(['a', 'b', 'c']);
        expect(pos[0]).toEqual({ id: 'a', x: 0, y: 0 });
        expect(pos[1]).toEqual({ id: 'b', x: 210, y: 0 }); // column 1 starts after a's width + gap
        expect(pos[2]).toEqual({ id: 'c', x: 0, y: 160 }); // row 2 starts after row 1's tallest item + gap
    });

    it('honors an explicit column count', () => {
        const items = [
            { id: 'a', width: 100, height: 100 },
            { id: 'b', width: 100, height: 100 },
            { id: 'c', width: 100, height: 100 },
        ];
        const pos = arrangeGrid(items, { gap: 20, columns: 1 });
        expect(pos).toEqual([
            { id: 'a', x: 0, y: 0 },
            { id: 'b', x: 0, y: 120 },
            { id: 'c', x: 0, y: 240 },
        ]);
    });
});

describe('edgePanSpeed', () => {
    it('is zero away from the edges', () => {
        expect(edgePanSpeed(500, 1000)).toBe(0);
    });

    it('pans towards the edge the pointer is near, faster when closer', () => {
        expect(edgePanSpeed(0, 1000)).toBe(18);
        expect(edgePanSpeed(30, 1000)).toBe(9);
        expect(edgePanSpeed(1000, 1000)).toBe(-18);
        expect(edgePanSpeed(-50, 1000)).toBe(18);
    });
});
