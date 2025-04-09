<template>
  <div id="appWrapper">
    <!-- <div class="cloud">
      cloud
    </div> -->
    <div id="menu">
      <button>
        <CloudIcon />
        <span>cloud</span>
      </button>
      <button>
        <ArchiveStorageIcon />
        <span>archive</span>
      </button>
    </div>
    <div id="gridPanel">
      <toDoList
        v-for="(e, index) in todos"
        :key="index"
        v-model="todos[index]"
        @deleteToDo="deleteToDo(index)"
      />
      <button @click="addTodo" class="addTodo">
        <plusIcon />
      </button>
    </div>
    <div class="mainButtons">
      <button @click="scrollTop" class="scrollTop">
        <ArrowUpIcon />
      </button>
    </div>
  </div>
</template>

<script>
import toDoList from "@/assets/components/toDoList.vue";
import plusIcon from "@/assets/svg/PlusSymbolIcon.vue";
import ArrowUpIcon from "@/assets/svg/ArrowUpIcon.vue";
import CloudIcon from "@/assets/svg/CloudIcon.vue";
import ArchiveStorageIcon from "./assets/svg/ArchiveStorageIcon.vue";

export default {
  name: "App",
  components: {
    toDoList,
    plusIcon,
    ArrowUpIcon,
    CloudIcon,
    ArchiveStorageIcon,
  },
  data() {
    return {
      todos: [],
    };
  },
  methods: {
    addTodo() {
      this.todos.push({
        type: "list",
        created: new Date(),
        modified: new Date(),
        emoji: "📝",
        name: "",
        todos: [],
        done: 0,
        weight: 1,
        progressBinary: false,
        progressVisable: false,
        countdownVisable: false,
        dateStart: Date.now(),
        dateEnd: Date.now(),

        cloudListName: "",
        cloudLists: [],
      });
      this.updateLocalStorage();
    },
    updateLocalStorage() {
      localStorage.setItem("todos", JSON.stringify(this.todos));
    },
    loadLocalStorage() {
      this.todos = JSON.parse(localStorage.getItem("todos")) || [];
    },
    deleteToDo(index) {
      this.todos.splice(index, 1);
      this.updateLocalStorage();
    },
    clearLocalStorage() {
      if (confirm("Are you sure you want to delete all your todos?")) {
        localStorage.removeItem("todos");
        this.todos = [];
      }
    },
    scrollTop() {
      document.getElementById("gridPanel").scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
  },
  created() {
    this.loadLocalStorage();
  },
  watch: {
    todos: {
      handler() {
        this.updateLocalStorage();
      },
      deep: true,
    },
  },
};
</script>


<style>
@import url("@/assets/css/base.css");

.mainButtons {
  position: fixed;
  bottom: 1rem;
  right: 1rem;

  display: flex;
  gap: 1rem;
  justify-content: stretch;
  align-items: center;

  width: min-content;
  padding: 0.5rem;
  margin-left: auto;

  color: #7c8187;
  background-color: #1e1f24;
  border: 1px solid #3c3e43;
  border-radius: 0.5rem;
}
.cloud {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: flex-start;
  align-items: stretch;

  width: min-content;
  padding: 0.5rem;

  color: #7c8187;
  background-color: #1e1f24;
  border: 1px solid #3c3e43;
  border-radius: 0.5rem;

  position: absolute;
  top: 1rem;
  left: 1rem;
}
.cloud > * {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
  align-items: stretch;
}
.cloud input {
  padding: 0.5rem;
  color: #7c8187;
  background-color: transparent;
  border: 1px solid #3c3e43;
  border-radius: 0.5rem;
}

.addTodo {
  display: flex;
  justify-content: center;
  align-items: center;

  min-width: 25rem;

  padding: 3rem;

  color: #3c3e43;
  background: none !important;
  border: 0 transparent solid;
  outline: 0.125rem dashed #3c3e43;
  border-radius: 0.5rem;

  cursor: pointer;
  user-select: none;

  transition: 0.2s;
  box-shadow: none !important;
}
.addTodo:hover {
  background: none;
  color: #7c8187;
  
  outline: 0.125rem dashed #7c8187;

  transform: none;
}

#menu {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;

  color: #7c8187;
  background-color: #1e1f24;
  border: 1px solid #3c3e43;
  border-radius: 0.5rem;

  position: absolute;
  top: 1rem;
  right: 1rem;
  left: 1rem;

  height: 4rem;

  z-index: 5;
}
</style>