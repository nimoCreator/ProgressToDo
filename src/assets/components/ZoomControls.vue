<template>
    <div class="zoomControls" @click.stop @pointerdown.stop>
        <SimpleButton class="small zoomOut" icon="remove" :disabled="zoom <= minZoom" title="Zoom out (Ctrl + scroll)"
            @click="$emit('zoomOut')" />
        <SimpleButton class="small zoomValue" :label="Math.round(zoom * 100) + '%'" title="Reset zoom to 100%"
            @click="$emit('reset')" />
        <SimpleButton class="small zoomIn" icon="add" :disabled="zoom >= maxZoom" title="Zoom in (Ctrl + scroll)"
            @click="$emit('zoomIn')" />
        <SimpleButton class="small fitAll" icon="fit_screen" title="Show all lists" @click="$emit('fit')" />
        <SimpleButton class="small arrange" icon="grid_view" :disabled="!canArrange" title="Arrange lists in a grid"
            @click="$emit('arrange')" />
    </div>
</template>

<script>
import { MAX_ZOOM, MIN_ZOOM } from '@/assets/js/board.js';
import SimpleButton from '@/assets/ui/SimpleButton.vue';

export default {
    name: 'ZoomControls',
    components: { SimpleButton },
    props: {
        zoom: { type: Number, required: true },
        canArrange: { type: Boolean, default: true },
    },
    emits: ['zoomIn', 'zoomOut', 'reset', 'fit', 'arrange'],
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

.zoomControls .zoomValue {
    min-width: 3.75rem;
}

.zoomControls .zoomValue :deep(.buttonLabel) {
    flex-grow: 1;
    text-align: center;
    font-variant-numeric: tabular-nums;
    font-size: 0.85rem;
}
</style>
