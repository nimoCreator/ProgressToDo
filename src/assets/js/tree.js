// Pure helpers for the todo tree. No Vue / Pinia imports here, so everything is unit-testable.

export const DATA_VERSION = 2;

// Layout used when lists have no position yet (migration, demo, CSV import).
export const AUTO_LAYOUT = { columnWidth: 440, gap: 40, columns: 3, rowHeight: 520 };

const COMPONENT_BY_TYPE = {
    list: 'toDoList',
    checkbox: 'checkBoxToDo',
    bar: 'barToDo',
};

export function generateId() {
    return Math.random().toString(36).slice(2, 11);
}

function nowLocal(offsetMs = 0) {
    return new Date(Date.now() + offsetMs).toISOString().slice(0, 16);
}

/* #region node factory / normalization */

// Creates a new node with every field the app expects.
export function createNode(type, overrides = {}) {
    const node = {
        id: generateId(),
        type,
        component: COMPONENT_BY_TYPE[type],

        created: nowLocal(),
        modified: nowLocal(),
        emoji: type === 'list' ? '📝' : '',
        text: '',
        done: 0,
        weight: 1,

        dateStart: nowLocal(),
        dateEnd: nowLocal(86400000), // 24h later

        star: false,
        urgent: false,
        archived: false,
        archivedAt: null,

        color: null,
    };
    if (type === 'list') {
        node.todos = [];
        node.progressBinary = false;
        node.progressVisable = false;
        node.countdownVisable = false;
    }
    return { ...node, ...overrides };
}

// Fills in fields missing from older data. Mutates and returns the node (recursively).
// Only top-level lists (the ones on the board) can be locked; nested nodes never carry `locked`.
export function normalizeNode(node, topLevel = false) {
    if (!node.type) node.type = node.todos ? 'list' : 'checkbox';
    if (!node.component) node.component = COMPONENT_BY_TYPE[node.type];
    if (node.archived === undefined) node.archived = false;
    node.archived = !!node.archived;
    if (node.archivedAt === undefined) node.archivedAt = null;
    if (topLevel) node.locked = !!node.locked;
    else delete node.locked;
    if (!Number.isFinite(+node.weight)) node.weight = 1;
    if (node.type === 'list') {
        if (!Array.isArray(node.todos)) node.todos = [];
        node.todos.forEach(child => normalizeNode(child, false));
    }
    return node;
}

/* #endregion */

/* #region traversal */

// Calls fn(node, parent, ancestors) for every node, depth-first.
export function walkTree(nodes, fn, parent = null, ancestors = []) {
    for (const node of nodes) {
        fn(node, parent, ancestors);
        if (node.todos?.length) walkTree(node.todos, fn, node, [...ancestors, node]);
    }
}

// Returns the chain of nodes from a top-level list down to the node with this id, or null.
export function findPath(nodes, id) {
    for (const node of nodes) {
        if (node.id === id) return [node];
        if (node.todos?.length) {
            const sub = findPath(node.todos, id);
            if (sub) return [node, ...sub];
        }
    }
    return null;
}

export function findNode(nodes, id) {
    const path = findPath(nodes, id);
    return path ? path[path.length - 1] : null;
}

/* #endregion */

/* #region archive / visibility */

export function setArchived(node, value) {
    node.archived = !!value;
    node.archivedAt = value ? new Date().toISOString() : null;
}

// A node counts as archived when it, or any list containing it, is archived.
export function isEffectivelyArchived(nodes, id) {
    const path = findPath(nodes, id);
    return !!path && path.some(n => n.archived);
}

export function doneValue(node) {
    return Number.isFinite(+node.done) ? +node.done : (node.done ? 1 : 0);
}

// True when any node below this one is archived.
export function containsArchived(node) {
    return (node.todos || []).some(t => t.archived || containsArchived(t));
}

// Top-level lists shown in the archive view: archived themselves or holding archived items.
export function hasArchivedContent(node) {
    return !!node.archived || containsArchived(node);
}

// Number of archived nodes in a subtree (a node inside an archived list is not counted twice).
export function countArchived(node) {
    return (node.todos || []).reduce((sum, t) => sum + (t.archived ? 1 : countArchived(t)), 0);
}

// Removes every live (non-archived) node from a list, keeping archived nodes and the lists
// that hold them. Used by "Clear ToDoList" so it never deletes archived items.
export function pruneLive(list) {
    list.todos = (list.todos || []).filter(child => {
        if (child.archived) return true;
        if (containsArchived(child)) {
            pruneLive(child);
            return true;
        }
        return false;
    });
    return list;
}

// Single visibility rule for the live board (lists and tasks alike).
// Archived nodes are never shown there; they have their own archive view.
export function isNodeVisible(node, settings = {}) {
    return !node.archived && (settings.showDone || doneValue(node) < 1);
}

/* #endregion */

/* #region progress */

// Weighted progress of a list in [0, 1]. Archived children do not count.
export function computeListProgress(list) {
    const children = (list.todos || []).filter(t => !t.archived);
    const totalWeight = children.reduce((sum, t) => sum + (+t.weight || 0), 0);
    if (totalWeight === 0) return { done: 0, doneCount: 0, count: 0 };

    const completedWeight = list.progressBinary
        ? children.filter(t => doneValue(t) >= 1).reduce((sum, t) => sum + (+t.weight || 0), 0)
        : children.reduce((sum, t) => sum + (+t.weight || 0) * doneValue(t), 0);

    return {
        done: completedWeight / totalWeight,
        doneCount: children.filter(t => doneValue(t) > 0).length,
        count: children.length,
    };
}

/* #endregion */

/* #region reorder */

// Applies a new order of the visible subset back onto the full array.
// Hidden items keep their slots; visible slots are refilled in the new order.
export function mergeVisibleOrder(all, visibleNext) {
    const visibleIds = new Set(visibleNext.map(t => t.id));
    let i = 0;
    return all.map(t => (visibleIds.has(t.id) ? visibleNext[i++] : t));
}

/* #endregion */

/* #region layout / migration */

// Gives a position to every top-level list that has none: grid slot = its index in the array.
export function autoLayout(lists, layout = AUTO_LAYOUT) {
    lists.forEach((list, slot) => {
        if (list.pos && Number.isFinite(list.pos.x) && Number.isFinite(list.pos.y)) return;
        const col = slot % layout.columns;
        const row = Math.floor(slot / layout.columns);
        list.pos = {
            x: col * (layout.columnWidth + layout.gap),
            y: row * (layout.rowHeight + layout.gap),
        };
    });
    lists.forEach((list, i) => { if (!Number.isFinite(list.z)) list.z = i; });
    return lists;
}

export function defaultViewport() {
    return { x: 0, y: 0, zoom: 1 };
}

// Prepares a list of top-level nodes (from storage, demo, or CSV) for the v2 board.
export function prepareTopLevel(lists) {
    const out = Array.isArray(lists) ? lists : [];
    out.forEach(list => normalizeNode(list, true));
    return autoLayout(out);
}

// v1 stored { _v: 1, todos, settings }. v2 keeps the same tree and adds layout + viewport.
export function migrateToV2(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const s = raw.settings || {};
    return {
        _v: DATA_VERSION,
        todos: prepareTopLevel(Array.isArray(raw.todos) ? raw.todos : []),
        viewport: raw.viewport && Number.isFinite(raw.viewport.zoom) ? raw.viewport : defaultViewport(),
        settings: {
            showBattlePass: !!s.showBattlePass,
            showAiAssist: !!s.showAiAssist,
            showDone: !!s.showDone,
            lockLayout: !!s.lockLayout,
        },
    };
}

/* #endregion */
