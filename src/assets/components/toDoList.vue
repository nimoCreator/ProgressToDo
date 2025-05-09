<template>
    <div :class="{ toDo: true, hasCountdown: todo.countdownVisable, hasProgress: todo.progressVisable }"
        :style="{ '--color': todo.color }"
        :id="todo.id">
        <div class="header">
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

            <div class="emoji" @click="toggleEmojiPicker"> {{ todo.emoji || '📝' }} </div>
            <emoji-picker @click.stop v-if="showEmojiPicker" @select="selectEmoji" theme="auto" />
            <input type="text" class="toDoName" v-model="todo.name">
            <div class="menu" @click.stop="toggleMenu">
                <span> ... </span>
                <div class="buttons" :class="{ show: showMenu }">
                    <div class="divider">
                        <span>add</span>
                        <div class="horizontalLine"></div>
                    </div>

                    <button class="add" @click.stop="addCheckBoxToDo">
                        <CheckBoxToDoIcon />
                        <span> Add CheckBox Todo </span>
                    </button>

                    <button class="add" @click.stop="addBarToDo">
                        <BarToDoIcon />
                        <span> Add ToDo Bar </span>
                    </button>

                    <button class="add" @click.stop="addToDoList">
                        <ListToDoIcon />
                        <span> Add ToDo List </span>
                    </button>

                    <div class="divider">
                        <span>highlight</span>
                        <div class="horizontalLine"></div>
                    </div>
                    <button class="star" @click.stop="toggleStared" :class="{ fill: todo.star }">
                        <StarIconFilled v-if="todo.star" />
                        <StarIcon v-else />
                        <span> Star</span>
                    </button>
                    <button class="urgent" @click.stop="toggleUrgent" :class="{ fill: todo.urgent }">
                        <FireIconFilled v-if="todo.urgent" />
                        <FireIcon v-else />
                        <span> Urgent </span>
                    </button>
                    <button class="archived" @click.stop="toggleArchived" :class="{ fill: todo.archived }">
                        <ArchiveIconFilled v-if="todo.archived" />
                        <ArchiveIcon v-else />
                        <span> Archive </span>
                    </button>
                    <button class="color" @click.stop="openColorPallete" :style="{ '--backgroundColor': todo.color }">
                        <ColorPalleteIcon />
                        <span> Change Color </span>
                    </button>
                    <div class="colorPallete" v-if="showColorPallete" @click.stop>
                        <nimoColorPicker v-model="todo.color" />
                    </div>

                    <div class="divider">
                        <span>modify</span>
                        <div class="horizontalLine"></div>
                    </div>

                    <button class="toggleProgress" @click.stop="toggleProgress">
                        <PercentSymbolIcon />
                        <span> {{ todo.progressVisable ? "Hide Progress" : "Show Progress" }} </span>
                    </button>

                    <button class="toggleCountdown" @click.stop="toggleCountdown">
                        <ClockIcon />
                        <span> {{ todo.countdownVisable ? "Hide Countdown" : "Show countdown" }} </span>
                    </button>

                    <button class="toggleBinaryProgress" @click.stop="toggleBinaryProgress">
                        <GraphIcon />
                        <span> {{ todo.progressBinary ? "Linear Progress" : "Binary Progress" }} </span>
                    </button>

                    <div class="honoraryButton" @click.stop>
                        <ScaleIcon />
                        <input @click.stop type="number" v-model="todo.weight" />
                    </div>


                    <div class="divider">
                        <span>delete</span>
                        <div class="horizontalLine"></div>
                    </div>

                    <button class="clear" @click.stop="clearToDoList">

                        <TrashcanIcon />
                        <span> Clear ToDoList </span>
                    </button>

                    <button class="delete" @click.stop="deleteToDo">
                        <CancelIcon />
                        <span> Delete List </span>
                    </button>
                </div>
            </div>
        </div>
        <div class="countdownContainer" v-if="todo.countdownVisable">
            <div class="countdownBar">
                <div class="progress" :class="countdownClass" :style="{ width: countdownPercentage }">
                    <span class="countdownCountdown"> {{ countdownCountdown }} </span>
                    <span class="countdownPercentage"> {{ countdownPercentage }} </span>
                </div>
            </div>
            <div class="dateStart">
                <input type="datetime-local" v-model="todo.dateStart">
            </div>
            <div class="dateEnd">
                <input type="datetime-local" v-model="todo.dateEnd">
            </div>
        </div>

        <div class="progressBar" v-if="this.todo.progressVisable">
            <div class="progress" :class="{ zero: toDoDone === 0 || toDoCount === 0 }"
                :style="{ width: progressPercentage }">
                <span> {{ progressPercentage || "empty" }} </span>
            </div>
        </div>

        <component v-for="(todoItem, index) in notArchivedTodos" :key="todoItem.id" :is="todoItem.component"
            v-model="notArchivedTodos[index]" @deleteToDo="deleteElement(index)"
            :parentColor="todo.color ? todo.color : parentColor" 
            />
    </div>
