<template>
  <div id="appWrapper">
    <div id="menu" class="menu" @click="toggleMenu">
      <span> ... </span>
      <div class="buttons" :class="{ show: showMenu }" @click.stop>

        <div class="divider">
          <span>highlighted</span>
          <div class="horizontalLine"></div>
        </div>

        <button class="star" @click.stop="openStarModal">
          <StarIconFilled />
          <span> Show Starred </span>
        </button>

        <button class="urgent" @click.stop="openUrgentModal">
          <FireIconFilled />
          <span> Show Urgent </span>
        </button>

        <button class="archived" @click.stop="toggleShowArchived" :class="{ fill: showArchived }">
          <ArchiveIconFilled v-if="showArchived" />
          <ArchiveIcon v-else />
          <span> {{ showArchived ? "Hide" : "Show" }} Archived </span>
        </button>

        <div class="divider">
          <span>data</span>
          <div class="horizontalLine"></div>
        </div>

        <button @click.stop="copyAll">
          <CopyIcon />
          <span> Copy all to Clipboard</span>
        </button>

        <button @click.stop="pasteAll">
          <PasteIcon />
          <span> Paste all from Clipboard </span>
        </button>

        <button class="clear" @click.stop="clearLocalStorage">
          <TrashcanIcon />
          <span> Clear ToDoList </span>
        </button>

        <div class="divider">
          <span>info</span>
          <div class="horizontalLine"></div>
        </div>

        <button class="nimo" @click.stop="openNimoModal">
          <nimoIcon />
          <span> About app, and author </span>
        </button>
      </div>
    </div>

    <div id="gridPanel">
      <toDoList v-for="(todo, index) in visibleTodos" :key="todo.id" v-model="visibleTodos[index]"
        @deleteToDo="deleteToDo(index)" />
        <div class="emptyState" v-if="visibleTodos.length === 0">
          <p class="inlineTooltipBig">No todos found</p>
          <p class="inlineTooltip">Click the plus icon below to add a new todo!</p>
          <div class="flexRowOr"><hr/>or<hr/> </div>
          <button>Click here to load the Demo!</button>
        </div>
      <button @click="addTodo" class="addTodo">
        <plusIcon />
      </button>
    </div>

    <div class="mainButtons">
      <button @click="scrollTop" class="scrollTop">
        <ArrowUpIcon />
      </button>
    </div>

    <div id="modals" v-if="showModals" @click="closeModals">

      <div class="modalContent" @click.stop>
        <div class="nimoModal" v-if="showNimoModal">
          <div class="modalHeader">
            <nimoIcon />
            <span>About</span>
            <div class="horizontalLine"></div>
            <button class="closeModal" @click="closeModals">×</button>
          </div>
          <div class="modalBody">
            <div id="logo">
              <div class="signet">
                <Favicon />
              </div>
              <span class="title">ProgressTODO</span>
              <span class="version">{{ appVersion }} | {{ releaseDate }}</span>
              <span class="author">by:&nbsp;
                <a href="https://nimoweb.ddns.net">nimo</a>
              </span>
            </div>

            <p class="appDescription">
              <span class="about">ProgressTODO is a new approach to task management, designed to help you stay organized
                and productive in a complex network of independent and dependent tasks.</span>
              <span class="demo">Load a demo to get inspired how to use the app!</span>
              <button @click="LoadDemo" class="loadDemo">
                <FolderIcon />
                <span>Load Demo</span>
              </button>
            </p>

            <div class="nimoInfoCard">
              <div class="nimoAvatar">
                <img src="./assets/img/nimo-background-animated.gif" alt="nimo" />
              </div>
              <div class="nimoName">Sebastian <span style="color: #00aaff;">nimo</span> Legierski</div>

              <a href="https://nimoweb.ddns.net" class="nimoWebLink">
                <GlobeIcon />
                Website
              </a>
              <a href="https://nimoweb.ddns.net/contact" class="nimoContact">
                <EnvelopeIcon />
                Contact
              </a>
              <div class="nimoBio">
                HI, im nimo!<br> Check out some of my other projects, and feel free to get in touch with me via mail, or
                message me on any of my social medias!
              </div>
            </div>
          </div>
        </div>

        <div class="urgentModal" v-if="showUrgentModal">
          <div class="modalHeader">
            <FireIconFilled />
            <span>urgent</span>
            <div class="horizontalLine"></div>
            <button class="closeModal" @click="closeModals">×</button>
          </div>
          <div class="modalBody" v-if="flattenedUrgentTodos.length > 0">
            <div v-for="item in flattenedUrgentTodos" :key="item.id" class="modalItem urgent"
              @click="scrollToItem(item.id)">
              <div class="itemContent">
                <strong v-if="item.text">{{ item.text }}</strong>
                <strong v-else>{{ item.name || 'Untitled Task' }}</strong>
                <div class="itemPath" v-if="item.parentName">
                  <span>In: {{ item.parentName }}</span>
                </div>
              </div>
              <button class="goToItem">Go to</button>
            </div>
          </div>
          <div class="emptyState" v-else>
            <p>No urgent tasks found</p>
          </div>
        </div>

        <div class="starModal" v-if="showStarModal">
          <div class="modalHeader">
            <StarIconFilled />
            <span>starred</span>
            <div class="horizontalLine"></div>
            <button class="closeModal" @click="closeModals">×</button>
          </div>
          <div class="modalBody" v-if="flattenedStarredTodos.length > 0">
            <div v-for="item in flattenedStarredTodos" :key="item.id" class="modalItem starred"
              @click="scrollToItem(item.id)">
              <div class="itemContent">
                <strong v-if="item.text">{{ item.text }}</strong>
                <strong v-else>{{ item.name || 'Untitled Task' }}</strong>
                <div class="itemPath" v-if="item.parentName">
                  <span>In: {{ item.parentName }}</span>
                </div>
              </div>
              <button class="goToItem">Go to</button>
            </div>
          </div>
          <div class="emptyState" v-else>
            <p>No starred tasks found</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import toDoList from "@/assets/components/toDoList.vue";
