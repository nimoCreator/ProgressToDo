<template>
    <div class="checkBoxToDo" v-show="isVisible" :class="{ done: todo.done, ...archiveClasses }" :style="{
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
    @contextmenu.stop.prevent.exact="hasMenu && toggleMenu()"
    :title="archivedLabel || todo.text"
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


        <div @click="!archiveMode && toggleDone()" class="checkbox">
            <span class="checkboxField">
                <svg>
                    <use xlink:href="#check-4"></use>
                </svg>
            </span>
            <svg class="inlineSvg">
                <symbol id="check-4" viewBox="0 0 12 10">
                    <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                </symbol>
            </svg>
        </div>
        <div class="inputWrapper">
            <input type="text" v-model="todo.text" :readonly="archiveMode">
        </div>
        <div class="menu" v-if="hasMenu" @click="toggleMenu">
            <span class="menuOpenButton"> ... </span>
            <ContextMenu v-if="showMenu" :anchorId="todo.id" :owner="todo.id" kind="checkbox">
            <SimpleMenu>
                <template v-if="!archiveMode">

                <SimpleMenuDivider label="modify" />

                <SimpleWeightPicker v-model="todo.weight" />

                <SimpleMenuDivider label="highlight" />
                <SimpleButton aria-label="Mark as Starred" class="star" icon="star" :active="todo.star" label="Star"
                    @click.stop="toggleStared" />
                <SimpleButton class="urgent" icon="mode_heat" :active="todo.urgent" label="Urgent" @click.stop="toggleUrgent" />
                <SimpleButton class="archived" icon="inventory_2" :active="todo.archived" label="Archive" @click.stop="toggleArchived" />
                <SimpleButton class="color" icon="color_lens" label="Change Color" :style="{ '--backgroundColor': todo.color }"
                    @click.stop="openColorPallete" />
                <div class="colorPallete" v-if="showColorPallete" @click.stop>
                    <nimoColorPicker v-model="todo.color" />
                </div>

                <SimpleMenuDivider label="delete" />

                <SimpleButton class="delete" icon="delete" label="Delete ToDo" @click.stop="deleteToDo" />
                </template>
                <template v-else>
                    <SimpleMenuDivider label="archive" />
                    <SimpleButton class="restore" icon="unarchive" label="Restore" @click.stop="restoreFromArchive" />
                    <SimpleButton class="delete" icon="delete_forever" label="Delete Permanently" @click.stop="deleteFromArchive" />
                </template>

            </SimpleMenu>
            </ContextMenu>
        </div>
    </div>
</template>

<script scoped>

import { isNodeVisible, setArchived } from '@/assets/js/tree.js';
import archiveMode from '@/assets/js/archiveMode.js';
import { useTodosStore } from '@/assets/stores/globalStorage.js';
import nimoColorPicker from "@/assets/components/nimoColorPicker.vue";
import ContextMenu from '@/assets/components/ContextMenu.vue';
import contextMenuHost from '@/assets/js/contextMenuHost.js';
import SimpleMenu from '@/assets/ui/SimpleMenu.vue';
import SimpleMenuDivider from '@/assets/ui/SimpleMenuDivider.vue';
import SimpleButton from '@/assets/ui/SimpleButton.vue';
import SimpleWeightPicker from '@/assets/ui/SimpleWeightPicker.vue';

export default {
    name: 'checkBoxToDo',
    mixins: [archiveMode, contextMenuHost],
    components: {
        ContextMenu,
        nimoColorPicker,
        SimpleMenu,
        SimpleMenuDivider,
        SimpleButton,
        SimpleWeightPicker,
    },
    setup() {
        const store = useTodosStore();
        return { store };
    },
    data() {
        return {
            showMenu: false,
            showColorPallete: false,
        }
    },
    props: {
        modelValue: {
            type: Object,
            required: true
        },
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
        isVisible() {
            return this.archiveMode || isNodeVisible(this.todo, this.store.settings);
        },
    },
    methods: {
        deleteToDo() {
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
            const el = this.$el;
            if (!el || this.isInsideOwnMenu(event.target)) return;

            const clickedOutside = !el.contains(event.target);
            if (clickedOutside) {
                this.showMenu = false;
                this.showColorPallete = false;
            }
        },
        toggleStared() {
            this.todo.star = !this.todo.star;
        },
        toggleUrgent() {
            this.todo.urgent = !this.todo.urgent;
        },
        toggleArchived() {
            setArchived(this.todo, !this.todo.archived);
        },
        openColorPallete(event) {
            event.stopPropagation();
            this.showColorPallete = !this.showColorPallete;
        },
        changeColor(color) {
            this.todo.color = color;
            this.showColorPallete = false;
        },
        toggleDone() {
            this.todo.done = !this.todo.done;
        },

    },
}
</script>

