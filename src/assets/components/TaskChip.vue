<template>
    <div class="taskChip" :style="{ '--contrastColor': contrastColor, '--taskColor': color }">
        <div class="medals" v-if="anyMedals">
            <div v-if="star" class="medal starMedal">
                <span class="material-symbols-rounded icon fill">star</span>
            </div>
            <div v-if="urgent" class="medal urgentMedal">
                <span class="material-symbols-rounded icon fill">mode_heat</span>
            </div>
            <div v-if="archived" class="medal archivedMedal">
                <span class="material-symbols-rounded icon fill">inventory_2</span>
            </div>
        </div>
        <span class="text">{{ text }}</span>
        <div class="typeIndicator">
            <div v-if="type === 'checkBox'" class="checkBox">
                <span class="material-symbols-rounded icon">check_box</span>
            </div>
            <div v-else-if="type === 'bar'" class="bar">
                <span class="material-symbols-rounded icon">switches</span>
            </div>
            <div v-else-if="type === 'list'" class="list">
                <span class="material-symbols-rounded icon">lists</span>
            </div>
            <div v-else class="other">
                <span class="material-symbols-rounded icon">help_outline</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "TaskChip",
    props: {
        task: {
            type: Object,
            required: true
        }
    },
    computed: {
        text() {
            return this.task.text || "No Text";
        },
        color() {
            return this.task.color || "#888888";
        },
        contrastColor() {
            const r = parseInt(this.color.slice(1, 3), 16);
            const g = parseInt(this.color.slice(3, 5), 16);
            const b = parseInt(this.color.slice(5, 7), 16);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            return brightness > 128 ? "#000000" : "#FFFFFF";
        },
        star() {
            return this.task.medals && this.task.medals.includes("star");
        },
        urgent() {
            return this.task.medals && this.task.medals.includes("urgent");
        },
        archived() {
            return this.task.medals && this.task.medals.includes("archived");
        },
        anyMedals() {
            return this.star || this.urgent || this.archived;
        },
        type() {
            return this.task.type || "other";
        },
    }
}
</script>

<style scoped>

.taskChip {
    width: 100%;

    display: flex;
    flex-direction: row;
    align-items: center;

    gap: 0.5rem;

    position: relative;

    padding: 0.25rem 0.5rem;

    color: #fff;
}

.medals {
    display: flex;
    align-items: center;

    left: 0;
    position: unset;
}

.medal {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.125rem;
    height: 1.125rem;
    border-radius: 50%;
}

.medal span {
    font-size: 0.8rem;
    color: #f0f0f0;
}

.text {
    flex: 1 1 auto;
    min-width: 0;
    text-align: center;
    font-weight: 600;
    font-size: 0.9rem;
    letter-spacing: 0.2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.typeIndicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.625rem;
    height: 1.625rem;
    aspect-ratio: 1 / 1;
    border-radius: 0.625rem;
    background: var(--taskColor, #00aaff);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: inset 0 0.3rem 0.6rem rgba(255, 255, 255, 0.05);
}

.typeIndicator .icon {
    font-size: 1rem;
}

</style>