import plusIcon from "@/assets/svg/PlusSymbolIcon.vue";
import ArrowUpIcon from "@/assets/svg/ArrowUpIcon.vue";
import CloudIcon from "@/assets/svg/CloudIcon.vue";
import CloudDownloadIcon from "./assets/svg/CloudDownloadIcon.vue";
import CloudUploadIcon from "./assets/svg/CloudUploadIcon.vue";
import ArchiveStorageIcon from "./assets/svg/ArchiveStorageIcon.vue";
import Favicon from './assets/svg/Favicon.vue';

import TrashcanIcon from "@/assets/svg/TrashcanIcon.vue";
import StarIconFilled from "./assets/svg/StarIconFilled.vue";
import FireIconFilled from "./assets/svg/FireIconFilled.vue";
import CopyIcon from "@/assets/svg/CopyIcon.vue";
import PasteIcon from "@/assets/svg/PasteIcon.vue";
import nimoIcon from "@/assets/svg/nimoIcon.vue";

import { appVersion, releaseDate } from "./assets/js/consts";
import GlobeIcon from "./assets/svg/GlobeIcon.vue";
import EnvelopeIcon from "./assets/svg/envelopeIcon.vue";
import FolderIcon from "./assets/svg/folderIcon.vue";

import ArchiveIconFilled from "@/assets/svg/ArchiveIconFilled.vue";
import ArchiveIcon from "@/assets/svg/ArchiveIcon.vue";

import { showArchived } from '@/assets/js/globalStorage.js';