</template>

<script>
import checkBoxToDo from '@/assets/components/checkBoxToDo.vue';
import barToDo from '@/assets/components/barToDo.vue';
import EmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css';
import CheckBoxToDoIcon from '../svg/CheckBoxToDoIcon.vue';
import BarToDoIcon from '../svg/BarToDoIcon.vue';
import ListToDoIcon from '../svg/ListToDoIcon.vue';
import ClockIcon from '../svg/ClockIcon.vue';
import PercentSymbolIcon from '../svg/PercentSymbolIcon.vue';
import GraphIcon from '../svg/GraphIcon.vue';
import ScaleIcon from '../svg/ScaleIcon.vue';
import TrashcanIcon from '../svg/TrashcanIcon.vue';
import CancelIcon from '../svg/CancelIcon.vue';
import StarIcon from '../svg/StarIcon.vue';
import StarIconFilled from '../svg/StarIconFilled.vue';
import FireIcon from '../svg/FireIcon.vue';
import FireIconFilled from '../svg/FireIconFilled.vue';
import ColorPalleteIcon from '../svg/ColorPalleteIcon.vue';
import nimoColorPicker from '@/assets/components/nimoColorPicker.vue';
import ArchiveIconFilled from '../svg/archiveIconFilled.vue';
import ArchiveIcon from '../svg/archiveIcon.vue';

import { showArchived } from '@/assets/js/globalStorage.js';


