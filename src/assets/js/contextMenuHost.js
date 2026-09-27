import { reactive } from 'vue';

// Which item's menu is open; opening one menu closes any other.
const openMenu = reactive({ owner: null });

// Shared by the list, checkbox and bar components (each has showMenu, handleClickOutside and
// handleEscape). Document listeners are attached only while one of the item's popups is open,
// instead of permanently for every item on the board.
export default {
    computed: {
        anyPopupOpen() {
            return !!(this.showMenu || this.showEmojiPicker || this.showColorPallete);
        },
    },
    watch: {
        showMenu(open) {
            if (open) openMenu.owner = this.todo.id;
            else if (openMenu.owner === this.todo.id) openMenu.owner = null;
        },
        anyPopupOpen(open) {
            if (open) {
                document.addEventListener('click', this.handleClickOutside);
                document.addEventListener('keydown', this.handleEscape);
            } else {
                this.removePopupListeners();
            }
        },
    },
    created() {
        this.$watch(() => openMenu.owner, (owner) => {
            if (this.showMenu && owner !== this.todo.id) this.showMenu = false;
        });
    },
    methods: {
        // Clicks inside this item's floating menu (which lives outside the item's element).
        isInsideOwnMenu(target) {
            return target.closest?.('.contextMenu')?.dataset.owner === this.todo.id;
        },
        removePopupListeners() {
            document.removeEventListener('click', this.handleClickOutside);
            document.removeEventListener('keydown', this.handleEscape);
        },
    },
    beforeUnmount() {
        this.removePopupListeners();
        if (openMenu.owner === this.todo.id) openMenu.owner = null;
    },
};
