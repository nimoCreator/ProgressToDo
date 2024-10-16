<template>
    <div class="toDo">
        <div class="header">
            <div class="emoji" @click.stop="toggleEmojiPicker">
                {{ todo.emoji || '📝' }}
            </div>
            <emoji-picker 
                v-if="showEmojiPicker"
                @select="selectEmoji" 
                theme="auto"
            />
            <input type="text" class="toDoName" v-model="todo.name">
            <div class="menu" @click="toggleMenu">
                <span>
                    ...
                </span>
                <div class="buttons" :class="{ show: showMenu }">
                    <div class="divider">
                        <span>add</span>
                        <div class="horizontalLine"></div>
                    </div>

                    <button class="add" @click="addToDo">
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M9 11L12 14L22 4M16 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V12"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <span> Add CheckBox Todo </span>
                    </button>

                    <div class="divider">
                        <span>modify</span>
                        <div class="horizontalLine"></div>
                    </div>

                    <button class="toggleProgress" @click="toggleProgress">
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 5L5 19M9 7C9 8.10457 8.10457 9 7 9C5.89543 9 5 8.10457 5 7C5 5.89543 5.89543 5 7 5C8.10457 5 9 5.89543 9 7ZM19 17C19 18.1046 18.1046 19 17 19C15.8954 19 15 18.1046 15 17C15 15.8954 15.8954 15 17 15C18.1046 15 19 15.8954 19 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span> Toggle Progress </span>
                    </button>
                    <button class="toggleCountdown" @click="toggleCountdown">
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 3C6.47715 3 2 7.47715 2 13C2 18.5228 6.47715 23 12 23C17.5228 23 22 18.5228 22 13C22 7.47715 17.5228 3 12 3Z"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            <path
                                d="M12 8V12L15 15"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <span> Toggle Countdown </span>
                    </button>

                    <div class="divider">
                        <span>delete</span>
                        <div class="horizontalLine"></div>
                    </div>

                    <button class="clear" @click="deleteToDos">
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0975 18.1409 18.8867 17.8 19.485C17.4999 20.0118 17.0472 20.4353 16.5017 20.6997C15.882 21 15.0911 21 13.5093 21H10.4907C8.90891 21 8.11803 21 7.49834 20.6997C6.95276 20.4353 6.50009 20.0118 6.19998 19.485C5.85911 18.8867 5.8065 18.0975 5.70129 16.5193L5 6"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <span> Clear All </span>
                    </button>

                    <button class="delete" @click="deleteToDoContainer">
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M9 9L15 15M15 9L9 15M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <span> Delete Container </span>
                    </button>
                </div>
            </div>
        </div>
        <div class="countdownBar" v-if="this.todo.countdownVisable">
            <div class="progress" :class="{ zero: toDoDone === 0 }" :style="{width: progressPercentage }">
                <span class="countdownCountdown"> {{ countdownCountdown }} </span>
                <span class="countdownPercentage"> {{ countdownPercentage }} </span>
            </div>
            
        </div>
        <div class="progressBar" v-if="this.todo.progressVisable">
            <div class="progress" :class="{ zero: toDoDone === 0 }" :style="{width: progressPercentage }">
                <span> {{ progressPercentage }} </span>
            </div>
        </div>

        <checkBoxToDo v-for="(todoItem, index) in todo.todos" :key="index" v-model="todo.todos[index]" />
    </div>
</template>

<script>
import checkBoxToDo from '@/assets/components/checkBoxToDo.vue';
import EmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css';

