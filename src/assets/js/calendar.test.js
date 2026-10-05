import { describe, expect, it } from 'vitest';
import { bucketTodosByDay, buildMonthGrid, closestDeadlines, dateKey, oldestTasks, overdueTasks } from './calendar.js';

describe('dateKey', () => {
    it('reads the literal date prefix from a stored date string', () => {
        expect(dateKey('2026-03-05T14:30')).toBe('2026-03-05');
    });

    it('builds a key from a Date instance using its local fields', () => {
        expect(dateKey(new Date(2026, 2, 5))).toBe('2026-03-05'); // month is 0-indexed
    });

    it('is null for falsy or invalid input', () => {
        expect(dateKey(null)).toBeNull();
        expect(dateKey(undefined)).toBeNull();
        expect(dateKey('')).toBeNull();
        expect(dateKey('not a date')).toBeNull();
    });
});

describe('buildMonthGrid', () => {
    it('returns a 42-cell Monday-first grid', () => {
        // March 2026 starts on a Sunday.
        const cells = buildMonthGrid(2026, 2);
        expect(cells).toHaveLength(42);
        expect(cells[0].key).toBe('2026-02-23'); // Monday before March 1st
        expect(cells[0].inMonth).toBe(false);
        const first = cells.find(c => c.key === '2026-03-01');
        expect(first.inMonth).toBe(true);
    });

    it('bleeds into the next month to fill the last week', () => {
        const cells = buildMonthGrid(2026, 2);
        const last = cells[cells.length - 1];
        expect(last.date.getMonth()).toBe(3); // April
        expect(last.inMonth).toBe(false);
    });
});

describe('bucketTodosByDay', () => {
    it('buckets by created and due date separately', () => {
        const todos = [
            { id: 'a', created: '2026-03-05T10:00', dateEnd: '2026-03-07T10:00' },
            { id: 'b', created: '2026-03-05T11:00', dateEnd: null },
        ];
        const map = bucketTodosByDay(todos);
        expect(map.get('2026-03-05').created.map(t => t.id)).toEqual(['a', 'b']);
        expect(map.get('2026-03-07').due.map(t => t.id)).toEqual(['a']);
        expect(map.has('2026-03-07')).toBe(true);
        expect(map.get('2026-03-07').created).toEqual([]);
    });

    it('never buckets a null dateEnd into due', () => {
        const todos = [{ id: 'a', created: '2026-03-05T10:00', dateEnd: null }];
        const map = bucketTodosByDay(todos);
        expect([...map.values()].every(v => v.due.length === 0)).toBe(true);
    });
});

describe('closestDeadlines / oldestTasks / overdueTasks', () => {
    const now = new Date('2026-03-10T00:00');
    const todos = [
        { id: 'done-future', done: 1, dateEnd: '2026-03-15T00:00', created: '2026-01-01T00:00' },
        { id: 'no-date', done: 0, dateEnd: null, created: '2026-01-02T00:00' },
        { id: 'soon', done: 0, dateEnd: '2026-03-12T00:00', created: '2026-02-01T00:00' },
        { id: 'later', done: 0, dateEnd: '2026-03-20T00:00', created: '2026-02-15T00:00' },
        { id: 'overdue-old', done: 0, dateEnd: '2026-03-01T00:00', created: '2026-01-05T00:00' },
        { id: 'overdue-recent', done: 0, dateEnd: '2026-03-08T00:00', created: '2026-02-20T00:00' },
        { id: 'overdue-but-done', done: 1, dateEnd: '2026-03-01T00:00', created: '2026-01-10T00:00' },
    ];

    it('closestDeadlines: not done, due in the future, soonest first', () => {
        expect(closestDeadlines(todos, now).map(t => t.id)).toEqual(['soon', 'later']);
    });

    it('closestDeadlines: respects the limit', () => {
        expect(closestDeadlines(todos, now, 1).map(t => t.id)).toEqual(['soon']);
    });

    it('oldestTasks: not done, oldest created first, regardless of due date', () => {
        expect(oldestTasks(todos).map(t => t.id)).toEqual([
            'no-date', 'overdue-old', 'soon', 'later', 'overdue-recent',
        ]);
    });

    it('overdueTasks: not done, due date passed, most overdue first', () => {
        expect(overdueTasks(todos, now).map(t => t.id)).toEqual(['overdue-old', 'overdue-recent']);
    });
});
