import { describe, expect, it } from 'vitest';
import {
    AUTO_LAYOUT, autoLayout, computeListProgress, createNode, DATA_VERSION, findNode, findPath,
    isEffectivelyArchived, isNodeVisible, mergeVisibleOrder, migrateToV2, normalizeNode, setArchived,
} from './tree.js';
import { templateTodos } from './consts.js';

const task = (id, extra = {}) => ({ id, type: 'checkbox', component: 'checkBoxToDo', done: 0, weight: 1, ...extra });
const list = (id, todos = [], extra = {}) => ({ id, type: 'list', component: 'toDoList', todos, done: 0, weight: 1, ...extra });

function sampleTree() {
    return [
        list('home', [
            list('math', [task('m1', { done: 1 }), task('m2')]),
            list('history', [task('h1'), list('presentation', [task('p1')])]),
        ]),
        list('groceries', [task('g1')]),
    ];
}

describe('createNode', () => {
    it('creates lists with children and list-only settings', () => {
        const n = createNode('list');
        expect(n.component).toBe('toDoList');
        expect(n.todos).toEqual([]);
        expect(n.progressBinary).toBe(false);
        expect(n.archivedAt).toBeNull();
        expect(n).not.toHaveProperty('locked');
    });

    it('creates tasks without list fields and honors overrides', () => {
        const n = createNode('bar', { text: 'x' });
        expect(n.component).toBe('barToDo');
        expect(n.todos).toBeUndefined();
        expect(n.text).toBe('x');
    });

    it('gives unique ids', () => {
        expect(createNode('checkbox').id).not.toBe(createNode('checkbox').id);
    });
});

describe('normalizeNode', () => {
    it('fills fields missing in v1 data, recursively', () => {
        const n = normalizeNode(list('a', [{ id: 'b', text: 'old', done: true }]));
        const child = n.todos[0];
        expect(child.type).toBe('checkbox');
        expect(child.component).toBe('checkBoxToDo');
        expect(child.archived).toBe(false);
        expect(child.weight).toBe(1);
    });

    it('keeps existing values', () => {
        const n = normalizeNode(task('a', { archived: true, archivedAt: '2026-01-01', weight: 3 }));
        expect(n).toMatchObject({ archived: true, archivedAt: '2026-01-01', weight: 3 });
    });

    it('gives locked only to top-level lists and strips it from nested nodes', () => {
        const n = normalizeNode(list('top', [list('nested', [task('t', { locked: true })], { locked: true })], { locked: true }), true);
        expect(n.locked).toBe(true);
        expect(n.todos[0]).not.toHaveProperty('locked');
        expect(n.todos[0].todos[0]).not.toHaveProperty('locked');
        expect(normalizeNode(list('fresh'), true).locked).toBe(false);
    });
});

describe('findPath / findNode', () => {
    it('returns the chain from the top-level list to the node', () => {
        expect(findPath(sampleTree(), 'p1').map(n => n.id)).toEqual(['home', 'history', 'presentation', 'p1']);
    });

    it('returns null for unknown ids', () => {
        expect(findPath(sampleTree(), 'nope')).toBeNull();
        expect(findNode(sampleTree(), 'nope')).toBeNull();
    });
});

describe('archiving', () => {
    it('setArchived sets and clears the timestamp', () => {
        const t = task('a');
        setArchived(t, true);
        expect(t.archived).toBe(true);
        expect(typeof t.archivedAt).toBe('string');
        setArchived(t, false);
        expect(t.archived).toBe(false);
        expect(t.archivedAt).toBeNull();
    });

    it('a node inside an archived list counts as archived', () => {
        const tree = sampleTree();
        findNode(tree, 'history').archived = true;
        expect(isEffectivelyArchived(tree, 'p1')).toBe(true);
        expect(isEffectivelyArchived(tree, 'm1')).toBe(false);
    });
});

describe('isNodeVisible', () => {
    it('hides archived and done nodes by default', () => {
        expect(isNodeVisible(task('a'), {})).toBe(true);
        expect(isNodeVisible(task('a', { archived: true }), {})).toBe(false);
        expect(isNodeVisible(task('a', { done: true }), {})).toBe(false);
        expect(isNodeVisible(task('a', { done: 1 }), {})).toBe(false);
        expect(isNodeVisible(task('a', { done: 0.5 }), {})).toBe(true);
    });

    it('shows them when the settings say so', () => {
        expect(isNodeVisible(task('a', { archived: true }), { showArchived: true })).toBe(true);
        expect(isNodeVisible(task('a', { done: 1 }), { showDone: true })).toBe(true);
    });
});

