import { countArchived, setArchived } from '@/assets/js/tree.js';

// Shared by the list, checkbox and bar components.
// The archive view renders the same live data as the board, read-only: archived items at full
// opacity and the rest of their list tree dimmed for context.
export default {
    inject: {
        // Provided by BoardCanvas: true inside the archive view.
        archiveMode: { default: false },
    },
    props: {
        // True when a list above this node is archived.
        inheritedArchived: { type: Boolean, default: false },
    },
    computed: {
        effectivelyArchived() {
            return this.inheritedArchived || !!this.todo.archived;
        },
        archiveClasses() {
            return {
                readOnly: this.archiveMode,
                archiveContext: this.archiveMode && !this.effectivelyArchived,
            };
        },
        // In the archive view only items archived on their own have a menu (restore / delete).
        hasMenu() {
            return !this.archiveMode || !!this.todo.archived;
        },
        archivedLabel() {
            if (!this.archiveMode || !this.todo.archived || !this.todo.archivedAt) return null;
            return `Archived ${new Date(this.todo.archivedAt).toLocaleString()}`;
        },
    },
    methods: {
        restoreFromArchive() {
            setArchived(this.todo, false);
            this.showMenu = false;
        },
        deleteFromArchive() {
            const name = this.todo.text ? `"${this.todo.text}"` : 'this item';
            if (confirm(`Permanently delete ${name}? This cannot be undone.`)) {
                this.$emit('deleteToDo', this.todo);
            }
        },
        // Deleting a live list also deletes the archived items it holds, so ask first.
        confirmDeleteWithArchived() {
            const archived = countArchived(this.todo);
            if (!archived) return true;
            return confirm(`This list holds ${archived} archived item${archived === 1 ? '' : 's'}, which will be deleted too. Delete it?`);
        },
    },
};