export default {
    name: 'ToDoList',
    components: {
        checkBoxToDo,
        EmojiPicker,
        barToDo,
        toDoList: () => import('@/assets/components/toDoList.vue'),

        CheckBoxToDoIcon,
        BarToDoIcon,
        ListToDoIcon,
        PercentSymbolIcon,
        ClockIcon,
        GraphIcon,
        ScaleIcon,
        TrashcanIcon,
        CancelIcon,
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
            showEmojiPicker: false,
            toDoCount: 0,
            toDoDone: 0,
            progressPercentage: "0%",
            countdownCountdown: "0d 0h 0m 0s",
            countdownPercentage: "0%",
            countdownInterval: null,
            countdownClass: "",
            showColorPallete: false,
        };
    },
    props: {
        modelValue: Object,
        parentColor: {
            type: String,
            default: '#00aaff'
        }
    },
    methods: {
        addCheckBoxToDo() {
            this.todo.todos.push({
                id: this.generateUniqueId(),

                type: 'checkbox',
                component: 'checkBoxToDo',

                text: '',
                done: 0,
                weight: 1,

                dateStart: new Date().toISOString().slice(0, 16),
                dateEnd: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // 24h later

                star: false,
                urgent: false,
                archived: false,

                color: null,

            });
        },
        addBarToDo() {
            this.todo.todos.push({
                id: this.generateUniqueId(),

                type: 'bar',
                component: 'barToDo',

                text: '',
                done: 0,
                weight: 1,

                dateStart: new Date().toISOString().slice(0, 16),
                dateEnd: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // 24h later

                star: false,
                urgent: false,
                archived: false,

                color: null,
            });
        },
        addToDoList() {
            this.todo.todos.push({
                id: this.generateUniqueId(),

                type: 'list',
                component: 'toDoList',

                created: new Date(),
                modified: new Date(),
                emoji: '📝',
                name: '',
                todos: [],
                done: 0,
                weight: 1,
                progressBinary: false,
                progressVisable: false,
                countdownVisable: false,

                dateStart: new Date().toISOString().slice(0, 16),
                dateEnd: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // 24h later

                star: false,
                urgent: false,
                archived: false,

                color: null,
            });
        },


        clearToDoList() {
            this.todo.todos = [];
        },
        deleteElement(index) {
            this.todo.todos.splice(index, 1);
            this.updateProgress();
        },
        deleteToDo() {
            this.$emit('deleteToDo', this.todo);
        },
        toggleProgress() {
            this.todo.progressVisable = !this.todo.progressVisable;
        },
        toggleCountdown() {
            this.todo.countdownVisable = !this.todo.countdownVisable;
        },
        toggleBinaryProgress() {
            this.todo.progressBinary = !this.todo.progressBinary;
            this.updateProgress();
        },
        toggleMenu() {
            this.showMenu = !this.showMenu;
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
        handleClickOutside(event) {
            if (this.$el && !this.$el.contains(event.target)) {
                this.showMenu = false;
                this.showColorPallete = false;
            }
        },
        selectEmoji(emoji) {
            console.log('Selected emoji:', emoji);
            this.todo.emoji = emoji.i;
            this.showEmojiPicker = false;
        },
        toggleEmojiPicker() {
            this.showEmojiPicker = !this.showEmojiPicker;
        },

        updateProgress() {
            let totalWeight = this.todo.todos.reduce((sum, todo) => sum + todo.weight, 0);
            let completedWeight = 0;
            if (this.todo.progressBinary) {
                completedWeight = this.todo.todos
                    .filter(todo => todo.done >= 1)
                    .reduce((sum, todo) => sum + todo.weight, 0);
            }
            else {
                completedWeight = this.todo.todos
                    .reduce((sum, todo) => sum + todo.weight * todo.done, 0);
            }
            if (totalWeight === 0) {
                this.progressPercentage = "0%";
                this.toDoDone = 0;
                this.toDoCount = 0;
                this.todo.done = 0;
            }
            else {
                this.progressPercentage = `${Math.round((completedWeight / totalWeight) * 100)}%`;
                this.toDoDone = this.todo.todos.filter(todo => todo.done).length;
                this.toDoCount = this.todo.todos.length;
                this.todo.done = (completedWeight / totalWeight);
            }
        },

        updateCountdown() {

            if (!this.todo.countdownVisable) {
                return;
            }

            const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
            if (
                !this.todo.dateStart ||
                !this.todo.dateEnd ||
                !isoDateTimeRegex.test(this.todo.dateStart) ||
                !isoDateTimeRegex.test(this.todo.dateEnd)
            ) {
                clearInterval(this.countdownInterval);
                return;
            }


            let now = new Date();
            let start = new Date(this.todo.dateStart);
            let end = new Date(this.todo.dateEnd);

            if (start > end) {
                let temp = start;
                start = end;
                end = temp;
                this.todo.dateStart = start.toISOString().slice(0, 16);
                this.todo.dateEnd = end.toISOString().slice(0, 16);
            }

            let total = end - start;
            let remaining = end - now;
            let percentage = Math.round(
                (now - start) / total * 100
            );




            if (now > end) {
                this.countdownPercentage = "100%";
                this.countdownCountdown = "Late";
                this.countdownClass = "late";
            }
            else if (now < start) {
                this.countdownPercentage = "100%";
                this.countdownCountdown = "Early";
                this.countdownClass = "early";
            }
            else {
                this.countdownPercentage = `${percentage}%`;

                let days = Math.floor(remaining / 1000 / 60 / 60 / 24);
                let hours = Math.floor(remaining / 1000 / 60 / 60 % 24);
                let minutes = Math.floor(remaining / 1000 / 60 % 60);
                let seconds = Math.floor(remaining / 1000 % 60);

                this.countdownCountdown = `
                    ${days > 0 ? `${days}d ` : ''} 
                    ${hours > 0 ? `${hours}h ` : ''} 
                    ${minutes > 0 ? `${minutes}m ` : ''} 
                    ${seconds > 0 ? `${seconds}s` : ''}`.trim();

                this.countdownClass = "";
            }
        },
        generateUniqueId() {
            return Math.random().toString(36).substr(2, 9);
        },  
    },
    mounted() {
        this.updateProgress();
        this.updateCountdown();
        this.countdownInterval = setInterval(this.updateCountdown, 1000);
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);

        clearInterval(this.countdownInterval);
    },
    watch: {
        'todo.todos': {
            handler() {
                this.updateProgress();
            },
            deep: true
        },
        'todo.dateStart': {
            handler() {
                clearInterval(this.countdownInterval);
                this.updateCountdown();
                this.countdownInterval = setInterval(this.updateCountdown, 1000);
            },
            immediate: true
        },
        'todo.dateEnd': {
            handler() {
                clearInterval(this.countdownInterval);
                this.updateCountdown();
                this.countdownInterval = setInterval(this.updateCountdown, 1000);
            },
            immediate: true
        },
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
        notArchivedTodos() {
            if (showArchived.value) return this.todo.todos;
            return this.todo.todos.filter(todo => !todo.archived);
        },
        anyMedal() {
            return this.todo.star || this.todo.urgent || this.todo.archived;
        },
    }


}
</script>

