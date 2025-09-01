<template>
  <div id="appWrapper" @contextmenu.stop.prevent.exact="toggleMenu" @click="closeAllMenus">
    <div id="menu" class="menu" @click.stop="toggleMenu">
      <span class="menuOpenButton"> ... </span>
      <div class="buttons" :class="{ show: showMenu }" @click.stop>

        <div class="divider">
          <span>highlighted</span>
          <div class="horizontalLine"></div>
        </div>

        <button class="star" @click.stop="openStarModal">
          <span class="material-symbols-rounded icon fill">star</span>
          <span class="buttonLabel"> Show Starred </span>
        </button>

        <button class="urgent" @click.stop="openUrgentModal">
          <span class="material-symbols-rounded icon fill">mode_heat</span>
          <span class="buttonLabel"> Show Urgent </span>
        </button>

        <button class="archived" @click.stop="toggleShowArchived" :class="{ fill: showArchived }">
          <span class="material-symbols-rounded icon" :class="{ fill: showArchived }">inventory_2</span>
          <span class="buttonLabel"> {{ showArchived ? "Hide" : "Show" }} Archived </span>
        </button>

        <button class="done" @click.stop="toggleShowDone" :class="{ fill: showDone }">
          <span class="material-symbols-rounded icon" :class="{ fill: showDone }">check_box</span>
          <span class="buttonLabel"> {{ showDone ? "Hide" : "Show" }} Done </span>
        </button>

        <button class="done" @click.stop="toggleBattlePass" :class="{ fill: showBattlePass }">
          <span class="material-symbols-rounded icon" :class="{ fill: showBattlePass }">strategy</span>
          <span class="buttonLabel"> {{ showBattlePass ? "Hide" : "Show" }} BattlePass </span>
        </button>

        <div class="divider">
          <span>data</span>
          <div class="horizontalLine"></div>
        </div>

        <!-- <button @click.stop="copyAllCSV">
          <span class="material-symbols-rounded icon">content_copy</span>
          <span class="buttonLabel"> Copy all to Clipboard</span>
        </button>

        <button @click.stop="pasteAllCSV">
          <span class="material-symbols-rounded icon">content_paste</span>
          <span class="buttonLabel"> Paste all from Clipboard </span>
        </button> -->

        <button @click.stop="saveAllCSVFile">
          <span class="material-symbols-rounded icon">download</span>
          <span class="buttonLabel"> Download CSV file </span>
        </button>
        <button @click.stop="openCSVFileDialog">
          <span class="material-symbols-rounded icon">upload</span>
          <span class="buttonLabel"> Upload CSV file </span>
        </button>
        <input ref="csvInput" type="file" accept=".csv,text/csv" style="display:none" @change="onCSVFileSelected" />

        <button class="clear" @click.stop="clearLocalStorage">
          <span class="material-symbols-rounded icon">delete</span>
          <span class="buttonLabel"> Clear ToDoList </span>
        </button>

        <div class="divider">
          <span>info</span>
          <div class="horizontalLine"></div>
        </div>

        <button class="nimo" @click.stop="openNimoModal">
          <nimoIcon />
          <span class="buttonLabel"> About app, and author </span>
        </button>
      </div>
    </div>

    <div id="gridPanel">

      <BattlePass :doneCount="doneWeightedCount" :totalCount="totalWeightedCount" v-if="showBattlePass" />

      <Draggable v-model="visibleTodos" class="draggables" item-key="id" handle=".dragHandleList" :animation="200"
        :ghost-class="'drag-ghost'">
        <template #item="{ index }">
          <toDoList :key="todos[index].id" v-model="todos[index]" @deleteToDo="deleteToDo(index)" />
        </template>
      </Draggable>

      <div class="emptyState" v-if="visibleTodos.length === 0">
        <p class="inlineTooltipBig">No todos found</p>
        <p class="inlineTooltip">Click the plus icon below to add a new todo!</p>
        <div class="flexRowOr">
          <hr />or
          <hr />
        </div>
        <button @click="LoadDemo">Click here to load the Demo!</button>
      </div>
      <button @click="addTodo" class="addTodo">
        <span class="material-symbols-rounded icon fill">add</span>
      </button>
    </div>

    <div class="mainButtons">
      <button @click="scrollTop" class="scrollTop">
        <span class="material-symbols-rounded icon fill">arrow_upward</span>
      </button>
    </div>

    <div id="modals" v-if="showModals" @click="closeAllModals">
      <div class="modalContent" @click.stop>
        <div class="nimoModal" v-if="showNimoModal">
          <div class="modalHeader">
            <nimoIcon />
            <span>About</span>
            <div class="horizontalLine"></div>
            <button class="closeModal" @click="closeAllModals">×</button>
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
                <span class="material-symbols-rounded icon fill">folder</span>
                <span>Load Demo</span>
              </button>
            </p>

            <div class="nimoInfoCard">
              <div class="nimoAvatar">
                <img src="./assets/img/nimo-background-animated.gif" alt="nimo" />
              </div>
              <div class="nimoName">Sebastian <span style="color: #00aaff;">nimo</span> Legierski</div>

              <a href="https://nimoweb.ddns.net" class="nimoWebLink">
                <span class="material-symbols-rounded icon fill">language</span>
                Website
              </a>
              <a href="https://nimoweb.ddns.net/contact" class="nimoContact">
                <span class="material-symbols-rounded icon fill">mail</span>
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
            <span class="material-symbols-rounded icon fill">mode_heat</span>
            <span>urgent</span>
            <div class="horizontalLine"></div>
            <button class="closeModal" @click="closeAllModals">
              <span class="material-symbols-rounded icon fill">close</span>
            </button>
          </div>
          <div class="modalBody" v-if="flattenedUrgentTodos.length > 0">
            <div v-for="item in flattenedUrgentTodos" :key="item.id" class="modalItem urgent"
              @click="scrollToItem(item.id)">
              <div class="itemContent">
                <strong v-if="item.text">{{ item.text }}</strong>
                <strong v-else>{{ item.text || 'Untitled Task' }}</strong>
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
            <span class="material-symbols-rounded icon fill">star</span>
            <span>starred</span>
            <div class="horizontalLine"></div>
            <button class="closeModal" @click="closeAllModals">
              <span class="material-symbols-rounded icon fill">close</span>
            </button>
          </div>
          <div class="modalBody" v-if="flattenedStarredTodos.length > 0">
            <div v-for="item in flattenedStarredTodos" :key="item.id" class="modalItem starred"
              @click="scrollToItem(item.id)">
              <div class="itemContent">
                <strong v-if="item.text">{{ item.text }}</strong>
                <strong v-else>{{ item.text || 'Untitled Task' }}</strong>
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

