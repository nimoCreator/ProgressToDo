<template>
  <div class="gridPanel">
    <toDoContainer 
      v-for="(e, index) in todos" 
      :key="index" 
      v-model="todos[index]" 
      @deleteToDoContainer="deleteToDoContainer(index)"
    />
    <div class="buttons">
      Global:
      <button class="add" @click="addTodo">
        ➕
      </button>
      <button class="clear" @click="clearLocalStorage">
        🗑️
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