export default {
    name: 'toDoContainer',
    components: {
        checkBoxToDo,
        EmojiPicker 
    },
    data() {
        return {
            showMenu: false,
            showEmojiPicker: false,
            toDoCount: 0,
            toDoDone: 0,
            progressPercentage: "0%"
        }
    },
    props: {
        modelValue: Object 
    },
    computed: {
        todo: {
            get() {
                return this.modelValue;  
            },
            set(value) {
                this.$emit('update:modelValue', value); 
            }
        }
    },
    methods: {
        addToDo() {
            this.todo.todos.push({
                text: '',
                done: false
            });
        },

        deleteToDos() {
            this.todo.todos = [];
        },

        deleteToDoContainer() {
            this.$emit('deleteToDoContainer');
        },
        toggleProgress() {
            this.todo.progressVisable = !this.todo.progressVisable;
        },
        toggleCountdown() {
            this.todo.countdownVisable = !this.todo.countdownVisable;
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
            this.toDoDone = this.todo.todos.filter(todo => todo.done).length;
            this.toDoCount = this.todo.todos.length;
            this.progressPercentage = `${Math.round(this.toDoDone / this.toDoCount * 100)}%`;
        }
    },
    mounted() {
        this.updateProgress();
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    },
    watch : {
        'todo.todos': {
            handler() {
                this.updateProgress();
            },
            deep: true
        }
    }


}
</script>

<style scoped>

.toDo {
    width: fit-content;
    
    padding: 1em;
    border-radius: 1em;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.toDoName {
    width: 100%;
    font-size: 1em;
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

.menu {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.menu>span {
    padding: 0.5rem;

    background-color: #282a30;
    color: #52565a;
    border: 1px solid #3c3e43;
    border-radius: 0.5rem;

    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;

    width: 2rem;
    height: 2rem;

    cursor: pointer;
    user-select: none;

    transition: 0.2s;
}

.menu>span:hover {
    color: #fff;
    background-color: #5e5e5e;
    transform: translateY(-0.125rem);
    
    transition: 0.1s;
}

.menu>span:active {
    color: #fff;
    background-color: #cacaca;
    transform: translateY(0.0625rem);

    transition: 0.05s;
}

.buttons {
    position: absolute;
    top: 0;
    right: calc( 100% + 0.5rem );

    display: flex;
    flex-direction: column;
    justify-content: stretch;
    gap: 0.5rem;

    padding: 0.25rem;
    background-color: #1e1f24;
    border: 2px solid #282a30;
    border-radius: 0.5rem;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);

    transition: all 0.1s;
    transform: translateY(-0.5rem);

    opacity: 0;
    pointer-events: none;

    z-index: 2;
}

.buttons.show {
    opacity: 1;
    pointer-events: all;
    transform: translateY(0rem);
}
.buttons > .divider {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: stretch;
    gap: 0.25rem;
    width: 100%;
}
.buttons > .divider > span {
    color: #52565a;
    font-size: 0.625rem;
    user-select: none;
    transition: 0.2s;
}
.buttons > .divider > .horizontalLine {
    flex-grow: 1;
    width: 100%;
    height: 0.0625rem;
    background-color: #3c3e43;
}

.buttons>button {
    padding: 0.25rem 0.5rem 0.25rem 0.25rem;
    border: 1px solid #3c3e43;
    border-radius: 0.5rem;
    cursor: pointer;
    user-select: none;
    transition: 0.2s;

    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-grow: 1;
    width: 100%;
}

.buttons>button>svg {
    width: 1.5rem;
    height: 1.5rem;
}

.buttons>button>span {
    flex-grow: 1;
    text-align: left;
    white-space: nowrap;
}



.progressBar {
    width: 100%;
    height: 0.75rem;
    background-color: #282a30;
    border-radius: 0.625rem;

    display: flex;
    align-items: center;
    justify-content: flex-start;
}
.progressBar .progress {

    height: 100%;
    background-color: #00aaff;
    border-radius: 0.5rem;

    display: flex;
    align-items: center;
    justify-content: center;

    transition: all 0.2s;

    position: relative;
}
.progressBar .progress span {
    color: #fff;
    font-size: 0.625em;
    font-weight: 900;

    position: absolute;
}
.progressBar .progress.zero {
    width: 100% !important;
    background-color: #282a30;
}
.progressBar .progress.zero span {
    width: 100% !important;
    text-align: center;
}
</style>
