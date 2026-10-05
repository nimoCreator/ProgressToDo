<template>
    <button class="simpleButton" @click="$emit('click', $event)">
        <span v-if="icon" class="material-symbols-rounded icon" :class="{ fill: active }">{{ icon }}</span>
        <slot v-else name="icon" />
        <span v-if="label" class="buttonLabel">{{ label }}</span>
    </button>
</template>

<script>
export default {
    name: 'SimpleButton',
    props: {
        icon: { type: String, default: '' },
        label: { type: String, default: '' },
        // Toggled/"on" state for icon-only actions (e.g. Star, Lock) — fills the material icon.
        active: { type: Boolean, default: false },
    },
    emits: ['click'],
};
</script>

<style scoped>
.simpleButton {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-grow: 1;
    width: 100%;

    padding: 0.25rem 0.5rem 0.25rem 0.25rem;

    color: #7c8187;
    background-color: #282a30;
    border: 1px solid #3c3e43;
    border-radius: 0.5rem;

    cursor: pointer;
    user-select: none;

    transition: 0.2s;
}

.simpleButton:hover {
    color: #fff;
    background-color: #5e5e5e;
    transform: translateY(-0.125rem);

    transition: 0.1s;
}

.simpleButton:active {
    color: #fff;
    background-color: #cacaca;
    transform: translateY(0.0625rem);

    transition: 0.05s;
}

.simpleButton:disabled {
    opacity: 0.4;
    cursor: default;
    color: #7c8187;
    background-color: #282a30;
    transform: none;
}

.simpleButton.small {
    flex-grow: 0;
    width: auto;
    height: 2.25rem;
    min-width: 2.25rem;
    padding: 0 0.5rem;
    justify-content: center;
}

.simpleButton .icon,
.simpleButton :deep(svg) {
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

.simpleButton:hover .icon,
.simpleButton:hover :deep(svg) {
    opacity: 1;
    transition: 0.1s;
}

.simpleButton .buttonLabel {
    flex-grow: 1;
    text-align: left;
    white-space: nowrap;
}

/* #region variants — pass the name as a plain class, e.g. <SimpleButton class="delete" ... /> */

.simpleButton.add:hover { background-color: #316841; }
.simpleButton.add:active { background-color: #00cc2c; }

.simpleButton.delete:hover { background-color: #70393d; }
.simpleButton.delete:active { background-color: #d43a3a; }

.simpleButton.clear:hover { background-color: #70393d; }
.simpleButton.clear:active { background-color: #d43a3a; }

.simpleButton.star:hover { background-color: #686331; }
.simpleButton.star:active { background-color: #cc8b00; }

.simpleButton.urgent:hover { background-color: #683331; }
.simpleButton.urgent:active { background-color: #d43a3a; }

.simpleButton.nimo:hover { background-color: #00aaff; }
.simpleButton.nimo:active { background-color: #00aaff; }

.simpleButton.color:hover { background-color: color-mix(in srgb, #5e5e5e, var(--backgroundColor) 20%); }
.simpleButton.color:active { background-color: color-mix(in srgb, #cacaca, var(--backgroundColor) 50%); }

/* #endregion variants */
</style>
