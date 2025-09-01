import { defineStore } from 'pinia';

const STORAGE_KEY = 'progressToDo:v1';
const STORAGE_VERSION = 1;

function safeParse(s) { try { return JSON.parse(s); } catch { return null; } }
function isStorageAvailable() {
    try { const k = '__t__'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch { return false; }
}
function debounce(fn, wait = 200) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait); }; }

export const useTodosStore = defineStore('todos', {
    state: () => ({
        _v: STORAGE_VERSION,
        todos: [],
        settings: {
            showArchived: false,
            showBattlePass: false,
            showDone: false,
        },
    }),

    getters: {
        visibleTodos: (s) =>
            s.todos.filter(t => (s.settings.showArchived || !t.archived) && (s.settings.showDone || t.done < 1)),

        flattenedTodos: (s) => {
            const out = [];
            const walk = (arr, parent = null) => {
                for (const t of arr) {
                    const copy = { ...t };
                    if (parent?.name) copy.parentName = parent.name;
                    out.push(copy);
                    if (t.todos?.length) walk(t.todos, t);
                }
            };
            walk(s.todos);
            return out;
        },

        flattenedStarredTodos: (s) => s.flattenedTodos.filter(t => t.star),
        flattenedUrgentTodos: (s) => s.flattenedTodos.filter(t => t.urgent),

        doneWeightedCount: (s) =>
            s.flattenedTodos.reduce((acc, t) => acc + (Number.isFinite(+t.weight) ? +t.weight : 1) * (t.done || 0), 0),

        totalWeightedCount: (s) =>
            s.flattenedTodos.reduce((acc, t) => acc + (Number.isFinite(+t.weight) ? +t.weight : 1), 0),
    },

    actions: {
        addTodo(newTodo) { this.todos.push(newTodo); },
        deleteToDo(index) { this.todos.splice(index, 1); },

        toggleShowArchived() { this.settings.showArchived = !this.settings.showArchived; },
        toggleShowDone() { this.settings.showDone = !this.settings.showDone; },
        toggleBattlePass() { this.settings.showBattlePass = !this.settings.showBattlePass; },

        clearAll() {
            this.todos = [];
            this.settings.showArchived = false;
            this.settings.showBattlePass = false;
            this.settings.showDone = false;
        },

        initFromStorage() {
            if (!isStorageAvailable()) return;
            const raw = safeParse(localStorage.getItem(STORAGE_KEY));
            if (!raw || typeof raw !== 'object') return;
            // migration point (if future versions differ)
            this._v = STORAGE_VERSION;
            this.todos = Array.isArray(raw.todos) ? raw.todos : [];
            const s = raw.settings || {};
            this.settings.showArchived = !!s.showArchived;
            this.settings.showBattlePass = !!s.showBattlePass;
            this.settings.showDone = !!s.showDone;
        },

        persistNow() {
            if (!isStorageAvailable()) return;
            const payload = JSON.stringify({
                _v: STORAGE_VERSION,
                todos: this.todos,
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
