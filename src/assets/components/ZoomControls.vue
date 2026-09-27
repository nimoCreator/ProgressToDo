<template>
    <div class="zoomControls" @click.stop @pointerdown.stop>
        <button class="zoomOut" @click="$emit('zoomOut')" :disabled="zoom <= minZoom" title="Zoom out (Ctrl + scroll)">
            <span class="material-symbols-rounded icon">remove</span>
        </button>
        <button class="zoomValue" @click="$emit('reset')" title="Reset zoom to 100%">
            {{ Math.round(zoom * 100) }}%
        </button>
        <button class="zoomIn" @click="$emit('zoomIn')" :disabled="zoom >= maxZoom" title="Zoom in (Ctrl + scroll)">
            <span class="material-symbols-rounded icon">add</span>
        </button>
        <button class="fitAll" @click="$emit('fit')" title="Show all lists">
            <span class="material-symbols-rounded icon">fit_screen</span>
        </button>
    </div>
</template>

<script>
import { MAX_ZOOM, MIN_ZOOM } from '@/assets/js/board.js';

export default {
    name: 'ZoomControls',
    props: {
        zoom: { type: Number, required: true },
    },
    emits: ['zoomIn', 'zoomOut', 'reset', 'fit'],
    data() {
        return { minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM };
    },
};
</script>

<style scoped>
.zoomControls {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem;

    background-color: #1e1f24;
    border: 1px solid #282a30;
    border-radius: 0.75rem;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
}

.zoomControls button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2.25rem;
    min-width: 2.25rem;
    padding: 0 0.5rem;
}

.zoomControls .zoomValue {
    min-width: 3.75rem;
    font-variant-numeric: tabular-nums;
    font-size: 0.85rem;
}

.zoomControls button:disabled {
    opacity: 0.4;
    cursor: default;
    transform: none;
    background-color: #282a30;
}
</style>
