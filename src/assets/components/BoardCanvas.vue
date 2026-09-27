<template>
    <div class="boardViewport" ref="viewport" :class="{ panning: !!gesture }" :style="gridStyle"
        @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp"
        @pointercancel="onPointerUp" @wheel="onWheel">
        <div class="boardWorld" ref="world" :style="worldStyle">
            <slot />
        </div>
    </div>
</template>

<script>
import {
    clampZoom, edgePanSpeed, FOCUS_EVENT, fitRects, screenToWorld, zoomAround,
} from '@/assets/js/board.js';

// Elements that scroll on their own; wheel events inside them are left alone.
const OWN_SCROLL = '.v3-emoji-picker, .colorPallete, textarea';

export default {
    name: 'BoardCanvas',
    props: {
        // { x, y, zoom } — mutated in place so it is persisted with the store.
        viewport: { type: Object, required: true },
    },
    provide() {
        return { board: this };
    },
    data() {
        return {
            pointers: new Map(),
            gesture: null,
            autoPan: null,
            nativeDrag: false,
            animation: null,
        };
    },
    computed: {
        worldStyle() {
            const v = this.viewport;
            return { transform: `translate(${v.x}px, ${v.y}px) scale(${v.zoom})` };
        },
        gridStyle() {
            const v = this.viewport;
            const size = 24 * v.zoom;
            return { backgroundSize: `${size}px ${size}px`, backgroundPosition: `${v.x}px ${v.y}px` };
        },
    },
    methods: {
        /* #region coordinates / viewport */

        setViewport(next) {
            this.viewport.x = next.x;
            this.viewport.y = next.y;
            this.viewport.zoom = next.zoom;
        },
        size() {
            const el = this.$refs.viewport;
            return { w: el.clientWidth, h: el.clientHeight };
        },
        toWorld(clientX, clientY) {
            return screenToWorld(this.viewport, clientX, clientY);
        },
        // World point at the middle of the screen.
        viewCenter() {
            const { w, h } = this.size();
            return this.toWorld(w / 2, h / 2);
        },
        zoomBy(factor) {
            const { w, h } = this.size();
            this.animateTo(zoomAround(this.viewport, w / 2, h / 2, this.viewport.zoom * factor));
        },
        resetZoom() {
            const { w, h } = this.size();
            this.animateTo(zoomAround(this.viewport, w / 2, h / 2, 1));
        },
        itemRects() {
            return [...this.$refs.world.querySelectorAll(':scope > .canvasItem')].map(el => ({
                x: el.offsetLeft, y: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight,
            }));
        },
        fitAll({ animate = true } = {}) {
            const { w, h } = this.size();
            const next = fitRects(this.itemRects(), w, h);
            if (animate) this.animateTo(next);
            else this.setViewport(next);
        },
        animateTo(target, duration = 250) {
            cancelAnimationFrame(this.animation);
            const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
            if (reduce) { this.setViewport(target); return; }
            const from = { ...this.viewport };
            const start = performance.now();
            const step = (now) => {
                const t = Math.min(1, (now - start) / duration);
                const e = 1 - Math.pow(1 - t, 3);
                this.setViewport({
                    x: from.x + (target.x - from.x) * e,
                    y: from.y + (target.y - from.y) * e,
                    zoom: from.zoom + (target.zoom - from.zoom) * e,
                });
                if (t < 1) this.animation = requestAnimationFrame(step);
            };
            this.animation = requestAnimationFrame(step);
        },
        // Centers the board on the element with this id and highlights it.
        focusElement(id) {
            const el = document.getElementById(id);
            if (!el || !this.$refs.world.contains(el) || !el.offsetParent) return;
            const r = el.getBoundingClientRect();
            const center = this.toWorld(r.left + r.width / 2, r.top + r.height / 2);
            const { w, h } = this.size();
            const zoom = Math.max(this.viewport.zoom, 0.75);
            this.animateTo({ x: w / 2 - center.x * zoom, y: h / 2 - center.y * zoom, zoom }, 350);
            el.classList.add('highlight-item');
            setTimeout(() => el.classList.remove('highlight-item'), 2000);
        },
        onFocusEvent(e) {
            this.$nextTick(() => this.focusElement(e.detail.id));
        },

        /* #endregion */

        /* #region pan / pinch */

        isBackground(target) {
            return target === this.$refs.viewport || target === this.$refs.world;
        },
        onPointerDown(e) {
            // Left button (or touch) on empty board, or middle button anywhere, pans the board.
            const middle = e.button === 1;
            if (!middle && (e.button !== 0 || !this.isBackground(e.target))) return;
            if (middle) e.preventDefault();
            cancelAnimationFrame(this.animation);
            this.$refs.viewport.setPointerCapture(e.pointerId);
            this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
            this.startGesture();
        },
        onPointerMove(e) {
            if (!this.pointers.has(e.pointerId)) return;
            this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
            const g = this.gesture;
            if (!g) return;
            const pts = [...this.pointers.values()];
            if (g.type === 'pan') {
                this.setViewport({ x: g.vx + pts[0].x - g.x, y: g.vy + pts[0].y - g.y, zoom: g.zoom });
            } else {
                // Pinch: keep the world point under the first midpoint under the current midpoint.
                const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
                const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
                const zoom = clampZoom(g.zoom * dist / g.dist);
                this.setViewport({ x: mid.x - g.world.x * zoom, y: mid.y - g.world.y * zoom, zoom });
            }
        },
        onPointerUp(e) {
            if (!this.pointers.delete(e.pointerId)) return;
            this.startGesture();
        },
        // (Re)starts pan or pinch from the current pointers, so adding/removing a finger does not jump.
        startGesture() {
            const pts = [...this.pointers.values()];
            const v = this.viewport;
            if (pts.length === 0) {
                this.gesture = null;
            } else if (pts.length === 1) {
                this.gesture = { type: 'pan', x: pts[0].x, y: pts[0].y, vx: v.x, vy: v.y, zoom: v.zoom };
            } else {
                const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
                this.gesture = {
                    type: 'pinch',
                    zoom: v.zoom,
                    dist: Math.max(1, Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)),
                    world: this.toWorld(mid.x, mid.y),
                };
            }
        },
        onWheel(e) {
            if (e.target.closest?.(OWN_SCROLL)) return;
            e.preventDefault();
            cancelAnimationFrame(this.animation);
            const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? this.size().h : 1;
            const dx = e.deltaX * unit;
            const dy = e.deltaY * unit;
            if (e.ctrlKey || e.metaKey) {
                // Ctrl/Cmd + wheel and trackpad pinch zoom around the cursor.
                this.setViewport(zoomAround(this.viewport, e.clientX, e.clientY, this.viewport.zoom * Math.exp(-dy * 0.002)));
            } else if (e.shiftKey && !dx) {
                this.setViewport({ ...this.viewport, x: this.viewport.x - dy });
            } else {
                this.setViewport({ ...this.viewport, x: this.viewport.x - dx, y: this.viewport.y - dy });
            }
        },

        /* #endregion */

        /* #region auto-pan while dragging near the screen edge */

        // Called with the pointer position during any drag; onTick runs after each automatic pan step.
        autoPanUpdate(clientX, clientY, onTick = null) {
            if (!this.autoPan) this.autoPan = { frame: null };
            Object.assign(this.autoPan, { x: clientX, y: clientY, onTick });
            if (!this.autoPan.frame) this.autoPan.frame = requestAnimationFrame(this.autoPanStep);
        },
        autoPanStep(now) {
            const a = this.autoPan;
            if (!a) return;
            // Speed is per 60 fps frame; scale by elapsed time so throttled frames pan just as far.
            const frames = a.last ? Math.min((now - a.last) / (1000 / 60), 30) : 1;
            a.last = now;
            const rect = this.$refs.viewport.getBoundingClientRect();
            const dx = edgePanSpeed(a.x - rect.left, rect.width) * frames;
            const dy = edgePanSpeed(a.y - rect.top, rect.height) * frames;
            if (dx || dy) {
                this.setViewport({ ...this.viewport, x: this.viewport.x + dx, y: this.viewport.y + dy });
                a.onTick?.();
            }
            a.frame = requestAnimationFrame(this.autoPanStep);
        },
        stopAutoPan() {
            if (this.autoPan) cancelAnimationFrame(this.autoPan.frame);
            this.autoPan = null;
        },

        // Native HTML5 drag (vuedraggable / SortableJS moving tasks between lists).
        onNativeDragStart(e) {
            if (this.$refs.world.contains(e.target)) this.nativeDrag = true;
        },
        onNativeDragOver(e) {
            if (!this.nativeDrag || (e.clientX === 0 && e.clientY === 0)) return;
            this.autoPanUpdate(e.clientX, e.clientY);
        },
        onNativeDragEnd() {
            if (!this.nativeDrag) return;
            this.nativeDrag = false;
            this.stopAutoPan();
        },

        /* #endregion */
    },
    mounted() {
        window.addEventListener(FOCUS_EVENT, this.onFocusEvent);
        document.addEventListener('dragstart', this.onNativeDragStart, true);
        document.addEventListener('dragover', this.onNativeDragOver, true);
        document.addEventListener('dragend', this.onNativeDragEnd, true);
        document.addEventListener('drop', this.onNativeDragEnd, true);
    },
    beforeUnmount() {
        window.removeEventListener(FOCUS_EVENT, this.onFocusEvent);
        document.removeEventListener('dragstart', this.onNativeDragStart, true);
        document.removeEventListener('dragover', this.onNativeDragOver, true);
        document.removeEventListener('dragend', this.onNativeDragEnd, true);
        document.removeEventListener('drop', this.onNativeDragEnd, true);
        this.stopAutoPan();
        cancelAnimationFrame(this.animation);
    },
};
</script>

<style scoped>
.boardViewport {
    position: fixed;
    inset: 0;
    overflow: hidden;
    touch-action: none;
    cursor: grab;

    background-color: #15161a;
    background-image: radial-gradient(#2a2c32 1px, transparent 1.5px);
}

.boardViewport.panning {
    cursor: grabbing;
}

.boardWorld {
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
    transform-origin: 0 0;
    cursor: default;
}
</style>
