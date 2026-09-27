import { defineStore } from 'pinia';
import {
    countArchived, DATA_VERSION, defaultMenuSnap, defaultViewport, hasArchivedContent, doneValue, isNodeVisible, migrateToV2, prepareTopLevel, walkTree,
} from '@/assets/js/tree.js';

const STORAGE_KEY = 'progressToDo:v2';
// v1 data is only read (for migration) and never overwritten, so it stays as a backup.
const LEGACY_STORAGE_KEY = 'progressToDo:v1';

function safeParse(s) { try { return JSON.parse(s); } catch { return null; } }
function isStorageAvailable() {
    try { const k = '__t__'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch { return false; }
}
function debounce(fn, wait = 200) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); }; }

export const useTodosStore = defineStore('todos', {
    state: () => ({
        _v: DATA_VERSION,
        // Top-level lists. Each has pos { x, y } and z for the board; nested lists live in .todos.
        todos: [],
        viewport: defaultViewport(),
        settings: {
            showBattlePass: false,
            showAiAssist: false,
            showDone: false,
            lockLayout: false,
            // Side a context menu is pinned to, per item kind ('auto' = placed automatically).
            menuSnap: defaultMenuSnap(),
        },
    }),

    getters: {
        visibleTodos: (s) => s.todos.filter(t => isNodeVisible(t, s.settings)),

        // Every node, with parentName and whether it (or a list above it) is archived.
        flattenedTodos: (s) => {
            const out = [];
            walkTree(s.todos, (t, parent, ancestors) => {
                const copy = { ...t };
                if (parent?.text) copy.parentName = parent.text;
                copy.effectivelyArchived = !!t.archived || ancestors.some(a => a.archived);
                out.push(copy);
            });
            return out;
        },
        liveFlattenedTodos: (s) => s.flattenedTodos.filter(t => !t.effectivelyArchived),

        // Top-level lists shown in the archive view.
        archiveLists: (s) => s.todos.filter(hasArchivedContent),
        archivedCount: (s) => s.todos.reduce((sum, t) => sum + (t.archived ? 1 : countArchived(t)), 0),

        topZ: (s) => s.todos.reduce((max, t) => Math.max(max, Number.isFinite(t.z) ? t.z : 0), 0),

        flattenedStarredTodos: (s) => s.liveFlattenedTodos.filter(t => t.star),
        flattenedUrgentTodos: (s) => s.liveFlattenedTodos.filter(t => t.urgent),

        doneWeightedCount: (s) =>
            s.flattenedTodos.reduce((acc, t) => acc + (Number.isFinite(+t.weight) ? +t.weight : 1) * doneValue(t), 0),

        totalWeightedCount: (s) =>
            s.flattenedTodos.reduce((acc, t) => acc + (Number.isFinite(+t.weight) ? +t.weight : 1), 0),
    },

    actions: {
        addTodo(newTodo) {
            newTodo.z = this.topZ + 1;
            this.todos.push(newTodo);
            prepareTopLevel(this.todos);
        },
        // Raises a top-level list above all others on the board.
        bringToFront(id) {
            const list = this.todos.find(t => t.id === id);
            if (!list || list.z === this.topZ && this.todos.filter(t => t.z === list.z).length === 1) return;
            list.z = this.topZ + 1;
        },
        deleteToDo(index) { this.todos.splice(index, 1); },

        // Replaces the whole board (demo, CSV import); missing fields and positions are filled in.
        replaceTodos(lists) { this.todos = prepareTopLevel(lists); },

        toggleShowDone() { this.settings.showDone = !this.settings.showDone; },
        toggleBattlePass() { this.settings.showBattlePass = !this.settings.showBattlePass; },

        clearAll() {
            this.todos = [];
            this.viewport = defaultViewport();
            this.settings.showBattlePass = false;
            this.settings.showDone = false;
        },

        initFromStorage() {
            if (!isStorageAvailable()) return;
            const raw = safeParse(localStorage.getItem(STORAGE_KEY))
                ?? safeParse(localStorage.getItem(LEGACY_STORAGE_KEY));
            const data = migrateToV2(raw);
            if (!data) return;
            this._v = data._v;
            this.todos = data.todos;
            this.viewport = data.viewport;
            Object.assign(this.settings, data.settings);
        },

        persistNow() {
            if (!isStorageAvailable()) return;
            const payload = JSON.stringify({
                _v: DATA_VERSION,
                todos: this.todos,
                viewport: this.viewport,
                settings: this.settings,
            });
            try { localStorage.setItem(STORAGE_KEY, payload); }
            catch (e) { console.warn('Persist failed:', e); }
        },
    },
});

// debounce persistence on any state change
export function installTodosPersistence(store) {
    const save = debounce(() => store.persistNow(), 200);
    store.$subscribe((_mutation, _state) => { save(); }, { detached: true });
}
