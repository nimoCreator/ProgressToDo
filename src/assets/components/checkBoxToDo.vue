<template>
    <label class="checkBoxToDo" :class="{ done: todo.done }">
        <label class="checkbox">
            <input 
                class="inputCheckbox" 
                id="checkbox-{{ todo.text }}" 
                type="checkbox" v-model="todo.done"
                >
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
        </label>
        <input type="text" v-model="todo.text">
        <button class="delete" @click="deleteToDo">
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0975 18.1409 18.8867 17.8 19.485C17.4999 20.0118 17.0472 20.4353 16.5017 20.6997C15.882 21 15.0911 21 13.5093 21H10.4907C8.90891 21 8.11803 21 7.49834 20.6997C6.95276 20.4353 6.50009 20.0118 6.19998 19.485C5.85911 18.8867 5.8065 18.0975 5.70129 16.5193L5 6"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
        </button>
    </label>
</template>

<script>
export default {
    name: 'checkBoxToDo',
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
        }
    }
}
</script>

<style scoped>
.checkBoxToDo {
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 1rem;
    width: 100%;
    flex-grow: 1;
}

.checkBoxToDo input[type="text"] {
    flex-grow: 1;
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

*:hover>.checkBoxToDo input[type="text"] {
    border-bottom: 1px solid #aaa;
    color: #aaa;
}

.checkBoxToDo:hover input[type="text"] {
    border-bottom: 1px solid #fff;
    color: #fff;
}
.checkBoxToDo input[type="text"]:hover {
    padding-left: 0.25rem;
}

.checkBoxToDo input[type="text"]:focus {
    padding-left: 0.5rem;
}

.done input[type="text"] {
    text-decoration: line-through;
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