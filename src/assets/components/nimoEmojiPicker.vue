<template>
    <div class="emojiPicker" @click.stop>
        <div class="controls">
            <input class="searchInput" type="text" v-model="search" placeholder="Search emoji..." @click.stop />
            <button @click="reset" title="Reset to default">reset</button>
            <div class="preview">{{ modelValue || '📝' }}</div>
        </div>

        <div class="grid">
            <template v-if="search.trim()">
                <div class="categoryGrid">
                    <button v-for="e in filtered" :key="e.e" class="emojiButton" :class="{ active: e.e === modelValue }"
                        type="button" :title="e.n" @click="pick(e.e)">{{ e.e }}</button>
                </div>
                <p class="emptyHint" v-if="!filtered.length">No emoji found</p>
            </template>
            <template v-else>
                <div v-for="cat in CATEGORIES" :key="cat.key" class="category">
                    <div class="categoryLabel">{{ cat.label }}</div>
                    <div class="categoryGrid">
                        <button v-for="e in cat.items" :key="e.e" class="emojiButton"
                            :class="{ active: e.e === modelValue }" type="button" :title="e.n" @click="pick(e.e)">{{ e.e }}</button>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
function cat(key, label, pairs) {
    return { key, label, items: pairs.map(([e, n]) => ({ e, n })) };
}

// A curated set, not the full Unicode range — covers what a todo/productivity app actually needs,
// grouped like a normal emoji picker, each tagged with searchable keywords.
const CATEGORIES = [
    cat('smileys', 'Smileys & Emotion', [
        ['😀', 'grinning face happy'], ['😃', 'smiley happy'], ['😄', 'happy smile joy'], ['😁', 'grin'],
        ['😊', 'blush happy'], ['🙂', 'slight smile'], ['😉', 'wink'], ['😍', 'heart eyes love'],
        ['🥳', 'party celebrate'], ['😎', 'cool sunglasses'], ['🤔', 'thinking'], ['😴', 'sleeping tired'],
        ['😢', 'crying sad'], ['😡', 'angry mad'], ['🥺', 'pleading'], ['🤯', 'mind blown shocked'],
        ['😱', 'scream surprised'], ['🤩', 'star struck'], ['🙃', 'upside down'], ['😇', 'innocent halo'],
    ]),
    cat('people', 'People & Body', [
        ['👍', 'thumbs up like'], ['👎', 'thumbs down dislike'], ['👏', 'clap applause'], ['🙌', 'raise hands celebrate'],
        ['🤝', 'handshake deal'], ['💪', 'muscle strong'], ['🙏', 'pray thanks please'], ['👋', 'wave hello bye'],
        ['✌️', 'victory peace'], ['👌', 'ok hand'], ['🧠', 'brain idea'], ['👀', 'eyes look watch'],
        ['🫡', 'salute'],
    ]),
    cat('nature', 'Animals & Nature', [
        ['🐶', 'dog puppy'], ['🐱', 'cat kitten'], ['🦊', 'fox'], ['🦁', 'lion'], ['🐻', 'bear'],
        ['🐼', 'panda'], ['🦝', 'raccoon'], ['🐢', 'turtle'], ['🦋', 'butterfly'], ['🐝', 'bee'],
        ['🌳', 'tree'], ['🌲', 'evergreen tree'], ['🌸', 'blossom flower'], ['🌻', 'sunflower'], ['🍀', 'clover luck garden'],
        ['🌵', 'cactus plant'], ['💧', 'droplet water'], ['🔥', 'fire hot'], ['⭐', 'star'], ['🌙', 'moon night'],
        ['☀️', 'sun sunny'], ['❄️', 'snowflake winter'], ['🌈', 'rainbow'],
    ]),
    cat('food', 'Food & Drink', [
        ['🍎', 'apple fruit'], ['🍕', 'pizza food'], ['🍔', 'burger food'], ['🍩', 'donut'], ['🍦', 'ice cream'],
        ['🍰', 'cake dessert'], ['☕', 'coffee drink'], ['🍵', 'tea drink'], ['🍺', 'beer drink'], ['🍷', 'wine drink'],
        ['🥗', 'salad healthy food'], ['🍪', 'cookie'], ['🍫', 'chocolate'], ['🍉', 'watermelon fruit'],
        ['🍇', 'grapes fruit'], ['🥑', 'avocado'],
    ]),
    cat('activities', 'Activities', [
        ['⚽', 'soccer football sport'], ['🏀', 'basketball sport'], ['🎮', 'video game'], ['🎯', 'dart target goal'],
        ['🎨', 'palette art paint'], ['🎭', 'masks theater'], ['🎬', 'clapper movie'], ['🎥', 'camera video'],
        ['🎸', 'guitar music'], ['🎧', 'headphones music'], ['🏋️', 'weightlifting gym'], ['🚴', 'cycling bike'],
        ['🏆', 'trophy win'], ['🎓', 'graduation school'], ['🎉', 'party popper celebrate'], ['♟️', 'chess strategy'],
    ]),
    cat('travel', 'Travel & Places', [
        ['✈️', 'airplane travel flight'], ['🚗', 'car travel'], ['🚀', 'rocket launch'], ['🏠', 'house home'],
        ['🏫', 'school building'], ['🏢', 'office building work'], ['🏖️', 'beach vacation'], ['⛰️', 'mountain'],
        ['🗺️', 'map travel'], ['🧳', 'luggage travel'], ['⛺', 'tent camping'], ['🚲', 'bicycle bike'],
    ]),
    cat('objects', 'Objects', [
        ['💻', 'laptop computer work'], ['📱', 'phone mobile'], ['📚', 'books study'], ['📝', 'memo note write'],
        ['📅', 'calendar date'], ['⏰', 'alarm clock time'], ['🔒', 'lock secure'], ['🔑', 'key'],
        ['💡', 'bulb idea'], ['🛍️', 'shopping bags'], ['💰', 'money bag'], ['📌', 'pin'],
        ['🧰', 'toolbox tools'], ['🖊️', 'pen write'], ['📷', 'camera photo'], ['🎁', 'gift present'],
        ['🧩', 'puzzle piece'], ['⚙️', 'gear settings'], ['🧹', 'broom clean'], ['🪴', 'potted plant'],
    ]),
    cat('symbols', 'Symbols', [
        ['✅', 'check mark done complete'], ['❌', 'cross mark no'], ['❤️', 'heart love'], ['💯', 'hundred perfect'],
        ['❗', 'exclamation important'], ['❓', 'question'], ['🔴', 'red circle'], ['🟢', 'green circle'],
        ['🔵', 'blue circle'], ['⚠️', 'warning'], ['🚩', 'flag'], ['🔔', 'bell notify'],
        ['➕', 'plus add'], ['➖', 'minus remove'], ['♻️', 'recycle'],
    ]),
];