describe('computeListProgress', () => {
    it('weights linear progress', () => {
        const l = list('l', [task('a', { done: 1, weight: 3 }), task('b', { done: 0.5, weight: 1 })]);
        expect(computeListProgress(l)).toEqual({ done: 3.5 / 4, doneCount: 2, count: 2 });
    });

    it('counts only fully done children in binary mode', () => {
        const l = list('l', [task('a', { done: 1 }), task('b', { done: 0.5 })], { progressBinary: true });
        expect(computeListProgress(l).done).toBe(0.5);
    });

    it('treats boolean done as 0/1', () => {
        const l = list('l', [task('a', { done: true }), task('b', { done: false })]);
        expect(computeListProgress(l).done).toBe(0.5);
    });

    it('ignores archived children', () => {
        const l = list('l', [task('a', { done: 1, archived: true }), task('b')]);
        expect(computeListProgress(l)).toEqual({ done: 0, doneCount: 0, count: 1 });
    });

    it('is zero for an empty list or zero total weight', () => {
        expect(computeListProgress(list('l')).done).toBe(0);
        expect(computeListProgress(list('l', [task('a', { weight: 0, done: 1 })])).done).toBe(0);
    });
});

describe('mergeVisibleOrder', () => {
    it('reorders visible items and keeps hidden ones in their slots', () => {
        const all = [task('a'), task('hidden'), task('b'), task('c')];
        const visibleNext = [all[3], all[0], all[2]];
        expect(mergeVisibleOrder(all, visibleNext).map(t => t.id)).toEqual(['c', 'hidden', 'a', 'b']);
    });
});

describe('autoLayout', () => {
    it('places unpositioned lists on a grid by index and keeps existing positions', () => {
        const lists = [list('a', [], { pos: { x: 5, y: 7 } }), list('b'), list('c'), list('d')];
        autoLayout(lists);
        const step = AUTO_LAYOUT.columnWidth + AUTO_LAYOUT.gap;
        expect(lists[0].pos).toEqual({ x: 5, y: 7 });
        expect(lists[1].pos).toEqual({ x: step, y: 0 });
        expect(lists[3].pos).toEqual({ x: 0, y: AUTO_LAYOUT.rowHeight + AUTO_LAYOUT.gap });
        expect(lists.map(l => l.z)).toEqual([0, 1, 2, 3]);
    });
});

describe('migrateToV2', () => {
    it('returns null for missing or broken data', () => {
        expect(migrateToV2(null)).toBeNull();
        expect(migrateToV2('x')).toBeNull();
    });

    it('migrates v1 data without losing the tree or settings', () => {
        const v1 = { _v: 1, todos: sampleTree(), settings: { showDone: true, showArchived: false } };
        const v2 = migrateToV2(v1);
        expect(v2._v).toBe(DATA_VERSION);
        expect(v2.viewport).toEqual({ x: 0, y: 0, zoom: 1 });
        expect(v2.settings).toMatchObject({ showDone: true, lockLayout: false });
        expect(v2.todos.map(t => t.id)).toEqual(['home', 'groceries']);
        expect(findNode(v2.todos, 'p1')).toMatchObject({ archivedAt: null });
        expect(findNode(v2.todos, 'p1')).not.toHaveProperty('locked');
        expect(v2.todos.every(t => t.pos && Number.isFinite(t.z) && t.locked === false)).toBe(true);
    });

    it('keeps archived flags (archive stays in the same tree)', () => {
        const tree = sampleTree();
        findNode(tree, 'h1').archived = true;
        expect(findNode(migrateToV2({ todos: tree }).todos, 'h1').archived).toBe(true);
    });

    it('is idempotent for v2 data', () => {
        const once = migrateToV2({ todos: sampleTree() });
        once.viewport = { x: 10, y: 20, zoom: 1.5 };
        const twice = migrateToV2(JSON.parse(JSON.stringify(once)));
        expect(twice).toEqual(once);
    });

    it('handles the demo data', () => {
        const v2 = migrateToV2({ todos: JSON.parse(JSON.stringify(templateTodos)) });
        expect(v2.todos.length).toBe(templateTodos.length);
        expect(v2.todos.every(t => t.pos)).toBe(true);
    });
});