export default {
  name: "App",
  components: {
    toDoList,
    plusIcon,
    ArrowUpIcon,
    CloudIcon,
    CloudDownloadIcon,
    CloudUploadIcon,
    ArchiveStorageIcon,
    Favicon,
    TrashcanIcon,
    StarIconFilled,
    FireIconFilled,
    CopyIcon,
    PasteIcon,
    nimoIcon,
    GlobeIcon,
    EnvelopeIcon,
    FolderIcon,
    ArchiveIconFilled,
    ArchiveIcon,
  },
  setup() {
    return { showArchived };
  },
  data() {
    return {
      todos: [],
      showMenu: false,
      showNimoModal: false,
      showStarModal: false,
      showUrgentModal: false,

      appVersion: appVersion,
      releaseDate: releaseDate,
    };
  },
  methods: {
    addTodo() {
      this.todos.push({
        id: this.generateUniqueId(),

        type: 'list',
        component: 'toDoList',

        created: new Date().toISOString().slice(0, 16),
        modified: new Date().toISOString().slice(0, 16),
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
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    generateUniqueId() {
      return Math.random().toString(36).substr(2, 9);
    },
    copyAll() {
      const todosString = JSON.stringify(this.todos, null, 2);
      navigator.clipboard.writeText(todosString).then(() => {
        alert("Todos copied to clipboard!");
      });
    },
    pasteAll() {
      navigator.clipboard.readText().then((text) => {
        try {
          const parsedTodos = JSON.parse(text);
          this.todos = parsedTodos;
          this.updateLocalStorage();
          alert("Todos pasted from clipboard!");
        } catch (error) {
          alert("Failed to parse todos from clipboard.");
        }
      });
    },
    toggleShowArchived() {
      showArchived.value = !showArchived.value;
    },
    closeModals() {
      this.showNimoModal = false;
      this.showStarModal = false;
      this.showUrgentModal = false;
    },
    openStarModal() {
      this.closeModals();
      this.showStarModal = !this.showStarModal;
    },
    openUrgentModal() {
      this.closeModals();
      this.showUrgentModal = !this.showUrgentModal;
    },
    openNimoModal() {
      this.closeModals();
      this.showNimoModal = !this.showNimoModal;
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.showMenu = false;
        this.showNimoModal = false;
        this.showStarModal = false;
        this.showUrgentModal = false;
      }
    },
    scrollToItem(id) {
      this.$nextTick(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-item');
          setTimeout(() => {
            element.classList.remove('highlight-item');
          }, 2000);
          this.closeModals();
        }
      });
    },
    flattenTodos(todos, parent = null) {
      let flattened = [];
      todos.forEach(todo => {
        const todoWithParent = { ...todo };
        if (parent && parent.name) {
          todoWithParent.parentName = parent.name;
        }

        flattened.push(todoWithParent);

        if (todo.todos && todo.todos.length) {
          flattened = flattened.concat(this.flattenTodos(todo.todos, todo));
        }
      });
      return flattened;
    },
    TodayPlus(days) {
      const today = new Date();
      const targetDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
      return targetDate.toISOString().slice(0, 16);
    },
    LoadDemo() {
      this.todos = [
        {
          "id": "jx4rmx1uo",
          "type": "list",
          "component": "toDoList",
          "created": this.TodayPlus(0),
          "modified": this.TodayPlus(0),
          "emoji": "🛍️",
          "name": "Groceries",
          "todos": [
            {
              "id": "fqqfu0nfu",
              "type": "checkbox",
              "component": "checkBoxToDo",
              "text": "Milk",
              "done": true,
              "weight": 1,
              "dateStart": this.TodayPlus(-1),
              "dateEnd": this.TodayPlus(2),
              "star": false,
              "urgent": false,
              "color": null
            },
            {
              "id": "2b5o558xy",
              "type": "checkbox",
              "component": "checkBoxToDo",
              "text": "Bread",
              "done": 0,
              "weight": 1,
              "dateStart": this.TodayPlus(-1),
              "dateEnd": this.TodayPlus(2),
              "star": false,
              "urgent": false,
              "color": null
            },
            {
              "id": "emjq36o23",
              "type": "checkbox",
              "component": "checkBoxToDo",
              "text": "Eggs",
              "done": 0,
              "weight": 1,
              "dateStart": this.TodayPlus(-1),
              "dateEnd": this.TodayPlus(2),
              "star": false,
              "urgent": false,
              "color": null
            },
            {
              "id": "32zyxpbtp",
              "type": "checkbox",
              "component": "checkBoxToDo",
              "text": "Butter",
              "done": true,
              "weight": 1,
              "dateStart": this.TodayPlus(-1),
              "dateEnd": this.TodayPlus(2),
              "star": false,
              "urgent": false,
              "color": null
            },
            {
              "id": "tt2522idy",
              "type": "checkbox",
              "component": "checkBoxToDo",
              "text": "Salt",
              "done": false,
              "weight": 1,
              "dateStart": this.TodayPlus(-1),
              "dateEnd": this.TodayPlus(2),
              "star": false,
              "urgent": true,
              "color": null
            },
            {
              "id": "uebbr79ul",
              "type": "checkbox",
              "component": "checkBoxToDo",
              "text": "Sugar",
              "done": true,
              "weight": 1,
              "dateStart": this.TodayPlus(-1),
              "dateEnd": this.TodayPlus(2),
              "star": false,
              "urgent": false,
              "archived": true,
              "color": null
            }
          ],
          "done": 0.4,
          "weight": 1,
          "progressBinary": false,
          "progressVisable": false,
          "countdownVisable": false,
          "dateStart": this.TodayPlus(-1),
          "dateEnd": this.TodayPlus(2),
          "star": false,
          "urgent": false,
          "color": null
        },
        {
          "id": "nwmyawhg5",
          "type": "list",
          "component": "toDoList",
          "created": this.TodayPlus(0),
          "modified": this.TodayPlus(0),
          "emoji": "🏫",
          "name": "Homework",
          "todos": [
            {
              "id": "uz9icc7m5",
              "type": "list",
              "component": "toDoList",
              "created": this.TodayPlus(0),
              "modified": this.TodayPlus(0),
              "emoji": "📚",
              "name": "Math",
              "todos": [
                {
                  "id": "bzesflecp",
                  "type": "bar",
                  "component": "barToDo",
                  "text": "",
                  "done": "0.64",
                  "weight": 1,
                  "dateStart": this.TodayPlus(-1),
                  "dateEnd": this.TodayPlus(2),
                  "star": false,
                  "urgent": false,
                  "color": null
                }
              ],
              "done": 0.64,
              "weight": 1,
              "progressBinary": false,
              "progressVisable": true,
              "countdownVisable": true,
              "dateStart": this.TodayPlus(-1),
              "dateEnd": this.TodayPlus(2),
              "star": false,
              "urgent": false,
              "archived": false,
              "color": "#adff00"
            },
            {
              "id": "8sp6vf262",
              "type": "list",
              "component": "toDoList",
              "created": this.TodayPlus(0),
              "modified": this.TodayPlus(0),
              "emoji": "⌛",
              "name": "History Project",
              "todos": [
                {
                  "id": "jopzra2a1",
                  "type": "checkbox",
                  "component": "checkBoxToDo",
                  "text": "List all important dates",
                  "done": true,
                  "weight": 1,
                  "dateStart": this.TodayPlus(-1),
                  "dateEnd": this.TodayPlus(2),
                  "star": false,
                  "urgent": false,
                  "color": null
                },
                {
                  "id": "p19mp9n5b",
                  "type": "checkbox",
                  "component": "checkBoxToDo",
                  "text": "Research the Kings archeology tree",
                  "done": 0,
                  "weight": 1,
                  "dateStart": this.TodayPlus(-1),
                  "dateEnd": this.TodayPlus(2),
                  "star": false,
                  "urgent": false,
                  "color": null
                },
                {
                  "id": "xo7gfw9yw",
                  "type": "list",
                  "component": "toDoList",
                  "created": this.TodayPlus(0),
                  "modified": this.TodayPlus(0),
                  "emoji": "🎥",
                  "name": "Presentation",
                  "todos": [
                    {
                      "id": "rh1tg37t8",
                      "type": "checkbox",
                      "component": "checkBoxToDo",
                      "text": "Add all informations to the slides",
                      "done": true,
                      "weight": 1,
                      "dateStart": this.TodayPlus(-1),
                      "dateEnd": this.TodayPlus(2),
                      "star": false,
                      "urgent": false,
                      "color": null
                    },
                    {
                      "id": "uz21wc9ai",
                      "type": "checkbox",
                      "component": "checkBoxToDo",
                      "text": "Add images",
                      "done": false,
                      "weight": 1,
                      "dateStart": this.TodayPlus(-1),
                      "dateEnd": this.TodayPlus(2),
                      "star": false,
                      "urgent": false,
                      "color": null
                    },
                    {
                      "id": "0bjj3f23j",
                      "type": "checkbox",
                      "component": "checkBoxToDo",
                      "text": "Add welcome and thank you slides",
                      "done": true,
                      "weight": 1,
                      "dateStart": this.TodayPlus(-1),
                      "dateEnd": this.TodayPlus(2),
                      "star": false,
                      "urgent": false,
                      "color": null
                    },
                    {
                      "id": "4fvefvl43",
                      "type": "checkbox",
                      "component": "checkBoxToDo",
                      "text": "Add transitions",
                      "done": false,
                      "weight": 1,
                      "dateStart": this.TodayPlus(-1),
                      "dateEnd": this.TodayPlus(2),
                      "star": false,
                      "urgent": false,
                      "color": null
                    }
                  ],
                  "done": 0.5,
                  "weight": 1,
                  "progressBinary": false,
                  "progressVisable": true,
                  "countdownVisable": false,
                  "dateStart": this.TodayPlus(-1),
                  "dateEnd": this.TodayPlus(2),
                  "star": false,
                  "urgent": false,
                  "archived": false,
                  "color": null
                },
                {
                  "id": "8pxei6sv6",
                  "type": "checkbox",
                  "component": "checkBoxToDo",
                  "text": "Get everything ready on USB drive",
                  "done": false,
                  "weight": 1,
                  "dateStart": this.TodayPlus(-1),
                  "dateEnd": this.TodayPlus(2),
                  "star": false,
                  "urgent": false,
                  "color": null
                }
              ],
              "done": 0.25,
              "weight": 1,
              "progressBinary": true,
              "progressVisable": true,
              "countdownVisable": true,
              "dateStart": this.TodayPlus(-1),
              "dateEnd": this.TodayPlus(2),
              "star": true,
              "urgent": false,
              "archived": false,
              "color": "#ffb400"
            },
            {
              "id": "s01qu1c5r",
              "type": "checkbox",
              "component": "checkBoxToDo",
              "text": "Return books to school Library",
              "done": true,
              "weight": 1,
              "dateStart": this.TodayPlus(-1),
              "dateEnd": this.TodayPlus(2),
              "star": false,
              "urgent": false,
              "color": null
            }
          ],
          "done": 0.63,
          "weight": 1,
          "progressBinary": false,
          "progressVisable": false,
          "countdownVisable": false,
          "dateStart": this.TodayPlus(-1),
          "dateEnd": this.TodayPlus(2),
          "star": false,
          "urgent": false,
          "color": null
        },
        {
          "id": "axs838ki4",
          "type": "list",
          "component": "toDoList",
          "created": this.TodayPlus(0),
          "modified": this.TodayPlus(0),
          "emoji": "🍀",
          "name": "My garden",
          "todos": [
            {
              "id": "u8gj2a7n0",
              "type": "list",
              "component": "toDoList",
              "created": this.TodayPlus(0),
              "modified": this.TodayPlus(0),
              "emoji": "💧",
              "name": "Water saplings",
              "todos": [
                {
                  "id": "1tj2rirej",
                  "type": "checkbox",
                  "component": "checkBoxToDo",
                  "text": "Water saplings",
                  "done": false,
                  "weight": 1,
                  "dateStart": this.TodayPlus(-1),
                  "dateEnd": this.TodayPlus(2),
                  "star": false,
                  "urgent": false,
                  "color": null
                }
              ],
              "done": 0,
              "weight": 1,
              "progressBinary": false,
              "progressVisable": false,
              "countdownVisable": true,
              "dateStart": this.TodayPlus(-1),
              "dateEnd": this.TodayPlus(2),
              "star": true,
              "urgent": false,
              "archived": false,
              "color": "#00a8ff"
            },
            {
              "id": "x73kc8jhk",
              "type": "checkbox",
              "component": "checkBoxToDo",
              "text": "Plant new seeds",
              "done": 0,
              "weight": 1,
              "dateStart": this.TodayPlus(-1),
              "dateEnd": this.TodayPlus(2),
              "star": false,
              "urgent": false,
              "color": null
            },
            {
              "id": "uban3mrjp",
              "type": "checkbox",
              "component": "checkBoxToDo",
              "text": "Fix the leaking pot",
              "done": false,
              "weight": 1,
              "dateStart": this.TodayPlus(-1),
              "dateEnd": this.TodayPlus(2),
              "star": false,
              "urgent": false,
              "color": null
            },
            {
              "id": "e8ahi62xj",
              "type": "checkbox",
              "component": "checkBoxToDo",
              "text": "Spray for insects",
              "done": 0,
              "weight": 1,
              "dateStart": this.TodayPlus(-1),
              "dateEnd": this.TodayPlus(2),
              "star": true,
              "urgent": true,
              "color": null
            }
          ],
          "done": 0,
          "weight": 1,
          "progressBinary": false,
          "progressVisable": false,
          "countdownVisable": false,
          "dateStart": this.TodayPlus(-1),
          "dateEnd": this.TodayPlus(2),
          "star": false,
          "urgent": false,
          "color": "#5dff00"
        },
        {
          "id": "8gwnmoflo",
          "type": "list",
          "component": "toDoList",
          "created": this.TodayPlus(0),
          "modified": this.TodayPlus(0),
          "emoji": "🎓",
          "name": "Did you know?",
          "todos": [
            {
              "id": "kphbnm4vt",
              "type": "checkbox",
              "component": "checkBoxToDo",
              "text": "You can also show archived todos",
              "done": 0,
              "weight": 1,
              "dateStart": this.TodayPlus(-1),
              "dateEnd": this.TodayPlus(2),
              "star": true,
              "urgent": false,
              "archived": false,
              "color": null
            },
            {
              "id": "i4qokfgot",
              "type": "checkbox",
              "component": "checkBoxToDo",
              "text": "Check the menu in right-top corner",
              "done": 0,
              "weight": 1,
              "dateStart": this.TodayPlus(-1),
              "dateEnd": this.TodayPlus(2),
              "star": false,
              "urgent": true,
              "archived": false,
              "color": null
            },
            {
              "id": "jnkzevbut",
              "type": "checkbox",
              "component": "checkBoxToDo",
              "text": "See, this todo was archived, and now you can see it!",
              "done": 0,
              "weight": 1,
              "dateStart": this.TodayPlus(-1),
              "dateEnd": this.TodayPlus(2),
              "star": false,
              "urgent": false,
              "archived": true,
              "color": null
            },
            {
              "id": "13zbwo9kc",
              "type": "list",
              "component": "toDoList",
              "created": this.TodayPlus(0),
              "modified": this.TodayPlus(0),
              "emoji": "🎨",
              "name": "You can color all your todos!",
              "todos": [
                {
                  "id": "pkrx7g1jo",
                  "type": "bar",
                  "component": "barToDo",
                  "text": "",
                  "done": "0.2",
                  "weight": 1,
                  "dateStart": this.TodayPlus(-1),
                  "dateEnd": this.TodayPlus(2),
                  "star": false,
                  "urgent": false,
                  "archived": false,
                  "color": "#ff0c00"
                },
                {
                  "id": "kqvxde1dx",
                  "type": "bar",
                  "component": "barToDo",
                  "text": "",
                  "done": "0.4",
                  "weight": 1,
                  "dateStart": this.TodayPlus(-1),
                  "dateEnd": this.TodayPlus(2),
                  "star": false,
                  "urgent": false,
                  "archived": false,
                  "color": "#ffb500"
                },
                {
                  "id": "kfasya6df",
                  "type": "bar",
                  "component": "barToDo",
                  "text": "",
                  "done": "0.6",
                  "weight": 1,
                  "dateStart": this.TodayPlus(-1),
                  "dateEnd": this.TodayPlus(2),
                  "star": false,
                  "urgent": false,
                  "archived": false,
                  "color": "#18ff00"
                },
                {
                  "id": "vfj7yun5c",
                  "type": "bar",
                  "component": "barToDo",
                  "text": "",
                  "done": "0.8",
                  "weight": 1,
                  "dateStart": this.TodayPlus(-1),
                  "dateEnd": this.TodayPlus(2),
                  "star": false,
                  "urgent": false,
                  "archived": false,
                  "color": "#00e8ff"
                },
                {
                  "id": "2akayklna",
                  "type": "bar",
                  "component": "barToDo",
                  "text": "",
                  "done": "1",
                  "weight": 1,
                  "dateStart": this.TodayPlus(-1),
                  "dateEnd": this.TodayPlus(2),
                  "star": false,
                  "urgent": false,
                  "archived": false,
                  "color": "#000dff"
                }
              ],
              "done": 0.6,
              "weight": 1,
              "progressBinary": false,
              "progressVisable": false,
              "countdownVisable": false,
              "dateStart": this.TodayPlus(-1),
              "dateEnd": this.TodayPlus(2),
              "star": false,
              "urgent": false,
              "archived": true,
              "color": null
            },
            {
              "id": "2mthz1ckp",
              "type": "list",
              "component": "toDoList",
              "created": this.TodayPlus(0),
              "modified": this.TodayPlus(0),
              "emoji": "🦝",
              "name": "Thank you!",
              "todos": [
                {
                  "id": "4wl8cncpq",
                  "type": "checkbox",
                  "component": "checkBoxToDo",
                  "text": "Thanks for checking out my app!",
                  "done": false,
                  "weight": 1,
                  "dateStart": this.TodayPlus(-1),
                  "dateEnd": this.TodayPlus(2),
                  "star": false,
                  "urgent": false,
                  "archived": false,
                  "color": null
                },
                {
                  "id": "yv4rthd0i",
                  "type": "checkbox",
                  "component": "checkBoxToDo",
                  "text": "Learn more about my projects in About section in menu in right top corner",
                  "done": false,
                  "weight": 1,
                  "dateStart": this.TodayPlus(-1),
                  "dateEnd": this.TodayPlus(2),
                  "star": false,
                  "urgent": false,
                  "archived": false,
                  "color": null
                }
              ],
              "done": 0,
              "weight": 1,
              "progressBinary": false,
              "progressVisable": false,
              "countdownVisable": false,
              "dateStart": this.TodayPlus(-1),
              "dateEnd": this.TodayPlus(2),
              "star": false,
              "urgent": false,
              "archived": false,
              "color": "#00aaff"
            }
          ],
          "done": 0.12,
          "weight": 1,
          "progressBinary": false,
          "progressVisable": false,
          "countdownVisable": false,
          "dateStart": this.TodayPlus(-1),
          "dateEnd": this.TodayPlus(2),
          "star": false,
          "urgent": false,
          "archived": false,
          "color": null
        }
      ]

      this.closeModals()
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
      deep: true,
    },
  },
  computed: {
    showModals() {
      return this.showNimoModal || this.showStarModal || this.showUrgentModal;
    },
    flattenedTodos() {
      return this.flattenTodos(this.todos);
    },
    flattenedStarredTodos() {
      return this.flattenTodos(this.todos).filter(todo => todo.star);
    },
    flattenedUrgentTodos() {
      return this.flattenTodos(this.todos).filter(todo => todo.urgent);
    },
    visibleTodos() {
      return this.todos.filter(todo => showArchived.value || !todo.archived);
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>


<style>
@import url("@/assets/css/base.css");
@import url("@/assets/css/menu.css");

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

.mainButtons {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
}

#menu {
  position: fixed;
  top: 1rem;
  right: 1rem;

  z-index: 20;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 1rem;
}

#logo {
  place-self: center;

  width: min-content;

  display: grid;
  grid-template-areas: "l . ." "l t t" "l a v";
  grid-template-columns: auto auto auto;
  grid-template-rows: 1fr 2rem 1fr;
  gap: 0.5rem;

}

#logo .signet {
  display: flex;
  justify-content: center;
  align-items: center;

  aspect-ratio: 1 / 1;
  width: 6rem;
  height: 6rem;

  grid-area: l;

  color: #00aaff;
}

