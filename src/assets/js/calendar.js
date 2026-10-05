// Pure helpers for the calendar view: month grid math, day bucketing, and the three
// deadline-based side panels (closest deadline / oldest tasks / overdue). No Vue/Pinia here,
// so everything is unit-testable — mirrors the pattern in board.js and tree.js.

import { doneValue } from './tree.js';

// Local YYYY-MM-DD for a stored "YYYY-MM-DDTHH:MM"-style date string or a Date instance.
// Strings are read by their literal date prefix (no timezone math) so a calendar day always
// matches what the datetime-local input showed the user. Null for anything falsy/invalid —
// covers a null dateEnd and legacy empty-string CSV imports alike.
export function dateKey(value) {
    if (!value) return null;
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) return null;
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, '0');
        const d = String(value.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    const s = String(value);
    return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null;
}

// Monday-first 6x7 grid of cells for the given month (0-11), including the bleed from
// neighboring months needed to fill full weeks.
export function buildMonthGrid(year, month) {
    const first = new Date(year, month, 1);
    const firstWeekday = (first.getDay() + 6) % 7; // Monday=0 .. Sunday=6
    const start = new Date(year, month, 1 - firstWeekday);

    const cells = [];
    for (let i = 0; i < 42; i++) {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        cells.push({ date, key: dateKey(date), inMonth: date.getMonth() === month });
    }
    return cells;
}

// Buckets todos by calendar day. Every todo buckets into `created`; a todo only buckets into
// `due` when it actually has a dateEnd (tasks default to no due date).
export function bucketTodosByDay(todos) {
    const map = new Map();
    const bucket = (key, list, todo) => {
        if (!key) return;
        if (!map.has(key)) map.set(key, { created: [], due: [] });
        map.get(key)[list].push(todo);
    };
    todos.forEach(t => {
        bucket(dateKey(t.created), 'created', t);
        bucket(dateKey(t.dateEnd), 'due', t);
    });
    return map;
}

function notDone(t) {
    return doneValue(t) < 1;
}

// Not done, has a due date in the future, soonest first.
export function closestDeadlines(todos, now, limit = 5) {
    return todos
        .filter(t => t.dateEnd && notDone(t) && new Date(t.dateEnd) >= now)
        .sort((a, b) => new Date(a.dateEnd) - new Date(b.dateEnd))
        .slice(0, limit);
}

// Not done, oldest created first — every node type has a creation date, due date or not.
export function oldestTasks(todos, limit = 5) {
    return todos
        .filter(notDone)
        .sort((a, b) => new Date(a.created) - new Date(b.created))
        .slice(0, limit);
}

// Not done, due date already passed, most overdue (oldest due date) first.
export function overdueTasks(todos, now, limit = 5) {
    return todos
        .filter(t => t.dateEnd && notDone(t) && new Date(t.dateEnd) < now)
        .sort((a, b) => new Date(a.dateEnd) - new Date(b.dateEnd))
        .slice(0, limit);
}
