<template>
    <div class="divider">
        <span>{{ label }}</span>
        <div class="horizontalLine"></div>
    </div>
</template>

<script>
export default {
    name: 'SimpleMenuDivider',
    props: {
        label: {
            type: String,
            required: true
        }
    }
}
</script>

<style scoped>
.divider {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: stretch;
    gap: 0.25rem;
    width: 100%;
}

.divider > span {
    color: #52565a;
    font-size: 0.625rem;
    user-select: none;
    transition: 0.2s;
}

.divider > .horizontalLine {
    flex-grow: 1;
    width: 100%;
    height: 0.0625rem;
    background-color: #3c3e43;
}
</style>