#logo .signet svg {
  aspect-ratio: 1 / 1;

  width: 100%;
  height: 100%;
}

#logo .title {
  grid-area: t;
  font-size: 2rem;
  font-weight: 600;
  color: #eee;

  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

#logo .version {
  grid-area: v;
  font-size: 0.675rem;
  font-weight: 400;
  color: #aaa;

  text-align: right;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
}

#logo .author {
  grid-area: a;
  font-size: 0.75rem;
  font-weight: 400;
  color: #fff;

  text-align: right;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

#logo .author a {
  color: #fff;
  text-decoration: none;
  transition: 0.2s;
}

#logo .author a:hover {
  color: #00aaff;
}






/* #region MODALS */


#modals {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  z-index: 30;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: #00000080;
  backdrop-filter: blur(0.25rem);
}

.modalContent {
  width: 90%;
  max-width: 30rem;
  max-height: 80vh;
  width: clamp(20rem, 90%, 30rem);

  border-radius: 0.75rem;
  overflow: hidden;

  background-color: #1e1f24;
  box-shadow: 0 0.5rem 2rem #00000080;
  border: 1px solid #60616a;
}

.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0.5rem;
  gap: 0.5rem;
}

.modalHeader .horizontalLine {
  flex-grow: 1;
  width: 100%;
  height: 0.0625rem;
  background-color: #3c3e43;
}

