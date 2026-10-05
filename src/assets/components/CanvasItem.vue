<template>
    <div class="canvasItem" :class="{ dragging, locked }" :style="style" @pointerdown.capture="onPointerDown">
        <slot />
    </div>
</template>

<script>
import { snapToGrid } from '@/assets/js/board.js';
import { findPath } from '@/assets/js/tree.js';

// Positions one top-level list on the board and moves it by its own drag handle. Dropped onto
// another list, it nests into it instead of settling at that spot — the reverse of "Extract to Board".
export default {
    name: 'CanvasItem',
    inject: ['board'],
    props: {
        // Top-level list; its pos is mutated in place.
        item: { type: Object, required: true },
        locked: { type: Boolean, default: false },
    },
    emits: ['front', 'nestInto'],
    data() {
        return { dragging: false, grab: null, lastPointer: null, dropTargetId: null };
    },
    computed: {
        style() {
            const pos = this.item.pos || { x: 0, y: 0 };
            return { left: `${pos.x}px`, top: `${pos.y}px`, zIndex: this.dragging ? 100000 : this.item.z };
        },
    },
    methods: {
        // Only the list's own handle moves it; handles of nested lists and tasks belong to vuedraggable.
        ownHandle(target) {
            const handle = target.closest?.('.dragHandleList');
            return handle && handle.parentElement === this.$el.firstElementChild ? handle : null;
        },
        onPointerDown(e) {
            this.$emit('front');
            if (e.button !== 0 || !this.ownHandle(e.target)) return;
            e.preventDefault();
            e.stopPropagation();
            if (this.locked) return;

            const p = this.board.toWorld(e.clientX, e.clientY);
            this.grab = { x: p.x - this.item.pos.x, y: p.y - this.item.pos.y };
            this.lastPointer = { x: e.clientX, y: e.clientY };
            this.dragging = true;
            this.$el.setPointerCapture(e.pointerId);
            this.$el.addEventListener('pointermove', this.onPointerMove);
            this.$el.addEventListener('pointerup', this.onPointerUp);
            this.$el.addEventListener('pointercancel', this.onPointerUp);
        },
        moveToPointer() {
            const p = this.board.toWorld(this.lastPointer.x, this.lastPointer.y);
            this.item.pos = { x: p.x - this.grab.x, y: p.y - this.grab.y };
        },
        onPointerMove(e) {
            this.lastPointer = { x: e.clientX, y: e.clientY };
            this.moveToPointer();
            this.updateDropTarget(e.clientX, e.clientY);
            this.board.autoPanUpdate(e.clientX, e.clientY, this.moveToPointer);
        },
        // Tracks which list (if any) sits under the pointer, so dropping there nests into it.
        // A list can't be dropped onto itself or into one of its own descendants (that's a cycle).
        updateDropTarget(clientX, clientY) {
            // elementFromPoint would just find the dragged card itself — it follows the pointer
            // and sits above everything else. Walk the full stack to find what's underneath it.
            const hoveredToDo = document.elementsFromPoint(clientX, clientY)
                .map(el => el.closest('.toDo'))
                .find(toDo => toDo && !this.$el.contains(toDo));
            const candidateId = hoveredToDo?.id || null;
            const validId = candidateId && candidateId !== this.item.id && !findPath(this.item.todos || [], candidateId)
                ? candidateId : null;
            if (validId === this.dropTargetId) return;
            document.getElementById(this.dropTargetId)?.classList.remove('nestDropTarget');
            document.getElementById(validId)?.classList.add('nestDropTarget');
            this.dropTargetId = validId;
        },
        onPointerUp() {
            this.board.stopAutoPan();
            this.$el.removeEventListener('pointermove', this.onPointerMove);
            this.$el.removeEventListener('pointerup', this.onPointerUp);
            this.$el.removeEventListener('pointercancel', this.onPointerUp);
            document.getElementById(this.dropTargetId)?.classList.remove('nestDropTarget');
            if (this.dropTargetId) {
                this.$emit('nestInto', this.dropTargetId);
            } else {
                this.item.pos = { x: snapToGrid(this.item.pos.x), y: snapToGrid(this.item.pos.y) };
            }
            this.dropTargetId = null;
            this.dragging = false;
        },
    },
    beforeUnmount() {
        if (this.dragging) this.onPointerUp();
    },
};
</script>

<style scoped>
.canvasItem {
    position: absolute;
}

.canvasItem > :deep(.toDo) {
    min-width: 25rem;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
    position: relative;
}

/* The list has no definite height here, so the handle's height: 100% would collapse; stretch it instead. */
.canvasItem > :deep(.toDo > .dragHandleList) {
    height: auto !important;
    align-self: stretch;
}

.canvasItem.dragging > :deep(.toDo) {
    box-shadow: 0 0.75rem 2.5rem rgba(0, 0, 0, 0.7);
}

.canvasItem.dragging > :deep(.toDo > .dragHandleList) {
    cursor: grabbing;
}

/* A locked list shows no handle of its own; nested handles stay usable. */
.canvasItem.locked > :deep(.toDo:hover) {
    border-radius: 1rem;
}

.canvasItem.locked > :deep(.toDo > .dragHandleList) {
    display: none;
}
</style>

<style>
/* Applied directly (vanilla JS) to whichever .toDo the pointer is over while dragging another
   list, since that element belongs to a different CanvasItem/toDoList instance entirely. */
.toDo.nestDropTarget {
    outline: 0.1875rem dashed #4f7ea8;
    outline-offset: 0.25rem;
    background-color: rgba(79, 126, 168, 0.12);
}
</style>
