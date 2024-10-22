<template>
    <div :class="{toDo : true, hasCountdown: todo.countdownVisable, hasProgress: todo.progressVisable}">
        <div class="header">
            <div class="emoji" @click="toggleEmojiPicker"> {{ todo.emoji || '📝' }} </div>
            <emoji-picker @click.stop v-if="showEmojiPicker" @select="selectEmoji" theme="auto"/>
            <input type="text" class="toDoName" v-model="todo.name">
            <div class="menu" @click="toggleMenu">
                <span> ... </span>
                <div class="buttons" :class="{ show: showMenu }">
                    <div class="divider">
                        <span>add</span>
                        <div class="horizontalLine"></div>
                    </div>

                    <button class="add" @click.stop="addCheckBoxToDo">
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M9 11L12 14L22 4M16 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                        <span> Add CheckBox Todo </span>
                    </button>

                    <button class="add" @click.stop="addBarToDo">
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8L15 8M15 8C15 9.65686 16.3431 11 18 11C19.6569 11 21 9.65685 21 8C21 6.34315 19.6569 5 18 5C16.3431 5 15 6.34315 15 8ZM9 16L21 16M9 16C9 17.6569 7.65685 19 6 19C4.34315 19 3 17.6569 3 16C3 14.3431 4.34315 13 6 13C7.65685 13 9 14.3431 9 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <span> Add ToDo Bar </span>
                    </button>

                    <button class="add" @click.stop="addToDoList">
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12L9 12M21 6L9 6M21 18L9 18M5 12C5 12.5523 4.55228 13 4 13C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11C4.55228 11 5 11.4477 5 12ZM5 6C5 6.55228 4.55228 7 4 7C3.44772 7 3 6.55228 3 6C3 5.44772 3.44772 5 4 5C4.55228 5 5 5.44772 5 6ZM5 18C5 18.5523 4.55228 19 4 19C3.44772 19 3 18.5523 3 18C3 17.4477 3.44772 17 4 17C4.55228 17 5 17.4477 5 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <span> Add ToDo List </span>
                    </button>

                    <div class="divider">
                        <span>modify</span>
                        <div class="horizontalLine"></div>
                    </div>

                    <button class="toggleProgress" @click.stop="toggleProgress">
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 5L5 19M9 7C9 8.10457 8.10457 9 7 9C5.89543 9 5 8.10457 5 7C5 5.89543 5.89543 5 7 5C8.10457 5 9 5.89543 9 7ZM19 17C19 18.1046 18.1046 19 17 19C15.8954 19 15 18.1046 15 17C15 15.8954 15.8954 15 17 15C18.1046 15 19 15.8954 19 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <span> {{ todo.progressVisable ? "Hide Progress" : "Show Progress" }} </span>
                    </button>

                    <button class="toggleCountdown" @click.stop="toggleCountdown">
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 3C6.47715 3 2 7.47715 2 13C2 18.5228 6.47715 23 12 23C17.5228 23 22 18.5228 22 13C22 7.47715 17.5228 3 12 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /> <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg> 
                        <span> {{ todo.countdownVisable ? "Hide Countdown" : "Show countdown"}} </span>
                    </button>

                    <button class="toggleBinaryProgress" @click.stop="toggleBinaryProgress">
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 9L14.5515 13.6061C14.3555 13.746 14.2576 13.816 14.1527 13.8371C14.0602 13.8557 13.9643 13.8478 13.8762 13.8142C13.7762 13.7762 13.691 13.691 13.5208 13.5208L10.4792 10.4792C10.309 10.309 10.2238 10.2238 10.1238 10.1858C10.0357 10.1522 9.9398 10.1443 9.84732 10.1629C9.74241 10.184 9.64445 10.254 9.44853 10.3939L3 15M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <span> {{ todo.progressBinary ? "Linear Progress" : "Binary Progress" }} </span>
                    </button>

                    <div class="honoraryButton" @click.stop>
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 17V16.8498C2 16.5333 2 16.3751 2.02421 16.2209C2.0457 16.084 2.08136 15.9497 2.13061 15.8202C2.18609 15.6743 2.2646 15.5369 2.42162 15.2622L6 9M2 17C2 19.2091 3.79086 21 6 21C8.20914 21 10 19.2091 10 17M2 17V16.8C2 16.52 2 16.38 2.0545 16.273C2.10243 16.1789 2.17892 16.1024 2.273 16.0545C2.37996 16 2.51997 16 2.8 16H9.2C9.48003 16 9.62004 16 9.727 16.0545C9.82108 16.1024 9.89757 16.1789 9.9455 16.273C10 16.38 10 16.52 10 16.8V17M6 9L9.57838 15.2622C9.7354 15.5369 9.81391 15.6743 9.86939 15.8202C9.91864 15.9497 9.9543 16.084 9.97579 16.2209C10 16.3751 10 16.5333 10 16.8498V17M6 9L18 7M14 15V14.8498C14 14.5333 14 14.3751 14.0242 14.2209C14.0457 14.084 14.0814 13.9497 14.1306 13.8202C14.1861 13.6743 14.2646 13.5369 14.4216 13.2622L18 7M14 15C14 17.2091 15.7909 19 18 19C20.2091 19 22 17.2091 22 15M14 15V14.8C14 14.52 14 14.38 14.0545 14.273C14.1024 14.1789 14.1789 14.1024 14.273 14.0545C14.38 14 14.52 14 14.8 14H21.2C21.48 14 21.62 14 21.727 14.0545C21.8211 14.1024 21.8976 14.1789 21.9455 14.273C22 14.38 22 14.52 22 14.8V15M18 7L21.5784 13.2622C21.7354 13.5369 21.8139 13.6743 21.8694 13.8202C21.9186 13.9497 21.9543 14.084 21.9758 14.2209C22 14.3751 22 14.5333 22 14.8498V15M12 3V8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        <input @click.stop type="number" v-model="todo.weight"/>
                    </div>


                    <div class="divider">
                        <span>delete</span>
                        <div class="horizontalLine"></div>
                    </div>

                    <button class="clear" @click.stop="clearToDoList">
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0975 18.1409 18.8867 17.8 19.485C17.4999 20.0118 17.0472 20.4353 16.5017 20.6997C15.882 21 15.0911 21 13.5093 21H10.4907C8.90891 21 8.11803 21 7.49834 20.6997C6.95276 20.4353 6.50009 20.0118 6.19998 19.485C5.85911 18.8867 5.8065 18.0975 5.70129 16.5193L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /> </svg>
                        <span> Clear ToDoList </span>
                    </button>

                    <button class="delete" @click.stop="deleteToDoList">
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M9 9L15 15M15 9L9 15M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /> </svg>
                        <span> Delete List </span>
                    </button>
                </div>
            </div>
        </div>
        <div class="countdownContainer" v-if="todo.countdownVisable">
            <div class="countdownBar">
                <div class="progress" :class="countdownClass " :style="{width: countdownPercentage }">
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
            <div class="progress" :class="{ zero: toDoDone === 0 || toDoCount === 0 }" :style="{width: progressPercentage }">
                <span> {{ progressPercentage || "empty"}} </span>
            </div>
        </div>

        <component 
            v-for="(todoItem, index) in todo.todos" 
            :key="index" 
            :is="todoItem.component" 
            v-model="todo.todos[index]" 
            @delete="deleteElement(index)"
            />
    </div>
