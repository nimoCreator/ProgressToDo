<template>
    <div class="barToDo" 
        v-show="isVisible" 
        :style="{
        ...(
            todo.color ? {
                '--color': todo.color,
                '--color8': todo.color + '88',
                '--colorA': todo.color + 'aa'
            } : parentColor ? {
                '--color': parentColor,
                '--color8': parentColor + '88',
                '--colorA': parentColor + 'aa'
            } : {}
        )
    }" :id="todo.id"
    @contextmenu.stop.prevent.exact="toggleMenu"
    :title="todo.text"
    >
        <span class="dragHandle" title="Drag list"></span>
        <div class="medals" v-if="anyMedal">
            <div v-if="todo.star" class="medal starMedal">
                <span class="material-symbols-rounded icon fill">star</span>
            </div>
            <div v-if="todo.urgent" class="medal urgentMedal">
                <span class="material-symbols-rounded icon fill">mode_heat</span>
            </div>
            <div v-if="todo.archived" class="medal archivedMedal">
                <span class="material-symbols-rounded icon fill">inventory_2</span>
            </div>
        </div>
        <label :class="{ done: todo.done }">
            <input type="range" v-model="todo.done" min="0" max="1" step="0.01" />
            <div class="label" :style="{ '--percentage': todo.done, 'color': contrastColor }">
                {{ Math.round(todo.done * 100) }}%
            </div>
        </label>
        <div class="menu" @click="toggleMenu">
            <span class="menuOpenButton"> ... </span>
            <div class="buttons" :class="{ show: showMenu }">
                <div class="divider">
                    <span>modify</span>
                    <div class="horizontalLine"></div>
                </div>
                <div class="honoraryButton" @click.stop>
                    <NameIcon />
                    <input @click.stop type="text" v-model="todo.text" :style="{ width: textWidth + 'ch' }"
                        @input="adjustWidth" />
                </div>
                <div class="honoraryButton" @click.stop>
                    <span class="material-symbols-rounded icon">balance</span>
                    <input @click.stop type="number" v-model="todo.weight" />
                </div>

                <div class="divider">
                    <span>highlight</span>
                    <div class="horizontalLine"></div>
                </div>
                <button class="star" @click.stop="toggleStared" :class="{ fill: todo.star }">
                    <span class="material-symbols-rounded icon" :class="{ fill: todo.star }">star</span>
                    <span class="buttonLabel"> Star</span>
                </button>
                <button class="urgent" @click.stop="toggleUrgent" :class="{ fill: todo.urgent }">
                    <span class="material-symbols-rounded icon" :class="{ fill: todo.urgent }">mode_heat</span>
                    <span class="buttonLabel"> Urgent </span>
                </button>
                <button class="archived" @click.stop="toggleArchived" :class="{ fill: todo.archived }">
                    <span class="material-symbols-rounded icon" :class="{ fill: todo.archived }">inventory_2</span>
                    <span class="buttonLabel"> Archive </span>
                </button>
                <button class="color" @click.stop="openColorPallete" :style="{ '--backgroundColor': todo.color }">
                    <span class="material-symbols-rounded icon">palette</span>
                    <span class="buttonLabel"> Change Color </span>
                </button>
                <div class="colorPallete" v-if="showColorPallete" @click.stop>
                    <nimoColorPicker v-model="todo.color" />
                </div>

                <div class="divider">
                    <span>delete</span>
                    <div class="horizontalLine"></div>
                </div>
                <button class="delete" @click.stop="deleteToDo">
                    <span class="material-symbols-rounded icon">delete</span>
                    <span class="buttonLabel"> Delete ToDo </span>
                </button>
            </div>
        </div>
    </div>
</template>

<script>

import { useTodosStore } from '@/assets/stores/globalStorage.js';
import NameIcon from '../svg/NameIcon.vue';
import nimoColorPicker from './nimoColorPicker.vue';
import { contrastColorFromRgbLike } from '@/assets/js/functions.js';