<style scoped>
@import url(@/assets/css/menu.css);


.checkBoxToDo {
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 1rem;
    width: 100%;
    flex-grow: 1;
    height: 2rem;

    position: relative;
}

.checkBoxToDo .inputWrapper {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    flex-grow: 1;
    width: 100%;
    height: 100%;
    padding: 0.5em 0.125rem;

    position: relative;
}

.checkBoxToDo .inputWrapper::before {
    display: flex;
    content: '';
    position: absolute;

    width: 0;
    height: 0.0625rem;
    background-color: #fff;
    opacity: 0.75;

    transition: all 0.2s ease-in-out;
}

.checkBoxToDo.done .inputWrapper::before {
    width: 100%;

    transition: all 0.1s ease-in-out;
}

.checkBoxToDo.done .inputWrapper:hover::before {

    opacity: 0.25;
    transition: all 0.1s ease-in-out;
}


.checkBoxToDo input[type="text"] {
    flex-grow: 1;
    width: 100%;
    font-size: 1em;

    border: none;
    border-bottom: 1px solid #60616a88;
    color: hsl(234, 5%, 80%);
    background: none;
    outline: transparent;
    transition: all 0.3s;
}

.checkBoxToDo.done input[type="text"] {
    color: hsl(234, 5%, 40%);
}

*:hover>.checkBoxToDo input[type="text"] {
    border-bottom: 1px solid #aaa8;
    color: hsl(234, 5%, 90%);
}

.checkBoxToDo:hover>input[type="text"] {
    border-bottom: 1px solid var(--colorA, #fff8);
    color: hsl(234, 5%, 95%);
}

.checkBoxToDo input[type="text"]:hover {
    padding-left: 0.25rem;
}

.checkBoxToDo input[type="text"]:focus {
    padding-left: 0.5rem;
}










.checkBoxToDo .checkboxField {
    cursor: pointer;

    transition: all 0.2s ease;

    display: flex;
    justify-content: center;
    align-items: center;

    position: relative;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 0.25rem;

    outline: 0.125rem solid #fff4;

    transition: all 0.2s ease;


}

.checkBoxToDo:hover .checkboxField {
    outline: 0.125rem solid #fff8;
    background: #fff4;
}

.checkBoxToDo.done .checkboxField {
    outline: 0.125rem solid var(--color8, #00aaff88);
    background: var(--color8, #00aaff88);
}

.checkBoxToDo.done:hover .checkboxField {
    outline: 0.125rem solid var(--colorA, #00aaffaa);
    background: var(--colorA, #00aaffaa);
}

.checkBoxToDo .checkbox:hover .checkboxField,
.checkBoxToDo.done .checkbox:hover .checkboxField {
    outline: 0.125rem solid var(--color, #00aaff) !important;
    background: var(--color, #00aaff) !important;
}

.checkBoxToDo .checkboxField svg {
    fill: none;

    width: 1.5rem;
    height: 1.5rem;

    stroke: #fff;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 16px;
    stroke-dashoffset: 16px;
    transition: all 0.3s ease;
    transition-delay: 0.1s;
}

.checkBoxToDo.done .checkboxField svg {
    stroke-dashoffset: 0;
}

.checkbox .inlineSvg {
    position: absolute;
    width: 0;
    height: 0;
}

.checkbox .inputCheckbox {
    position: absolute;
    visibility: hidden;
}

.medals {
    left: -1rem
}


</style>