.modalHeader h2 {
  margin: 0;
  color: #fff;
  font-size: 1.25rem;
  font-weight: 600;
}

.closeModal {
  background: none;
  border: none;
  color: #7c8187;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: 0.2s;
}

.closeModal:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.modalBody {
  padding: 1rem;
  padding-top: 0;
  overflow-y: auto;
  max-height: calc(80vh - 4rem);

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.emptyState {
  padding: 2rem 1rem;
  text-align: center;
  color: #7c8187;
  background-color: #1e1f24;
}


/* Modal Item Styles */

.modalItem {
  background-color: #282a30;
  border-radius: 4px;
  transition: transform 0.2s, box-shadow 0.2s;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  justify-content: center;

  padding: 0.75rem;
  gap: 1rem;
}

.modalItem:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.3);
}

.modalItem.urgent {
  border-left: 4px solid #d43a3a;
}

.modalItem.starred {
  border-left: 4px solid #f1a129;
}


.itemContent {
  flex: 1;
}

.itemPath {
  font-size: 0.75rem;
  color: #7c8187;
  margin-top: 0.25rem;
}

.goToItem {
  padding: 0.35rem 0.65rem;
  background-color: #3c3e43;
  color: #fff;
  border: none;
  border-radius: 0.35rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: 0.2s;
}