</template>

<script>
import checkBoxToDo from '@/assets/components/checkBoxToDo.vue';
import barToDo from '@/assets/components/barToDo.vue';
import toDoList from '@/assets/components/toDoList.vue';
import EmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css';

export default {
    name: 'ToDoList',
    components: {
        checkBoxToDo,
        EmojiPicker,
        barToDo,
        toDoList
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
            countdownInerval: null,
            countdownClass: "",
        };
    },
    props: {
        modelValue: Object 
    },
    methods: {
        addCheckBoxToDo() {
            this.todo.todos.push({
                type: 'checkbox',
                component: 'checkBoxToDo',

                text: '',
                done: 0,
                weight: 1,

                created: new Date(),
                modified: new Date(),
            });
        },
        addBarToDo() {
            this.todo.todos.push({
                type: 'bar',
                component: 'barToDo',

                text: '',
                done: 0,
                weight: 1,

                created: new Date(),
                modified: new Date(),
            });
        },
        addToDoList() {
            this.todo.todos.push({
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
                dateStart: Date.now(),
                dateEnd: Date.now()
            });
        },


        clearToDoList() {
            this.todo.todos = [];
        },
        deleteElement(index) {
            this.todo.todos.splice(index, 1);
            this.updateProgress(); 
        },
        deleteToDoList() {
            this.$emit('deleteToDoList');
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
        handleClickOutside(event) {
            if (this.$el && !this.$el.contains(event.target)) {
                this.showMenu = false; 
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
            if(this.todo.progressBinary)
            {
                completedWeight = this.todo.todos
                    .filter(todo => todo.done >= 1)
                    .reduce((sum, todo) => sum + todo.weight, 0);
            }
            else
            {
                completedWeight = this.todo.todos
                        .reduce((sum, todo) => sum + todo.weight * todo.done, 0);
            }
            if(totalWeight === 0)
            {
                this.progressPercentage = "0%";
                this.toDoDone = 0;
                this.toDoCount = 0;
                this.todo.done = 0;
            }
            else
            {
                this.progressPercentage = `${Math.round((completedWeight / totalWeight) * 100)}%`;
                this.toDoDone = this.todo.todos.filter(todo => todo.done).length;
                this.toDoCount = this.todo.todos.length;
                this.todo.done = (completedWeight / totalWeight);
            }
        },

        updateCountdown()
        {
            let now = new Date();
            let start = new Date(this.todo.dateStart);
            let end = new Date(this.todo.dateEnd);

            if(start > end)
            {
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
            



            if( now > end )
            {
                this.countdownPercentage = "100%";
                this.countdownCountdown = "Late";
                this.countdownClass = "late";
            }
            else if( now < start )
            {
                this.countdownPercentage = "100%";
                this.countdownCountdown =  "Early";
                this.countdownClass = "early";
            }
            else
            {
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
        }
    },
    mounted() {
        this.updateProgress();
        this.updateCountdown();
        document.addEventListener('click', this.handleClickOutside);
    
        this.countdownInerval = setInterval(() => {
            this.updateCountdown();
        }, 1000);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);

        clearInterval(this.countdownInerval);
    },
    watch : {
        'todo.todos': {
            handler() {
                this.updateProgress();
            },
            deep: true
        },
        'todo.dateStart': {
            handler() {
                this.updateCountdown();
            },
            deep: true
        },
        'todo.dateEnd': {
            handler() {
                this.updateCountdown();
            },
            deep: true
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
    }


}
</script>

<style scoped>

.toDo {
    width: min-content;
    
    padding: 1rem;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    border: 2px solid #282a30;
}
.toDo > .toDo
{
    width: calc( 100% + 1.5rem);
    margin-left: -0.75rem;
    margin-right: -0.75rem;
}

.toDoName {
    width: 100%;
    font-size: 1rem;
    padding: 0.5em 0.125rem;
    border: none;
    border-bottom: 1px solid #60616a;
    color: #60616a;
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
.hasCountdown > .progressBar {
    border-radius: 0.0625rem 0.0625rem 0.375rem 0.375rem;
}
.progressBar .progress {

    height: 100%;
    background-color: #00aaff;
    border-radius: 0.0625rem 0.125rem 0.125rem 0.0625rem;

    display: flex;
    align-items: center;
    justify-content: center;

    transition: all 0.2s;

    position: relative;
}
.hasCountdown > .progressBar > .progress {
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
.hasProgress > .countdownContainer {
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
.hasProgress > .countdownContainer > .countdownBar {
    border-radius: 0;
}
.countdownBar .progress {

    height: 100%;
    background-color: #00aaff;
    border-radius: 0.0625rem 0.125rem 0.125rem 0.375rem;

    display: flex;
    align-items: center;
    justify-content: center;

    transition: all 0.2s;

    position: relative;
}
.hasProgress > .countdownContainer > .countdownBar > .progress {
    border-radius: 0.0625rem 0.125rem 0.125rem 0.0625rem;
}
.countdownBar .progress span {
    color: #fff;
    font-size: 0.625em;
    font-weight: 900;

    width: max( 100%, 1rem );
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
    color: #fff6;
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

@import url(@/assets/css/menu.css);

</style>
