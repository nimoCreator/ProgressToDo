<template>
    <div class="calendarView" @click.stop>
        <div class="calendarMain">
            <div class="calendarHeader">
                <SimpleButton class="small" icon="chevron_left" title="Previous month" @click="prevMonth" />
                <span class="monthLabel">{{ monthLabel }}</span>
                <SimpleButton class="small" icon="chevron_right" title="Next month" @click="nextMonth" />
                <SimpleButton class="small today" icon="today" label="Today" @click="goToday" />
            </div>

            <div class="weekdays">
                <span v-for="d in weekdayLabels" :key="d">{{ d }}</span>
            </div>

            <div class="monthGrid">
                <button v-for="cell in gridWithCounts" :key="cell.key" type="button" class="dayCell" :class="{
                    outside: !cell.inMonth, today: cell.key === todayKey, selected: cell.key === selectedDay,
                }" @click="selectedDay = cell.key">
                    <span class="dayNumber">{{ cell.date.getDate() }}</span>
                    <span class="dayBadges" v-if="cell.createdCount || cell.dueCount">
                        <span class="badge created" v-if="cell.createdCount" :title="cell.createdCount + ' created'">{{ cell.createdCount }}</span>
                        <span class="badge due" v-if="cell.dueCount" :title="cell.dueCount + ' due'">{{ cell.dueCount }}</span>
                    </span>
                </button>
            </div>

            <div class="dayDetail">
                <h3>{{ selectedDayLabel }}</h3>
                <div class="dayLists">
                    <div class="dayList">
                        <div class="dayListTitle">Created</div>
                        <p class="emptyHint" v-if="!selectedCreated.length">Nothing created this day</p>
                        <div class="chipList">
                            <div v-for="t in selectedCreated" :key="t.id" class="chipRow" @click="$emit('goto', t.id)">
                                <TaskChip :task="toChip(t)" />
                            </div>
                        </div>
                    </div>
                    <div class="dayList">
                        <div class="dayListTitle">Due</div>
                        <p class="emptyHint" v-if="!selectedDue.length">Nothing due this day</p>
                        <div class="chipList">
                            <div v-for="t in selectedDue" :key="t.id" class="chipRow" @click="$emit('goto', t.id)">
                                <TaskChip :task="toChip(t)" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="calendarSide">
            <div class="sidePanel closest">
                <div class="sidePanelTitle"><span class="material-symbols-rounded icon">flag</span> Closest deadline</div>
                <p class="emptyHint" v-if="!closest.length">Nothing on the horizon</p>
                <div class="chipList">
                    <div v-for="t in closest" :key="t.id" class="chipRow" @click="$emit('goto', t.id)">
                        <TaskChip :task="toChip(t)" />
                    </div>
                </div>
            </div>

            <div class="sidePanel oldest">
                <div class="sidePanelTitle"><span class="material-symbols-rounded icon">history</span> Oldest tasks</div>
                <p class="emptyHint" v-if="!oldest.length">Nothing open yet</p>
                <div class="chipList">
                    <div v-for="t in oldest" :key="t.id" class="chipRow" @click="$emit('goto', t.id)">
                        <TaskChip :task="toChip(t)" />
                    </div>
                </div>
            </div>

            <div class="sidePanel overdue">
                <div class="sidePanelTitle"><span class="material-symbols-rounded icon">warning</span> Overdue</div>
                <p class="emptyHint" v-if="!overdue.length">Nothing overdue</p>
                <div class="chipList">
                    <div v-for="t in overdue" :key="t.id" class="chipRow" @click="$emit('goto', t.id)">
                        <TaskChip :task="toChip(t)" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { buildMonthGrid, bucketTodosByDay, closestDeadlines, dateKey, oldestTasks, overdueTasks } from '@/assets/js/calendar.js';
import TaskChip from '@/assets/components/TaskChip.vue';
import SimpleButton from '@/assets/ui/SimpleButton.vue';

// A Monday, purely as an anchor to read locale-aware weekday short names off of.
const A_MONDAY = new Date(2024, 0, 1);

