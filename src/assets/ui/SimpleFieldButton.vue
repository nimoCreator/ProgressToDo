<template>
    <div class="simpleField" @click.stop>
        <span v-if="icon" class="material-symbols-rounded icon">{{ icon }}</span>
        <slot name="icon" />
        <slot />
    </div>
</template>

<script>
// Button-shaped shell for a menu row that hosts a control (an <input>, a picker, ...) instead of
// just firing a click — e.g. the weight number input. Special cases like this get their own
// SimpleXXX component (see SimpleWeightPicker) built on top of this shell.
export default {
    name: 'SimpleFieldButton',
    props: {
        icon: { type: String, default: '' },
    },
};
</script>

<style scoped>
.simpleField {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-grow: 1;
    width: 100%;

    padding: 0 0 0 0.5rem;

    color: #7c8187;
    background-color: #282a30;
    border: 1px solid #3c3e43;
    border-radius: 0.5rem;

    cursor: pointer;
    user-select: none;

    transition: 0.2s;
}

/* The #icon slot renders with its provider's scope id, not this component's — :deep() is
   required to reach it, plain descendant selectors won't match. */
.simpleField .icon,
.simpleField :deep(svg) {
    flex-grow: 0;
    width: 1.5rem;
    height: 1.5rem;
    font-size: 1.35rem;
    display: flex;
    align-items: center;
    justify-content: center;

    opacity: 0.5;
    transition: 0.2s;
}

.simpleField:hover .icon,
.simpleField:hover :deep(svg),
.simpleField:focus-within .icon,
.simpleField:focus-within :deep(svg) {
    opacity: 1;
    transition: 0.1s;
}

.simpleField:hover,
.simpleField:focus-within {
    color: #fff;
    background-color: #5e5e5e;

    transition: 0.1s;
}

.simpleField :deep(input) {
    flex-grow: 1;
    width: 100%;
    color-scheme: dark light;

    padding: 0.5rem;
    color: #7c8187 !important;
    background-color: #282a30;
    border: 1px solid #3c3e43;
    border-radius: 0 0.5rem 0.5rem 0;

    display: flex;
    align-items: center;
    justify-content: center;

    cursor: pointer;
    user-select: none;

    transition: 0.2s;
}

.simpleField:hover :deep(input),
.simpleField:focus-within :deep(input) {
    color: #fff !important;
    border-color: #7c8187;

    transition: 0.1s;
}
</style>