const ALL_EMOJI = CATEGORIES.flatMap(c => c.items);

export default {
    name: 'nimoEmojiPicker',
    props: {
        modelValue: {
            type: String,
            default: '',
        },
    },
    emits: ['update:modelValue', 'picked'],
    data() {
        return {
            CATEGORIES,
            search: '',
        };
    },
    computed: {
        filtered() {
            const q = this.search.trim().toLowerCase();
            return ALL_EMOJI.filter(e => e.n.includes(q));
        },
    },
    methods: {
        pick(emoji) {
            this.$emit('update:modelValue', emoji);
            this.$emit('picked');
        },
        reset() {
            this.$emit('update:modelValue', '');
            this.$emit('picked');
        },
    },
};
</script>

<style scoped>
.emojiPicker {
    width: clamp(14rem, 90vw, 18rem);

    padding: 0.5rem;
    border: 2px solid #282a30;
    border-radius: 0.25rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);

    background: #1e1f24;
    font-family: inherit;
    color: #fff;

    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.searchInput {
    flex-grow: 1;
    min-width: 0;
    height: 2rem;
    padding: 0.25rem 0.5rem;
    border: 1px solid #383a42;
    border-radius: 0.25rem;
    background: #25262b;
    color: #fff;
}

.controls button {
    height: 2rem;
    padding: 0 0.5rem;
    border: 1px solid #383a42;
    border-radius: 0.25rem;
    background: #25262b;
    color: #fff;
    cursor: pointer;
    white-space: nowrap;
}

.preview {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;

    font-size: 1.25rem;
    border-radius: 50%;
    border: 2px solid #383a42;
    box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.4);
}

.grid {
    max-height: 16rem;
    overflow-y: auto;

    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.categoryLabel {
    margin-bottom: 0.25rem;
    color: #7c8187;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
}

.categoryGrid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.25rem;
}

.emojiButton {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;

    font-size: 1.25rem;
    line-height: 1;

    background: none;
    border: 1px solid transparent;
    border-radius: 0.375rem;

    cursor: pointer;
    transition: 0.15s;
}

.emojiButton:hover {
    background: #282a30;
    border-color: #383a42;
    transform: translateY(-0.0625rem);
}

.emojiButton.active {
    background: #282a30;
    border-color: #00aaff;
}

.emptyHint {
    color: #52565a;
    font-size: 0.8rem;
    text-align: center;
    padding: 0.5rem 0;
}
</style>
