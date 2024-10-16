<template>
  <div class="gridPanel">
    <toDoContainer v-for="(e, index) in todos" :key="index" v-model="todos[index]"
      @deleteToDoContainer="deleteToDoContainer(index)" />
    <div class="buttons">
      Global:
      <button class="add" @click="addTodo">
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 8V16M8 12H16M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <button class="clear" @click="clearLocalStorage">
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0975 18.1409 18.8867 17.8 19.485C17.4999 20.0118 17.0472 20.4353 16.5017 20.6997C15.882 21 15.0911 21 13.5093 21H10.4907C8.90891 21 8.11803 21 7.49834 20.6997C6.95276 20.4353 6.50009 20.0118 6.19998 19.485C5.85911 18.8867 5.8065 18.0975 5.70129 16.5193L5 6"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import toDoContainer from '@/assets/components/toDoContainer.vue'

export default {
  name: 'App',
  components: {
    toDoContainer
  },
  data() {
    return {
      todos: []
    }
  },
  methods: {
    addTodo() {
      this.todos.push({
        created: new Date(),
        emoji: '📝',
        name: '',
        todos: [],
        done: false,
        progressVisable: true
      });
      this.updateLocalStorage();
    },
    updateLocalStorage() {
      localStorage.setItem('todos', JSON.stringify(this.todos));
    },
    loadLocalStorage() {
      this.todos = JSON.parse(localStorage.getItem('todos')) || [];
    },
    deleteToDoContainer(index) {
      this.todos.splice(index, 1); // Remove the container from the list
      this.updateLocalStorage();
    },
    clearLocalStorage() {
      localStorage.removeItem('todos');
      this.todos = [];
    }
  },
  created() {
    this.loadLocalStorage();
  },
  watch: {
    todos: {
      handler() {
        this.updateLocalStorage();
      },
      deep: true
    }
  }
}
</script>


<style>
@import url("@/assets/css/base.css");
</style>