import { useTodosStore, installTodosPersistence } from '@/assets/stores/globalStorage.js';
import toDoList from "@/assets/components/toDoList.vue";

import { appVersion, releaseDate } from "./assets/js/consts";
import Favicon from "./assets/svg/Favicon.vue";
import nimoIcon from "./assets/svg/nimoIcon.vue";
import { templateTodos } from "./assets/js/consts.js";
import BattlePass from "@/assets/components/BattlePass.vue";

import Draggable from 'vuedraggable'

export default {
  name: "App",
  components: {
    toDoList,
    Favicon,
    nimoIcon,
    templateTodos,
    Draggable,
    BattlePass
  },
  setup() {
    const store = useTodosStore();
    installTodosPersistence(store);
    store.initFromStorage();
    return { store };
  },
  data() {
    return {
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
      this.store.addTodo({
        id: this.generateUniqueId(),

        type: 'list',
        component: 'toDoList',

        created: new Date().toISOString().slice(0, 16),
        modified: new Date().toISOString().slice(0, 16),
        emoji: '📝',
        text: '',
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

    /* #region LOCAL STORAGE */

    deleteToDo(index) {
      this.store.deleteToDo(index);
    },
    clearLocalStorage() {
      if (confirm("Are you sure you want to delete all your todos?")) {
        this.store.clearAll();
        this.store.persistNow();
      }
    },

    /* #endregion LOCAL STORAGE */

    scrollTop() {
      document.querySelector("html").scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    closeAllMenus() {
      this.showMenu = false;
      this.closeAllModals();
    },
    generateUniqueId() {
      return Math.random().toString(36).substr(2, 9);
    },
    copyAll() {
      const todosString = JSON.stringify(this.store.todos, null, 2);
      navigator.clipboard.writeText(todosString).then(() => {
        alert("Todos copied to clipboard!");
      });
    },
    pasteAll() {
      navigator.clipboard.readText().then((text) => {
        try {
          const parsedTodos = JSON.parse(text);
          this.store.todos = parsedTodos;
          this.store.persistNow();
          alert("Todos pasted from clipboard!");
        } catch (error) {
          alert("Failed to parse todos from clipboard.");
        }
      });
    },
    toggleShowArchived() {
      this.store.toggleShowArchived();
    },
    toggleShowDone() {
      this.store.toggleShowDone();
    },
    toggleBattlePass() {
      this.store.toggleBattlePass();
    },
    closeAllModals() {
      this.showNimoModal = false;
      this.showStarModal = false;
      this.showUrgentModal = false;
    },
    openStarModal() {
      this.closeAllModals();
      this.showStarModal = !this.showStarModal;
    },
    openUrgentModal() {
      this.closeAllModals();
      this.showUrgentModal = !this.showUrgentModal;
    },
    openNimoModal() {
      this.closeAllModals();
      this.showNimoModal = !this.showNimoModal;
    },
    handleEscape(e) {
      if (e.key === 'Escape') {
        this.showMenu = false;
      }
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
          this.closeAllModals();
        }
      });
    },
    flattenTodos(todos, parent = null) {
      let flattened = [];
      todos.forEach(todo => {
        const todoWithParent = { ...todo };
        if (parent && parent.text) {
          todoWithParent.parentName = parent.text;
        }

        flattened.push(todoWithParent);

        if (todo.todos && todo.todos.length) {
          flattened = flattened.concat(this.flattenTodos(todo.todos, todo));
        }
      });
      return flattened;
    },
    LoadDemo() {
      this.store.todos = JSON.parse(JSON.stringify(templateTodos));
      this.store.persistNow();

      this.closeAllModals()
    },
    clamp01(x) { return Math.max(0, Math.min(1, x)); },

    /* #region CSV */

    csvEscape(v) {
      if (v === null || v === undefined) return '';
      const s = String(v);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    },
    csvUnescape(s) {
      if (s.startsWith('"') && s.endsWith('"')) {
        return s.slice(1, -1).replace(/""/g, '"');
      }
      return s;
    },
    parseCSV(text) {
      const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.length);
      if (lines.length === 0) return { headers: [], rows: [] };
      const parseLine = (line) => {
        const out = []; let cur = ''; let q = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (q) {
            if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
            else if (ch === '"') { q = false; }
            else { cur += ch; }
          } else {
            if (ch === ',') { out.push(cur); cur = ''; }
            else if (ch === '"') { q = true; }
            else { cur += ch; }
          }
        }
        out.push(cur);
        return out;
      };
      const headers = parseLine(lines[0]);
      const rows = lines.slice(1).map(l => {
        const cols = parseLine(l);
        const obj = {};
        headers.forEach((h, i) => obj[h] = this.csvUnescape(cols[i] ?? ''));
        return obj;
      });
      return { headers, rows };
    },

    // ---------- Flatten (export) ----------
    flattenTodosForCSV(todos) {
      const rows = [];
      const dfs = (arr, parentId = '') => {
        arr.forEach((t, idx) => {
          rows.push({
            id: t.id || this.generateUniqueId(),
            parentId,
            order: idx,
            type: t.type ?? '',
            component: t.component ?? '',
            text: t.text ?? '',
            done: Number.isFinite(+t.done) ? +t.done : (t.done ? 1 : 0),
            weight: Number.isFinite(+t.weight) ? +t.weight : 1,
            emoji: t.emoji ?? '',
            created: t.created ?? '',
            modified: t.modified ?? '',
            dateStart: t.dateStart ?? '',
            dateEnd: t.dateEnd ?? '',
            star: t.star ? 1 : 0,
            urgent: t.urgent ? 1 : 0,
            archived: t.archived ? 1 : 0,
            color: t.color ?? '',
            progressBinary: t.progressBinary ? 1 : 0,
            progressVisable: t.progressVisable ? 1 : 0,
            countdownVisable: t.countdownVisable ? 1 : 0,
          });
          if (Array.isArray(t.todos) && t.todos.length) dfs(t.todos, t.id);
        });
      };
      dfs(todos, '');
      return rows;
    },

    // ---------- Rebuild (import) ----------
    rebuildTodosFromCSV(rows) {
      const byId = new Map();
      // create shallow nodes
      for (const r of rows) {
        const node = {
          id: r.id || this.generateUniqueId(),
          type: r.type || 'list',
          component: r.component || (r.type === 'checkbox' ? 'checkBoxToDo' : r.type === 'bar' ? 'barToDo' : 'toDoList'),
          text: r.text || '',
          done: Number.isFinite(+r.done) ? +r.done : 0,
          weight: Number.isFinite(+r.weight) ? +r.weight : 1,
          emoji: r.emoji || '📝',
          created: r.created || '',
          modified: r.modified || '',
          dateStart: r.dateStart || '',
          dateEnd: r.dateEnd || '',
          star: r.star == 1 || r.star === 'true',
          urgent: r.urgent == 1 || r.urgent === 'true',
          archived: r.archived == 1 || r.archived === 'true',
          color: r.color || null,
          progressBinary: r.progressBinary == 1 || r.progressBinary === 'true',
          progressVisable: r.progressVisable == 1 || r.progressVisable === 'true',
          countdownVisable: r.countdownVisable == 1 || r.countdownVisable === 'true',
          todos: [],
          __parentId: r.parentId || '',
          __order: Number.isFinite(+r.order) ? +r.order : 0,
        };
        byId.set(node.id, node);
      }
      // attach to parents
      const roots = [];
      for (const node of byId.values()) {
        if (node.__parentId && byId.has(node.__parentId)) {
          byId.get(node.__parentId).todos.push(node);
        } else {
          roots.push(node);
        }
      }
      // sort children by order (recursively)
      const sortRec = (arr) => {
        arr.sort((a, b) => a.__order - b.__order);
        arr.forEach(n => n.todos && n.todos.length && sortRec(n.todos));
      };
      sortRec(roots);
      // cleanup temp fields
      const cleanup = (arr) => arr.map(n => {
        const { __parentId, __order, ...clean } = n;
        if (clean.todos?.length) clean.todos = cleanup(clean.todos);
        return clean;
      });
      return cleanup(roots);
    },

    // ---------- Clipboard actions ----------
    copyAllCSV() {
      const headers = [
        'id', 'parentId', 'order', 'type', 'component', 'text', 'done', 'weight',
        'emoji', 'created', 'modified', 'dateStart', 'dateEnd',
        'star', 'urgent', 'archived', 'color', 'progressBinary', 'progressVisable', 'countdownVisable'
      ];
      const rows = this.flattenTodosForCSV(this.store ? this.store.todos : this.todos);
      const csv = [
        headers.join(','),
        ...rows.map(r => headers.map(h => this.csvEscape(r[h])).join(','))
      ].join('\n');
      navigator.clipboard.writeText(csv).then(() => {
        alert('Todos copied to clipboard as CSV!');
      });
    },
    pasteAllCSV() {
      navigator.clipboard.readText().then(text => {
        const { headers, rows } = this.parseCSV(text);
        // szybka walidacja minimalna
        const must = ['id', 'parentId', 'order', 'type', 'component', 'done', 'weight'];
        const ok = must.every(h => headers.includes(h));
        if (!ok) {
          alert('Invalid CSV format. Missing required headers.');
          return;
        }
        const tree = this.rebuildTodosFromCSV(rows);
        if (this.store) {
          this.store.todos = tree;
          this.store.persistNow?.();
        } else {
          this.todos = tree;
          this.updateLocalStorage?.();
        }
        alert('Todos pasted from CSV!');
      }).catch(() => alert('Failed to read clipboard.'));
    },

    buildCSV() {
      const headers = [
        'id', 'parentId', 'order', 'type', 'component', 'text', 'done', 'weight',
        'emoji', 'created', 'modified', 'dateStart', 'dateEnd',
        'star', 'urgent', 'archived', 'color', 'progressBinary', 'progressVisable', 'countdownVisable'
      ];
      const sourceTodos = this.store ? this.store.todos : this.todos;
      const rows = this.flattenTodosForCSV(sourceTodos);
      const body = rows.map(r => headers.map(h => this.csvEscape(r[h])).join(',')).join('\r\n');
      const head = headers.join(',');
      return head + '\r\n' + body;
    },

    // Save CSV to file (adds UTF-8 BOM for Excel)
    saveAllCSVFile() {
      try {
        const csv = this.buildCSV();
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `ProgressTODO-${date}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('CSV download failed:', e);
        alert('Failed to generate CSV.');
      }
    },

    // Open file picker
    openCSVFileDialog() {
      this.$refs.csvInput?.click();
    },

    // Handle selected CSV file
    onCSVFileSelected(e) {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result || '');
          const { headers, rows } = this.parseCSV(text);
          const must = ['id', 'parentId', 'order', 'type', 'component', 'done', 'weight'];
          const ok = must.every(h => headers.includes(h));
          if (!ok) {
            alert('Invalid CSV format. Missing required headers.');
            e.target.value = '';
            return;
          }
          const tree = this.rebuildTodosFromCSV(rows);
          if (this.store) {
            this.store.todos = tree;
            this.store.persistNow?.();
          } else {
            this.todos = tree;
            this.updateLocalStorage?.();
          }
          alert('CSV imported!');
        } catch (err) {
          console.warn('CSV import error:', err);
          alert('Failed to parse CSV.');
        } finally {
          e.target.value = ''; // allow re-uploading same file
        }
      };
      reader.onerror = () => {
        alert('Failed to read file.');
        e.target.value = '';
      };
      reader.readAsText(file); // UTF-8 by default
    },

    /* #endregion CSV */
  },
  watch: {
    'store.todos': {
      handler() {
        this.store.persistNow();
      },
      deep: true,
    },
  },
  computed: {
    showModals() { return this.showNimoModal || this.showStarModal || this.showUrgentModal; },
    todos: { get() { return this.store.todos; } },
    showArchived: { get() { return this.store.settings.showArchived; } },
    showDone: { get() { return this.store.settings.showDone; } },
    showBattlePass: { get() { return this.store.settings.showBattlePass; } },
    visibleTodos() { return this.store.visibleTodos; },
    flattenedTodos() { return this.store.flattenedTodos; },
    flattenedStarredTodos() { return this.store.flattenedStarredTodos; },
    flattenedUrgentTodos() { return this.store.flattenedUrgentTodos; },
    doneWeightedCount() { return this.store.doneWeightedCount; },
    totalWeightedCount() { return this.store.totalWeightedCount; },
  },
  mounted() {
    document.addEventListener('keydown', this.handleEscape);
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscape);
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

.mainButtons>* {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2.5rem;
  height: 2.5rem;
}

.mainButtons .icon {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
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

#logo .signet svg,
#logo .signet .icon {
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
  border-radius: 0.5rem;
  border: 1px solid #3c3e43;
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

.nimoModal .appDescription button .icon {
  width: 1rem;
  height: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
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

.nimoWebLink>.icon,
.nimoContact>.icon {
  width: 1rem;
  height: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
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

/* .emptyState .inlineTooltip {} */

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