export default {
    name: 'barToDo',
    components: {
        NameIcon,
        nimoColorPicker,
    },
    setup() {
        const store = useTodosStore();
        return { store };
    },
    data() {
        return {
            showMenu: false,
            showColorPallete: false,
            textWidth: 1,
        }
    },
    props: {
        modelValue: Object,
        parentColor: {
            type: String,
            default: '#00aaff'
        }
    },
    computed: {
        todo: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit('update:modelValue', value);
            }
        },
        anyMedal() {
            return this.todo.star || this.todo.urgent || this.todo.archived;
        },
        contrastColor() {
            return contrastColorFromRgbLike(this.todo.color ? this.todo.color : this.parentColor);
        },
        isVisible() {
            const s = this.store.settings;
            const passArchived = s.showArchived || !this.todo.archived;
            const doneVal = Number.isFinite(+this.todo.done) ? +this.todo.done : (this.todo.done ? 1 : 0);
            const passDone = s.showDone || doneVal < 1;
            return passArchived && passDone;
        },
    },
    methods: {
        deleteToDo() {
            console.log('deleteToDo', this.todo);
            this.$emit('deleteToDo', this.todo);
        },
        toggleMenu() {
            this.showMenu = !this.showMenu;
        },
        handleEscape(e) {
            if (e.key === 'Escape') {
                this.showMenu = false;
                this.showColorPallete = false;
            }
        },
        handleClickOutside(event) {
            // Skip closing if clicked inside the color palette
            if (this.$el.contains(event.target) && event.target.closest('.colorPallete')) {
                return;
            }

            // Otherwise proceed with normal outside click handling
            if (!this.$el.contains(event.target)) {
                this.showMenu = false;
                this.showColorPallete = false;
            }
        },
        adjustWidth(event) {
            this.textWidth = event.target.value.length || 1;
        },
        toggleStared() {
            this.todo.star = !this.todo.star;
        },
        toggleUrgent() {
            this.todo.urgent = !this.todo.urgent;
        },
        toggleArchived() {
            this.todo.archived = !this.todo.archived;
        },
        openColorPallete(event) {
            event.stopPropagation();
            this.showColorPallete = !this.showColorPallete;
        },
        changeColor(color) {
            this.todo.color = color;
            this.showColorPallete = false;
        },
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside);
        document.addEventListener('keydown', this.handleEscape);
        this.adjustWidth({ target: { value: this.todo.text } });
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
        document.removeEventListener('keydown', this.handleEscape);
    },
}
</script>

<style scoped>
@import url(@/assets/css/menu.css);

.barToDo {
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 0.5rem;
    width: 100%;
    flex-grow: 1;

    max-height: 3rem;

    position: relative;

    --lightTextColor: #eee;
    --darkTextColor: #222;
}

.barToDo>.content {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;

    align-items: center;
    flex-grow: 1;
    position: relative;

    height: 100%;
}

label {
    flex-grow: 1;
    display: flex;

    position: relative;
}

input {
    text-overflow: ellipsis;
    flex-grow: 1;

    accent-color: var(--color, #00aaff);
}

.label {
    opacity: 0;
}

label:hover .label {
    opacity: 1;
}

.label {
    display: flex;
    align-items: center;
    justify-content: center;

    position: absolute;
    bottom: -1.25rem;
    font-size: 0.625rem;
    background-color: var(--color, #00aaff);
    color: #fff;

    padding: 0.125rem 0.25rem;
    border-radius: 0.5rem;
    width: 2.25rem;

    left: calc(0.5rem + ((100% - 1rem) * var(--percentage, 0.5)));
    transform: translateX(-50%);

    z-index: 5;

    white-space: nowrap;

    user-select: none;
    pointer-events: none;
}

.label:before {
    content: '';
    position: absolute;

    border-width: 0.375rem;
    border-style: solid;
    border-color: transparent transparent var(--color, #00aaff) transparent;

    bottom: 0.875rem;
}
.medals {
    left: -1rem
}
</style>