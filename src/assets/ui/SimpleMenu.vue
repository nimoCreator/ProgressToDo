<template>
    <div class="simpleMenu" :class="{ show }">
        <slot />
    </div>
</template>

<script>
// Dropdown panel for a todo's action menu. Whatever is written inside the tag is the menu's
// content (SimpleMenuDivider / SimpleButton / anything else) — this component only owns the look.
export default {
    name: 'SimpleMenu',
    props: {
        // Toggles the open/close transition. Default true: when hosted inside ContextMenu the
        // panel is mounted/unmounted with v-if, so there is nothing to transition.
        show: { type: Boolean, default: true },
    },
};
</script>

<style scoped>
.simpleMenu {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;

    display: flex;
    flex-direction: column;
    justify-content: stretch;
    gap: 0.5rem;

    padding: 0.25rem;
    background-color: #1e1f24;
    border: 2px solid #282a30;
    border-radius: 0.5rem;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);

    transition: all 0.1s;
    transform: translateY(-0.5rem);

    opacity: 0;
    pointer-events: none;

    z-index: 2;
}

.simpleMenu.show {
    opacity: 1;
    pointer-events: all;
    transform: translateY(0rem);
}
</style>
