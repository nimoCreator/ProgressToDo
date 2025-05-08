<template>
    <div class="barToDo" :style="{
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
    }" :id="todo.id">

        <div class="medals" v-if="anyMedal">
            <div v-if="todo.star" class="medal starMedal">
                <StarIconFilled />
            </div>
            <div v-if="todo.urgent" class="medal urgentMedal">
                <FireIconFilled />
            </div>
            <div v-if="todo.archived" class="medal archivedMedal">
                <ArchiveIconFilled />
            </div>
        </div>
        <label  :class="{ done: todo.done }">
            <input type="range" v-model="todo.done" min="0" max="1" step="0.01" />  
            <div class="label"
            :style="{ '--percentage': todo.done }">
                {{ Math.round(todo.done * 100) }}%
            </div>
        </label>
        <div class="menu" @click="toggleMenu">
            <span> ... </span>
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
                    <ScaleIcon/>
                    <input @click.stop type="number" v-model="todo.weight" />
                </div>

                <div class="divider">
                    <span>highlight</span>
                    <div class="horizontalLine"></div>
                </div>
                <button class="star" @click.stop="toggleStared" :class="{ fill : todo.star }">
                    <StarIconFilled v-if="todo.star" />
                    <StarIcon v-else/>
                    <span> Star</span>
                </button>
                <button class="urgent" @click.stop="toggleUrgent" :class="{ fill : todo.urgent }">
                    <FireIconFilled v-if="todo.urgent" />
                    <FireIcon v-else/>
                    <span> Urgent </span>
                </button>
                <button class="archived" @click.stop="toggleArchived" :class="{ fill: todo.archived }">
                        <ArchiveIconFilled v-if="todo.archived" />
                        <ArchiveIcon v-else />
                        <span> Archive </span>
                    </button>
                <button class="color" @click.stop="openColorPallete" :style="{ '--backgroundColor': todo.color }">
                    <ColorPalleteIcon/>
                    <span> Change Color </span>
                </button>
                <div class="colorPallete" v-if="showColorPallete" @click.stop>
                    <nimoColorPicker v-model="todo.color" />
                </div>

                <div class="divider">
                    <span>delete</span>
                    <div class="horizontalLine"></div>
                </div>
                <button class="delete" @click.stop="deleteToDo">
                    <DeleteIcon/>
                    <span> Delete ToDo </span>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import NameIcon from "@/assets/svg/NameIcon.vue";
import DeleteIcon from "@/assets/svg/DeleteIcon.vue";
import ScaleIcon from "@/assets/svg/ScaleIcon.vue";
import StarIcon from "@/assets/svg/StarIcon.vue";
import StarIconFilled from "../svg/StarIconFilled.vue";
import FireIcon from "@/assets/svg/FireIcon.vue";
import FireIconFilled from "../svg/FireIconFilled.vue";
import ColorPalleteIcon from "@/assets/svg/ColorPalleteIcon.vue";
import nimoColorPicker from "@/assets/components/nimoColorPicker.vue";
import ArchiveIconFilled from "@/assets/svg/ArchiveIconFilled.vue";
import ArchiveIcon from "@/assets/svg/ArchiveIcon.vue";

export default {
    name: 'barToDo',
    components: {
        NameIcon,
        DeleteIcon,
        ScaleIcon,
        StarIcon,
        StarIconFilled,
        FireIcon,
        FireIconFilled,
        ColorPalleteIcon,
        nimoColorPicker,
        ArchiveIconFilled,
        ArchiveIcon,
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
    },
    methods: {
        deleteToDo() {
            console.log('deleteToDo', this.todo);
            this.$emit('deleteToDo', this.todo);
        },
        toggleMenu() {
            this.showMenu = !this.showMenu;
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
        this.adjustWidth({ target: { value: this.todo.text } });
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    },
}
</script>

<style scoped>
@import url(@/assets/css/menu.css);

.barToDo {
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 1rem;
    width: 100%;
    flex-grow: 1;

    height: 2rem;

    position: relative;
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

    left: calc(0.5rem + ( (100% - 1rem) * var(--percentage, 0.5) ));
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
    position: absolute;
    left: -0.5rem;
}
.barToDo:has(.medals) {
    padding-left: 1.5rem;
}

</style>