.goToItem:hover {
  background-color: #5e5e5e;
}







.nimoModal svg {
  width: 1.5rem;
  height: 1.5rem;
}

.appInfo {
  text-align: center;
  padding: 1rem;
}

.nimoModal {
  color: #eaeaea;
  display: flex;
  flex-direction: column;
}

.nimoModal .modalHeader {
  padding: 0.75rem 1rem;
}

.nimoModal .modalHeader svg {
  color: #00aaff;
  width: 1.75rem;
  height: 1.75rem;
}


/* Enhanced logo styling */

#logo {
  place-self: center;

  border-radius: 0.75rem;

  display: grid;
  grid-template-areas:
    "l . ."
    "l t t"
    "l a v";
  grid-template-columns: auto 1fr auto;
  grid-template-rows: 1fr auto auto;
  gap: 0.75rem;
  width: fit-content;
}

#logo .signet {
  grid-area: l;
  display: flex;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1 / 1;
  width: 6rem;
  height: 6rem;
  color: #00aaff;
}

#logo .title {
  grid-area: t;
  font-size: 2rem;
  font-weight: 700;
  color: #eee;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
}

#logo .version {
  grid-area: v;
  font-size: 0.75rem;
  color: #aaa;
  text-align: right;
}

#logo .author {
  grid-area: a;
  font-size: 0.875rem;
  color: #ddd;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