export default {
    name: 'CalendarView',
    components: { TaskChip, SimpleButton },
    props: {
        // Live (non-archived), flattened todos — pass store.liveFlattenedTodos.
        todos: { type: Array, required: true },
    },
    emits: ['goto'],
    data() {
        const today = new Date();
        return {
            viewYear: today.getFullYear(),
            viewMonth: today.getMonth(),
            selectedDay: dateKey(today),
            todayKey: dateKey(today),
        };
    },
    computed: {
        weekdayLabels() {
            return Array.from({ length: 7 }, (_, i) => {
                const d = new Date(A_MONDAY.getFullYear(), A_MONDAY.getMonth(), A_MONDAY.getDate() + i);
                return d.toLocaleDateString(undefined, { weekday: 'short' });
            });
        },
        monthLabel() {
            return new Date(this.viewYear, this.viewMonth, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        },
        grid() {
            return buildMonthGrid(this.viewYear, this.viewMonth);
        },
        dayBuckets() {
            return bucketTodosByDay(this.todos);
        },
        gridWithCounts() {
            return this.grid.map(cell => ({
                ...cell,
                createdCount: this.dayBuckets.get(cell.key)?.created.length || 0,
                dueCount: this.dayBuckets.get(cell.key)?.due.length || 0,
            }));
        },
        selectedDayLabel() {
            if (!this.selectedDay) return '';
            const [y, m, d] = this.selectedDay.split('-').map(Number);
            return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        },
        selectedCreated() {
            return this.dayBuckets.get(this.selectedDay)?.created || [];
        },
        selectedDue() {
            return this.dayBuckets.get(this.selectedDay)?.due || [];
        },
        closest() {
            return closestDeadlines(this.todos, new Date());
        },
        oldest() {
            return oldestTasks(this.todos);
        },
        overdue() {
            return overdueTasks(this.todos, new Date());
        },
    },
    methods: {
        prevMonth() {
            const d = new Date(this.viewYear, this.viewMonth - 1, 1);
            this.viewYear = d.getFullYear();
            this.viewMonth = d.getMonth();
        },
        nextMonth() {
            const d = new Date(this.viewYear, this.viewMonth + 1, 1);
            this.viewYear = d.getFullYear();
            this.viewMonth = d.getMonth();
        },
        goToday() {
            const today = new Date();
            this.viewYear = today.getFullYear();
            this.viewMonth = today.getMonth();
            this.selectedDay = dateKey(today);
        },
        toChip(todo) {
            const medals = [];
            if (todo.star) medals.push('star');
            if (todo.urgent) medals.push('urgent');
            if (todo.archived) medals.push('archived');
            return {
                id: todo.id,
                text: todo.text || 'No Text',
                color: todo.color || '#888888',
                medals,
                type: todo.type === 'checkbox' ? 'checkBox' : todo.type || 'other',
            };
        },
    },
};
</script>

<style scoped>
.calendarView {
    position: fixed;
    inset: 0;
    overflow: auto;

    display: flex;
    gap: 1.5rem;

    padding: 5.5rem 2rem 6rem;

    background-color: #15161a;
    background-image: radial-gradient(#2a2c32 1px, transparent 1.5px);
    background-size: 24px 24px;
}

.calendarMain {
    flex: 1 1 auto;
    min-width: 0;

    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.calendarHeader {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.calendarHeader .monthLabel {
    flex-grow: 1;
    text-align: center;
    font-size: 1.15rem;
    font-weight: 700;
    text-transform: capitalize;
}

.calendarHeader .today {
    margin-left: 0.5rem;
}

.weekdays,
.monthGrid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
}

.weekdays {
    color: #7c8187;
    font-size: 0.75rem;
    text-transform: uppercase;
    text-align: center;
    padding: 0 0.25rem;
}

.dayCell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 0.25rem;

    aspect-ratio: 1 / 1;
    min-height: 3.5rem;
    padding: 0.375rem;

    color: #c9cacf;
    background-color: #1e1f24;
    border: 1px solid #282a30;
    border-radius: 0.5rem;

    cursor: pointer;
    user-select: none;
    transition: 0.15s;
}

.dayCell:hover {
    background-color: #282a30;
    transform: translateY(-0.0625rem);
}

.dayCell.outside {
    color: #52565a;
    background-color: #17171a;
}

.dayCell.today {
    border-color: #00aaff;
}

.dayCell.selected {
    background-color: color-mix(in srgb, #00aaff 25%, #1e1f24);
    border-color: #00aaff;
}

.dayCell .dayNumber {
    font-variant-numeric: tabular-nums;
    font-size: 0.85rem;
}

.dayCell .dayBadges {
    display: flex;
    gap: 0.25rem;
}

.dayCell .badge {
    min-width: 1.125rem;
    padding: 0 0.25rem;
    border-radius: 0.75rem;

    font-size: 0.625rem;
    font-weight: 700;
    text-align: center;
    color: #fff;
}

.dayCell .badge.created {
    background-color: #316841;
}

.dayCell .badge.due {
    background-color: #a86b1f;
}

.dayDetail {
    margin-top: 0.5rem;
    padding: 1rem;

    background-color: #1e1f24;
    border: 1px solid #282a30;
    border-radius: 0.75rem;
}

.dayDetail h3 {
    margin-bottom: 0.75rem;
    font-size: 0.95rem;
    text-transform: capitalize;
}

.dayLists {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.dayListTitle,
.sidePanelTitle {
    display: flex;
    align-items: center;
    gap: 0.375rem;

    margin-bottom: 0.5rem;

    color: #7c8187;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
}

.sidePanelTitle .icon {
    font-size: 1rem;
}

.emptyHint {
    color: #52565a;
    font-size: 0.8rem;
}

.chipList {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.chipRow {
    cursor: pointer;
    background-color: #282a30;
    border: 1px solid #3c3e43;
    border-radius: 0.5rem;
    transition: 0.15s;
}

.chipRow:hover {
    background-color: #5e5e5e;
    transform: translateY(-0.0625rem);
}

.calendarSide {
    flex: 0 0 20rem;

    display: flex;
    flex-direction: column;
    gap: 1rem;

    align-self: flex-start;
}

.sidePanel {
    padding: 1rem;

    background-color: #1e1f24;
    border: 1px solid #282a30;
    border-radius: 0.75rem;
}

.sidePanel.overdue {
    border-color: color-mix(in srgb, #d43a3a 60%, #282a30);
}

.sidePanel.overdue .sidePanelTitle {
    color: #f57b18;
}
</style>
