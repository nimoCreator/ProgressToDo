<template>
    <div class="barToDo" 
        v-show="isVisible" 
        :class="archiveClasses"
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
        <label :class="{ done: todo.done }">
            <input type="range" v-model="todo.done" min="0" max="1" step="0.01" :disabled="archiveMode" />
            <div class="label" :style="{ '--percentage': todo.done, 'color': contrastColor }">
                {{ Math.round(todo.done * 100) }}%
            </div>
        </label>
        <div class="menu" v-if="hasMenu" @click="toggleMenu">
            <span class="menuOpenButton"> ... </span>
            <ContextMenu v-if="showMenu" :anchorId="todo.id" :owner="todo.id" kind="bar">
            <SimpleMenu>
                <template v-if="!archiveMode">
                <SimpleMenuDivider label="modify"/>
                <SimpleFieldButton>
                    <template #icon><NameIcon /></template>
                    <input type="text" v-model="todo.text" :style="{ width: textWidth + 'ch' }" @input="adjustWidth" />
                </SimpleFieldButton>
                <SimpleWeightPicker v-model="todo.weight" />

                <SimpleMenuDivider label="highlight"/>

                <SimpleButton class="star" icon="star" :active="todo.star" label="Star" @click.stop="toggleStared" />
                <SimpleButton class="urgent" icon="mode_heat" :active="todo.urgent" label="Urgent" @click.stop="toggleUrgent" />
                <SimpleButton class="archived" icon="inventory_2" :active="todo.archived" label="Archive" @click.stop="toggleArchived" />
                <SimpleButton class="color" icon="palette" label="Change Color" :style="{ '--backgroundColor': todo.color }"
                    @click.stop="openColorPallete" />
                <div class="colorPallete" v-if="showColorPallete" @click.stop>
                    <nimoColorPicker v-model="todo.color" />
                </div>

                <SimpleMenuDivider label="delete"/>
                <SimpleButton class="delete" icon="delete" label="Delete ToDo" @click.stop="deleteToDo" />
                </template>
                <template v-else>
                    <SimpleMenuDivider label="archive"/>
                    <SimpleButton class="restore" icon="unarchive" label="Restore" @click.stop="restoreFromArchive" />
                    <SimpleButton class="delete" icon="delete_forever" label="Delete Permanently" @click.stop="deleteFromArchive" />
                </template>
            </SimpleMenu>
            </ContextMenu>
        </div>
    </div>
</template>

<script>

import { isNodeVisible, setArchived } from '@/assets/js/tree.js';
import archiveMode from '@/assets/js/archiveMode.js';
import { useTodosStore } from '@/assets/stores/globalStorage.js';
import NameIcon from '../svg/NameIcon.vue';
import nimoColorPicker from './nimoColorPicker.vue';
import ContextMenu from '@/assets/components/ContextMenu.vue';
import contextMenuHost from '@/assets/js/contextMenuHost.js';
import { contrastColorFromRgbLike } from '@/assets/js/functions.js';

import SimpleMenu from '@/assets/ui/SimpleMenu.vue';
import SimpleMenuDivider from '@/assets/ui/SimpleMenuDivider.vue';
import SimpleButton from '@/assets/ui/SimpleButton.vue';
import SimpleFieldButton from '@/assets/ui/SimpleFieldButton.vue';
import SimpleWeightPicker from '@/assets/ui/SimpleWeightPicker.vue';

export default {
    name: 'barToDo',
    mixins: [archiveMode, contextMenuHost],
    components: {
        ContextMenu,
        NameIcon,
        nimoColorPicker,
        SimpleMenu,
        SimpleMenuDivider,
        SimpleButton,
        SimpleFieldButton,
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
            return this.archiveMode || isNodeVisible(this.todo, this.store.settings);
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
            if (this.isInsideOwnMenu(event.target)) return;

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
    },
    mounted() {
        this.adjustWidth({ target: { value: this.todo.text } });
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