#logo .author a {
  color: #0b97dc;
  text-decoration: none;
  font-weight: 600;
  position: relative;
  padding: 0 0.25rem;
  transition: all 0.2s ease;
}

#logo .author a:hover {
  color: #00aaff;
}

#logo .author a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -2px;
  left: 0;
  background-color: #0b97dc;
  transition: 0.3s ease;
}

#logo .author a:hover::after {
  width: 100%;
  background-color: #00aaff;
}

/* About section styling */

.nimoModal .appDescription {
  text-align: justify;
  line-height: 1.25;
  color: #ddd;
  font-size: 0.875rem;

  display: grid;
  grid-template-areas: "p p" "d b";
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 0.5rem;

  justify-content: center;
  align-items: center;
}

.nimoModal .appDescription .about {
  grid-area: p;
}

.nimoModal .appDescription .demo {
  grid-area: d;
}

.nimoModal .appDescription button {
  grid-area: b;

  justify-self: start;
  align-self: start;

  padding: 0.125rem 0.25rem;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  color: #7c8187;
  background-color: #282a30;
  border: 1px solid #3c3e43;
  border-radius: 0.5rem;

  cursor: pointer;
  user-select: none;

  transition: 0.2s;

  font-size: 0.75rem;
  font-weight: 700;

  text-decoration: none;

  margin-left: 0.5rem;
}

