<template>
    <div @click.stop="toggleDone" class="checkBoxToDo" :class="{ done: todo.done }">
        <div @click.stop="toggleDone" class="checkbox">
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
        <div @click.stop class="inputWrapper">
            <input @click.stop type="text" v-model="todo.text">
        </div>
        <div class="menu" @click.stop="toggleMenu">
            <span> ... </span>
            <div class="buttons" :class="{ show: showMenu }">

                <div class="divider">
                    <span>modify</span>
                    <div class="horizontalLine"></div>
                </div>

                <div class="honoraryButton" @click.stop>
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 17V16.8498C2 16.5333 2 16.3751 2.02421 16.2209C2.0457 16.084 2.08136 15.9497 2.13061 15.8202C2.18609 15.6743 2.2646 15.5369 2.42162 15.2622L6 9M2 17C2 19.2091 3.79086 21 6 21C8.20914 21 10 19.2091 10 17M2 17V16.8C2 16.52 2 16.38 2.0545 16.273C2.10243 16.1789 2.17892 16.1024 2.273 16.0545C2.37996 16 2.51997 16 2.8 16H9.2C9.48003 16 9.62004 16 9.727 16.0545C9.82108 16.1024 9.89757 16.1789 9.9455 16.273C10 16.38 10 16.52 10 16.8V17M6 9L9.57838 15.2622C9.7354 15.5369 9.81391 15.6743 9.86939 15.8202C9.91864 15.9497 9.9543 16.084 9.97579 16.2209C10 16.3751 10 16.5333 10 16.8498V17M6 9L18 7M14 15V14.8498C14 14.5333 14 14.3751 14.0242 14.2209C14.0457 14.084 14.0814 13.9497 14.1306 13.8202C14.1861 13.6743 14.2646 13.5369 14.4216 13.2622L18 7M14 15C14 17.2091 15.7909 19 18 19C20.2091 19 22 17.2091 22 15M14 15V14.8C14 14.52 14 14.38 14.0545 14.273C14.1024 14.1789 14.1789 14.1024 14.273 14.0545C14.38 14 14.52 14 14.8 14H21.2C21.48 14 21.62 14 21.727 14.0545C21.8211 14.1024 21.8976 14.1789 21.9455 14.273C22 14.38 22 14.52 22 14.8V15M18 7L21.5784 13.2622C21.7354 13.5369 21.8139 13.6743 21.8694 13.8202C21.9186 13.9497 21.9543 14.084 21.9758 14.2209C22 14.3751 22 14.5333 22 14.8498V15M12 3V8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    <input @click.stop type="number" v-model="todo.weight"/>
                </div>

                <div class="divider">
                    <span>delete</span>
                    <div class="horizontalLine"></div>
                </div>

                <button class="delete" @click.stop="deleteToDo">
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M9 9L15 15M15 9L9 15M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /> </svg>
                    <span> Delete ToDo </span>
                </button>

            </div>
        </div>
    </div>
</template>

<script scoped>
export default {
    name: 'checkBoxToDo',
    data() {
        return {
            showMenu: false
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
        deleteToDo() {
            this.$emit('deleteToDo', this.todo);
        },
        toggleMenu() {
            this.showMenu = !this.showMenu;
        },
        handleClickOutside(event) {
            if (!this.$el.contains(event.target)) {
                this.showMenu = false;
            }
        },
        toggleDone() {
            this.todo.done = !this.todo.done;
        }
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
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
    color: #60616a;
    background: none;
    outline: transparent;
    transition: all 0.3s;
}

*:hover>.checkBoxToDo input[type="text"] {
    border-bottom: 1px solid #aaa8;
    color: #aaa;   
}

.checkBoxToDo:hover input[type="text"] {
    border-bottom: 1px solid #fff8;
    color: #fff;
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
    outline: 0.125rem solid #00aaff88;
    background: #00aaff88;
}
.checkBoxToDo.done:hover .checkboxField {
    outline: 0.125rem solid #00aaffaa;
    background: #00aaffaa;
}
.checkBoxToDo .checkbox:hover .checkboxField,
.checkBoxToDo.done .checkbox:hover .checkboxField {
    outline: 0.125rem solid #00aaff !important;
    background: #00aaff !important;
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

</style>