<style scoped>
@import url(@/assets/css/menu.css);

.toDo {
    width: min-content;

    padding: 1rem;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    background-color: #1e1f24;
    border: 1px solid color-mix(in srgb, var(--color, #60616a), #60616a 50%);
}

.toDo>.toDo {
    width: calc(100% + 1.5rem);
    margin-left: -0.75rem;
    margin-right: -0.75rem;
}

.toDoName {
    width: 100%;
    font-size: 1rem;
    padding: 0.5em 0.125rem;
    border: none;
    border-bottom: 1px solid color-mix(in srgb, var(--color, #60616a), #60616a 20%);
    ;
    color: #c9cacf;
    background: none;
    outline: transparent;
    transition: all 0.3s;
}

.toDo:hover .toDoName {
    border-bottom: 1px solid #fff;
    color: #fff;
}

.toDoName:hover {
    padding-left: 0.25rem;
}

.toDoName:focus {
    padding-left: 0.5rem;
}

.header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

.header .emoji {
    cursor: pointer;
    user-select: none;

    position: relative;
    font-size: 1.5rem;

    border: 1px solid transparent;

    border-radius: 0.5rem;
    transition: 0.2s;
}

.header .emoji:hover {
    border: 1px solid #3c3e43;
    transition: 0.1s;
}

.header .emoji:active {
    transform: translateY(0.0625rem);
    transition: 0.05s;
}

.header .v3-emoji-picker {
    position: absolute;
    top: 0;
    left: 2rem;
    z-index: 3;
}

.progressBar {
    width: 100%;
    height: 0.75rem;
    background-color: #282a30;
    border-radius: 0.625rem;

    display: flex;
    align-items: center;
    justify-content: flex-start;
    overflow: hidden;
    position: relative;
}

.hasCountdown>.progressBar {
    border-radius: 0.0625rem 0.0625rem 0.375rem 0.375rem;
}

.progressBar .progress {

    height: 100%;
    background-color: var(--color, #00aaff);
    border-radius: 0.0625rem 0.125rem 0.125rem 0.0625rem;

    display: flex;
    align-items: center;
    justify-content: center;

    transition: all 0.2s;

    position: relative;
}

.hasCountdown>.progressBar>.progress {
    border-radius: 0.0625rem 0.125rem 0.125rem 0.0625rem;
}

.progressBar .progress span {
    color: #fff;

    font-size: 0.625em;
    font-weight: 900;

    transition: all 0.2s;
}

.progressBar .progress.zero {
    width: 0%;
    background-color: #282a30;
    position: static !important;
}

.progressBar .progress.zero span {
    width: 100% !important;
    text-align: center;
    opacity: 0;
}

.countdownContainer {
    width: 100%;
    gap: 0.0625rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas: "dateStart dateEnd" "progress progress";
}

.hasProgress>.countdownContainer {
    margin-bottom: -0.9375rem;
}

.countdownBar {
    grid-area: progress;

    width: 100%;
    height: 0.75rem;
    background-color: #282a30;
    border-radius: 0.0625rem 0.0625rem 0.375rem 0.375rem;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    overflow: hidden;

}

.hasProgress>.countdownContainer>.countdownBar {
    border-radius: 0;
}

.countdownBar .progress {

    height: 100%;
    background-color: var(--color, #00aaff);
    border-radius: 0.0625rem 0.125rem 0.125rem 0.375rem;

    display: flex;
    align-items: center;
    justify-content: center;

    transition: all 0.2s;

    position: relative;
}

.hasProgress>.countdownContainer>.countdownBar>.progress {
    border-radius: 0.0625rem 0.125rem 0.125rem 0.0625rem;
}

.countdownBar .progress span {
    color: #fff;
    font-size: 0.625em;
    font-weight: 900;

    width: max(100%, 1rem);
    height: 0.875rem;

    text-align: center;

    overflow: hidden;
    text-overflow: clip;
    white-space: wrap;

    position: absolute;
}

.countdownBar .progress.early {
    width: 100% !important;
    background-color: hsl(100, 60%, 30%);
}

.countdownBar .progress.late {
    width: 100% !important;
    background-color: hsl(10, 90%, 40%);
    animation: lateBlinking 0.5s infinite ease-in-out alternate;
}

@keyframes lateBlinking {
    0% {
        background-color: hsl(14, 92%, 38%);
    }

    100% {
        background-color: hsl(0, 84%, 46%);
    }
}

.countdownBar .progress.early span,
.countdownBar .progress.late span {
    width: 100% !important;
    text-align: center;
}


.countdownContainer .progress .countdownCountdown {
    color: #fff;
}

.countdownContainer:hover .progress .countdownCountdown {
    color: #fff0;
}

.countdownContainer .progress .countdownPercentage {
    color: #fff0;
}

.countdownContainer:hover .progress .countdownPercentage {
    color: #fff;
}

.countdownContainer .dateStart {
    grid-area: dateStart;
    place-self: start start;
}

.countdownContainer .dateEnd {
    grid-area: dateEnd;
    place-self: start end;
}

.countdownContainer .dateStart,
.countdownContainer .dateEnd {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
}

.countdownContainer .dateStart input,
.countdownContainer .dateEnd input {
    padding: 0.125rem 0.5rem;
    border: 1px solid #3c3e43;
    border-radius: 0.25rem;
    background-color: #282a30;
    color: #fffa;
    font-size: 0.75rem;
    text-align: center;
    color-scheme: dark light;
}

.countdownContainer .dateStart input {
    border-radius: 0.5rem 0.5rem 0.0625rem 0.0625rem;
    padding: 0.25rem 0.125rem 0.125rem 0.125rem;
}

.countdownContainer .dateEnd input {
    border-radius: 0.5rem 0.5rem 0.0625rem 0.0625rem;
    padding: 0.25rem 0.125rem 0.125rem 0.125rem;
}

.countdownContainer .dateStart::before {
    content: "Start";
    left: 0.5rem;
}

.countdownContainer .dateEnd::before {
    content: "End";
    right: 0.5rem;
}

.countdownContainer .dateStart::before,
.countdownContainer .dateEnd::before {
    color: #fff4;
    font-weight: 700;
    font-size: 0.5rem;
    position: absolute;
    bottom: 100%;
    z-index: 1;
}



.starMedal,
.urgentMedal {
    left: -1.5rem;
}

*:has(.starMedal) > .urgentMedal {
    top: 1rem;
}
*:has(.urgentMedal) > .starMedal {
    top: 0rem;
}


</style>
