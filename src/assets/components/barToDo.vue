<template>
    <label class="barToDo" :class="{ done: todo.done }">
        <input type="range" style="flex-grow: 1; width: 100%;" v-model="todo.done" min="0" max="1" step="0.01">
        <div class="menu" @click="toggleMenu">
            <span> ... </span>
            <div class="buttons" :class="{ show: showMenu }">
                <div class="divider">
                    <span>modify</span>
                    <div class="horizontalLine"></div>
                </div>
                <div class="honoraryButton" @click.stop>
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 7H5.2C4.0799 7 3.51984 7 3.09202 7.21799C2.71569 7.40973 2.40973 7.71569 2.21799 8.09202C2 8.51984 2 9.0799 2 10.2V13.8C2 14.9201 2 15.4802 2.21799 15.908C2.40973 16.2843 2.71569 16.5903 3.09202 16.782C3.51984 17 4.07989 17 5.2 17H13M17 7H18.8C19.9201 7 20.4802 7 20.908 7.21799C21.2843 7.40973 21.5903 7.71569 21.782 8.09202C22 8.51984 22 9.0799 22 10.2V13.8C22 14.9201 22 15.4802 21.782 15.908C21.5903 16.2843 21.2843 16.5903 20.908 16.782C20.4802 17 19.9201 17 18.8 17H17M17 21L17 3M19.5 3.00001L14.5 3M19.5 21L14.5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    <input 
                    @click.stop 
                    type="text" 
                    v-model="todo.text" 
                    :style="{ width: textWidth + 'ch' }" 
                    @input="adjustWidth"/>
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
    </label>
</template>

<script>
export default {
    name: 'barToDo',
    data() {
        return {
            showMenu: false,
            textWidth: 1,
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
            console.log('deleteToDo', this.todo);
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
        adjustWidth(event) {
            this.textWidth = event.target.value.length || 1;
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

    position: relative;
}
input {
    text-overflow: ellipsis;
    flex-grow: 1;
}


</style>