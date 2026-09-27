<template>
    <Teleport to="body">
        <div class="contextMenu" ref="panel" :data-owner="owner"
            :class="{ dragging, placed, popupsRight }" :style="panelStyle" @contextmenu.stop.prevent>
            <div class="menuGrip" @pointerdown="onGripDown" :title="gripTitle">
                <span class="material-symbols-rounded icon">drag_indicator</span>
                <span class="gripLabel">{{ gripLabel }}</span>
                <button v-if="pinned !== 'auto'" class="unpin" @click.stop="unpin" @pointerdown.stop
                    title="Unpin: place this menu automatically again">
                    <span class="material-symbols-rounded icon fill">keep_off</span>
                </button>
            </div>
            <slot />
        </div>
        <div v-if="dragging && snapTarget" class="menuSnapGhost" :style="ghostStyle"></div>
    </Teleport>
</template>

<script>
import { useTodosStore } from '@/assets/stores/globalStorage.js';
import { clampToScreen, findSnapZone, placeMenu } from '@/assets/js/menuPosition.js';

// Floating menu for a task or list. Rendered outside the zoomed board so it keeps its size,
// placed next to its item without covering it, and draggable: dropped next to the item it
// pins to that side (remembered per item type), dropped elsewhere it stays where it was left.
export default {
    name: 'ContextMenu',
    inject: {
        board: { default: null },
    },
    props: {
        // DOM id of the element the menu belongs to.
        anchorId: { type: String, required: true },
        // 'list' | 'checkbox' | 'bar' — pinned side is remembered per kind.
        kind: { type: String, required: true },
        // Id of the owning todo, used to tell clicks inside this menu apart.
        owner: { type: String, required: true },
    },
    setup() {
        return { store: useTodosStore() };
    },
    data() {
        return {
            pos: { x: 0, y: 0 },
            placed: false,
            free: false,
            dragging: false,
            grab: null,
            snapTarget: null,
            side: null,
        };
    },
    computed: {
        pinned() {
            return this.store.settings.menuSnap?.[this.kind] || 'auto';
        },
        panelStyle() {
            return { left: `${this.pos.x}px`, top: `${this.pos.y}px` };
        },
        ghostStyle() {
            const r = this.$refs.panel?.getBoundingClientRect();
            return {
                left: `${this.snapTarget.x}px`, top: `${this.snapTarget.y}px`,
                width: `${r?.width || 0}px`, height: `${r?.height || 0}px`,
            };
        },
        // Nested popups (color palette) open towards the middle of the screen.
        popupsRight() {
            return this.pos.x < window.innerWidth / 2;
        },
        gripLabel() {
            if (this.free) return 'moved';
            return this.pinned === 'auto' ? '' : `pinned ${this.pinned}`;
        },
        gripTitle() {
            return 'Drag to move. Drop next to the item to pin menus of this kind there.';
        },
        viewportKey() {
            const v = this.board?.viewport;
            return v ? `${v.x},${v.y},${v.zoom}` : '';
        },
    },
    watch: {
        // Follow the item while the board pans or zooms.
        viewportKey() {
            this.position();
        },
        pinned() {
            this.position();
        },
    },
    methods: {
        anchorRect() {
            return document.getElementById(this.anchorId)?.getBoundingClientRect() || null;
        },
        menuSize() {
            const r = this.$refs.panel.getBoundingClientRect();
            return { width: r.width, height: r.height };
        },
        screen() {
            return { width: window.innerWidth, height: window.innerHeight };
        },
        position() {
            if (!this.$refs.panel || this.dragging) return;
            const size = this.menuSize();
            if (this.free) {
                this.pos = clampToScreen(this.pos, size, this.screen());
                return;
            }
            const anchor = this.anchorRect();
            if (!anchor) return;
            const p = placeMenu(anchor, size, this.screen(), this.pinned);
            this.pos = { x: p.x, y: p.y };
            this.side = p.side;
            this.placed = true;
        },
        onGripDown(e) {
            if (e.button !== 0) return;
            e.preventDefault();
            this.dragging = true;
            this.grab = { x: e.clientX - this.pos.x, y: e.clientY - this.pos.y };
            e.currentTarget.setPointerCapture(e.pointerId);
            e.currentTarget.addEventListener('pointermove', this.onGripMove);
            e.currentTarget.addEventListener('pointerup', this.onGripUp);
            e.currentTarget.addEventListener('pointercancel', this.onGripUp);
        },
        onGripMove(e) {
            this.pos = clampToScreen(
                { x: e.clientX - this.grab.x, y: e.clientY - this.grab.y }, this.menuSize(), this.screen());
            const anchor = this.anchorRect();
            this.snapTarget = anchor && findSnapZone(this.pos, this.kind, anchor, this.menuSize(), this.screen());
        },
        onGripUp(e) {
            e.currentTarget.removeEventListener('pointermove', this.onGripMove);
            e.currentTarget.removeEventListener('pointerup', this.onGripUp);
            e.currentTarget.removeEventListener('pointercancel', this.onGripUp);
            this.dragging = false;
            if (this.snapTarget) {
                this.store.settings.menuSnap = { ...this.store.settings.menuSnap, [this.kind]: this.snapTarget.side };
                this.free = false;
            } else {
                this.free = true;
            }
            this.snapTarget = null;
            this.position();
        },
        unpin() {
            this.store.settings.menuSnap = { ...this.store.settings.menuSnap, [this.kind]: 'auto' };
            this.free = false;
            this.position();
        },
    },
    mounted() {
        this.position();
        this.resizeObserver = new ResizeObserver(() => this.position());
        this.resizeObserver.observe(this.$refs.panel);
        const anchor = document.getElementById(this.anchorId);
        if (anchor) this.resizeObserver.observe(anchor);
        window.addEventListener('resize', this.position);
    },
    beforeUnmount() {
        this.resizeObserver?.disconnect();
        window.removeEventListener('resize', this.position);
    },
};
</script>

<style>
.contextMenu {
    position: fixed;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 1rem);

    background-color: #1e1f24;
    border: 2px solid #282a30;
    border-radius: 0.5rem;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);

    visibility: hidden;
}

.contextMenu.placed {
    visibility: visible;
}

.contextMenu.dragging {
    box-shadow: 0 0.75rem 2.5rem rgba(0, 0, 0, 0.7);
    opacity: 0.9;
}

/* The menu's buttons keep their styles; only their old "drop down under the ..." placement is undone. */
body .contextMenu > .buttons.show {
    position: static;
    transform: none;
    border: none;
    box-shadow: none;
    overflow-y: auto;
    min-height: 0;
}

.contextMenu.popupsRight .buttons .colorPallete {
    right: auto;
    left: calc(100% + 0.5rem);
}

.contextMenu > .menuGrip {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    min-height: 1.5rem;
    padding: 0.125rem 0.25rem;

    color: #52565a;
    font-size: 0.625rem;
    cursor: grab;
    user-select: none;
    touch-action: none;

    border-bottom: 1px solid #282a30;
}

.contextMenu.dragging > .menuGrip {
    cursor: grabbing;
}

.contextMenu > .menuGrip .icon {
    font-size: 1rem;
}

.contextMenu > .menuGrip .gripLabel {
    flex-grow: 1;
}

.contextMenu > .menuGrip .unpin {
    display: flex;
    padding: 0.125rem;
    border: none;
    background: none;
}

.menuSnapGhost {
    position: fixed;
    z-index: 999;
    pointer-events: none;
    border: 2px dashed #4f7ea8;
    border-radius: 0.5rem;
    background-color: rgba(79, 126, 168, 0.12);
}
</style>