.nimoModal .appDescription button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.nimoModal .appDescription button:hover {
  color: #ccc;
  border-color: #00aaff;
}

.nimoModal .modalBody {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}


/* Author info card */
.nimoInfoCard {
  display: grid;
  grid-template-areas:
    "b b b"
    "a . ."
    "a n n"
    "a w c";
  justify-content: center;
  align-items: center;

  grid-template-columns: 6rem auto 1fr;
  grid-template-rows: auto 1fr auto 1fr;
  gap: 0.25rem 0.125rem;
}

.nimoAvatar {
  grid-area: a;

  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.nimoAvatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.nimoName {
  grid-area: n;

  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
}

.nimoBio {
  grid-area: b;

  position: relative;

  font-size: 0.875rem;

  color: #111;
  background: #eee;


  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.nimoBio::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 2.25rem;
  width: 0;
  height: 0;
  border-width: 0.75rem;
  border-color: #eee transparent transparent transparent;
  border-style: solid;
  z-index: 2;
}

.nimoWebLink {
  grid-area: w;
}

.nimoContact {
  grid-area: c;
}

.nimoWebLink svg,
.nimoContact svg {
  width: 1.25rem;
  height: 1.25rem;
}

.nimoWebLink:hover,
.nimoContact:hover {
  color: #ccc;
  border-color: #00aaff;
}


.nimoWebLink,
.nimoContact {
  justify-self: start;
  align-self: start;

  padding: 0.125rem 0.25rem;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  color: #7c8187;
  background-color: #282a30;
  border: 1px solid #3c3e43;
  border-radius: 0.5rem;

  cursor: pointer;
  user-select: none;

  transition: 0.2s;

  font-size: 0.75rem;
  font-weight: 700;

  text-decoration: none;

  margin-left: 0.5rem;
}

.nimoWebLink>svg,
.nimoContact>svg {
  width: 1rem;
  height: 1rem;
}

.nimoWebLink>span,
.nimoContact>span {
  flex-grow: 1;
  text-align: left;
  white-space: nowrap;
}






.highlight-item {
  animation: highlight-pulse 3s 1s ease-out;
}

@keyframes highlight-pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--color, #00aaff), #00000000 20%);
  }

  100% {
    box-shadow: 0 0 0 10px #00aaff00;
  }
}




.emptyState {
  display: flex;
  justify-content: center;
  align-items: stretch;

  flex-direction: column;
  gap: 0.25rem;

  min-width: 25rem;
}
.emptyState .inlineTooltipBig {
  color: #7c8187;
  font-size: 1.5rem;
}
.emptyState .inlineTooltip {

}
.flexRowOr {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;

  color: #7c8187;
}
.flexRowOr hr {
  flex-grow: 1;
  height: 0.0625rem;
  background-color: #7c8187;
  border-color: #7c8187;
}
</style>