<template>
    <div class="aiSuggestions">
        <div class="assistant">
            <div class="pfp">
                <div class="dice" :style="{ '--rx': rx + 'deg', '--ry': ry + 'deg', '--rz': rz + 'deg' }">
                    <div class="diceSide"><span class="material-symbols-rounded">close</span></div>
                    <div class="diceSide"><span class="material-symbols-rounded">circle</span></div>
                    <div class="diceSide"><span class="material-symbols-rounded">change_history</span></div>
                    <div class="diceSide"><span class="material-symbols-rounded">square</span></div>
                    <div class="diceSide"><span class="material-symbols-rounded">pentagon</span></div>
                    <div class="diceSide"><span class="material-symbols-rounded">hexagon</span></div>
                </div>
            </div>
            <div class="buttonDiv">
                <button class="nextButton" @click="rollForSuggestion">Choose Next Task</button>
            </div>
        </div>
        <div class="suggestion">
            <template v-if="mode == 'luck'">
                <div class="roulette" :style="{ '--rr': rr + 'deg', '--rrOffset': rrOffset + 'deg' }" :class="{'rolling' : rolling, hidden: !rolling}">
                    <div class="slot slot1" :style="{ '--focus': calcRouletteFocus(0) }">
                        <TaskChip v-if="rouletteSuggestions[0]" :task="rouletteSuggestions[0]" />
                    </div>
                    <div class="slot slot2" :style="{ '--focus': calcRouletteFocus(1) }">
                        <TaskChip v-if="rouletteSuggestions[1]" :task="rouletteSuggestions[1]" />
                    </div>
                    <div class="slot slot3" :style="{ '--focus': calcRouletteFocus(2) }">
                        <TaskChip v-if="rouletteSuggestions[2]" :task="rouletteSuggestions[2]" />
                    </div>
                    <div class="slot slot4" :style="{ '--focus': calcRouletteFocus(3) }">
                        <TaskChip v-if="rouletteSuggestions[3]" :task="rouletteSuggestions[3]" />
                    </div>
                    <div class="slot slot5" :style="{ '--focus': calcRouletteFocus(4) }">
                        <TaskChip v-if="rouletteSuggestions[4]" :task="rouletteSuggestions[4]" />
                    </div>
                </div>
                <div class="finalSuggestion" v-if="!rolling && currentSuggestion" @click="scrollToItem(currentSuggestion.id)">
                    <TaskChip :task="currentSuggestion" />
                </div>
                <div class="finalSuggestion" v-else-if="!rolling">
                    Roll for a next task!
                </div>
            </template>
        </div>
        <div class="settings">
            <div class="settingInputWrapper" v-if="mode == 'ai'">
                <span class="label">Google API Key</span>
                <input class="settingInput" v-model="key" type="text" placeholder="Enter your Google API Key here..." />
            </div>
            <div class="settingWrapper">
                <div class="switcher">
                    <div class="switcherSide left" @click="mode = 'luck'" title="Randomise next task">
                        <span class="material-symbols-rounded icon">
                            casino
                        </span>
                    </div>
                    <div class="switcherSide right" @click="mode = 'ai'" title="Use AI to suggest next task">
                        <span class="material-symbols-rounded icon">
                            network_intel_node
                        </span>
                    </div>
                    <div class="switcherSelector" :class="{ left: mode === 'luck', right: mode === 'ai' }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import TaskChip from "./TaskChip.vue";
import { useTodosStore } from '@/assets/stores/globalStorage.js';

export default {
    name: "AiSuggestion",
    components: {
        TaskChip
    },
    setup() {
        const store = useTodosStore();
        return { store };
    },
    data() {
        return {
            mode: 'luck',
            key: "AIzaSyBCSv76chFGm5i4sLqh1SrIYfc4JiLDpvc",

            rx: 0,
            ry: 0,
            rz: 0,

            vrx: 0,
            vry: 0,
            vrz: 0,

            arx: 0,
            ary: 0,
            arz: 0,


            rr: 0,
            rrOffset: 25,
            currentSuggestion: null,
            rouletteSuggestions: [],
            rolling: false,
            rrStep: 1,

            rrDamping: 0.98,
            rrStepDamping: 0.97,
        }
    },
    methods: {
        toTaskChip(todo) {
            if (!todo) return null;
            const medals = [];
            if (todo.star) medals.push("star");
            if (todo.urgent) medals.push("urgent");
            if (todo.archived) medals.push("archived");
            return {
                id: todo.id,
                text: todo.text || "No Text",
                color: todo.color || "#888888",
                medals,
                type: todo.type === "checkbox" ? "checkBox" : todo.type || "other",
            };
        },
        randomiseAccelerations() {
            this.arx = (Math.random() - 0.5) * 0.01;
            this.ary = (Math.random() - 0.5) * 0.01;
            this.arz = (Math.random() - 0.5) * 0.01;
        },
        updateRotation() {
            this.vrx += this.arx;
            this.vry += this.ary;
            this.vrz += this.arz;

            this.rx += this.vrx;
            this.ry += this.vry;
            this.rz += this.vrz;

            this.vrx *= 0.98;
            this.vry *= 0.98;
            this.vrz *= 0.98;

            if (Math.random() < 0.002) {
                this.randomiseAccelerations();
            }

            requestAnimationFrame(() => this.updateRotation());
        },
        fillInRoulette() {
            this.currentSuggestion = this.getRandomSuggestion();
            this.rouletteSuggestions = [];
            for (let i = 0; i < 5; i++) {
                this.rouletteSuggestions.push(this.getRandomSuggestion());
            }
        },
        getRandomSuggestion() {
            const tasks = this.mappedTodos;
            if (tasks.length === 0) return null;
            const randomIndex = Math.floor(Math.random() * tasks.length);
            return tasks[randomIndex];
        },
        rotateRoulette() {

            this.rr += this.rrStep;
            this.rrStep *= this.rrStepDamping; 
            this.rr *= this.rrDamping;

            if (this.rr >= this.rrOffset) {
                this.rr = this.rr % this.rrOffset;

                for (let i = this.rouletteSuggestions.length - 1; i > 0; i--) {
                    this.rouletteSuggestions[i] = this.rouletteSuggestions[i - 1];
                }
                this.rouletteSuggestions[0] = this.getRandomSuggestion();
            }

            if( this.rrStep < 0.05 && this.rr < 0.5 ) 
            {
                this.rolling = false;
                this.currentSuggestion = this.rouletteSuggestions[2];
            }
            else
            {
                requestAnimationFrame(() => this.rotateRoulette());
            }
        },
        rollForSuggestion() {
            this.rrStep = 10 + Math.random() * 5;
            this.rrStepDamping = 0.94 + Math.random() * 0.055;
            this.rrDamping = 0.97 + Math.random() * 0.025;
            this.fillInRoulette();
            this.rolling = true;
            this.rotateRoulette();
        },
        calcRouletteFocus(slotIndex) {
            const slotOffset = (slotIndex - 2) * this.rrOffset;
            const slotAngle = ((this.rr + slotOffset) % 360 + 360) % 360; // 0..360
            const diff = Math.min(slotAngle, 360 - slotAngle); // distance to 0deg
            const focusRange = Math.max(1, Math.abs(this.rrOffset) * 1.5); // fade by one offset
            return Math.max(0, 1 - diff / focusRange);
        },
        scrollToItem(id) {
            this.$nextTick(() => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('highlight-item');
                    setTimeout(() => {
                        element.classList.remove('highlight-item');
                    }, 2000);
                    this.closeAllModals();
                }
            });
        },
    },
    mounted() {
        this.rx = (Math.random() - 0.5) * 100;
        this.ry = (Math.random() - 0.5) * 100;
        this.rz = (Math.random() - 0.5) * 100;

        this.randomiseAccelerations();
        this.updateRotation();

        this.fillInRoulette();
    },
    watch: {
        'store.todos': {
            handler() {
                this.fillInRoulette();
            },
            deep: true
        }
    },
    computed: {
        todos() { return this.store?.flattenedTodos || []; },
        mappedTodos() { return this.todos.map(this.toTaskChip).filter(Boolean); },
    }
}

</script>


<style lang="css" scoped>
.aiSuggestions {
    position: sticky;
    top: 1rem;
    z-index: 10;

    display: grid;
    grid-template-areas: 'i s';
    grid-template-columns: auto 1fr;

    width: clamp(40rem, 75vw, 90vw);

    background-color: #17171a;

    border-radius: 10rem 2rem 2rem 10rem;
    border: 0.125rem #464749 solid;
    padding-right: 1rem;

    box-shadow: 0 0 1rem 0.5rem #15161a;
}

/* #region ASSISTANT */

.assistant {
    grid-area: i;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: 10rem;
    height: 10rem;

    padding: 1rem;

    position: relative;
}

.buttonDiv {
    position: absolute;
    bottom: 1.5rem;

    display: flex;
    justify-content: center;
    align-items: center;

    width: 100%;
}

/* #region DICE */
.pfp {
    width: 10rem;
    height: 10rem;

    display: flex;
    justify-content: center;
    align-items: center;

    perspective: 20rem;
    transform-origin: center;
}

.dice {
    user-select: none;

    position: relative;

    width: var(--a);
    height: var(--a);

    transform-style: preserve-3d;

    display: flex;
    justify-content: center;
    align-items: center;

    --a: 5rem;
    --a2: calc(var(--a) / 2);

    transform: rotateX(var(--rx)) rotateY(var(--ry)) rotateZ(var(--rz));
    transform-origin: center;
}

.diceSide {
    position: absolute;
    top: 0;
    left: 0;

    width: var(--a);
    height: var(--a);

    outline: solid 0.125px #1c2b2f;
    border: 0.25rem #1c2b2f solid;
    border-color: #0d0f10 #050505 #20272a #090c0e;
    background: #aaa;
    background: radial-gradient(#000000, #0d0f10, #182326);

    display: flex;
    justify-content: center;
    align-items: center;

    font-size: 1.5rem;
    color: #fff;
    text-shadow: 0 0 1rem #00aaff;

    transform-origin: center;
}

.diceSide:nth-child(1) {
    transform: rotateY(0deg) translateZ(var(--a2));
}

.diceSide:nth-child(2) {
    transform: rotateX(180deg) translateZ(var(--a2));
}

.diceSide:nth-child(3) {
    transform: rotateX(90deg) translateZ(var(--a2));
}

.diceSide:nth-child(4) {
    transform: rotateX(-90deg) translateZ(var(--a2));
}

.diceSide:nth-child(5) {
    transform: rotateY(90deg) translateZ(var(--a2));
}

.diceSide:nth-child(6) {
    transform: rotateY(-90deg) translateZ(var(--a2));
}

/* #endregion DICE  */

/* #endregion ASSISTANT */

/* #region SUGGESTIONS */

.suggestion {
    grid-area: s;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    padding: 1rem;

    position: relative;
    width: 100%;
    overflow: hidden;
}

.finalSuggestion {
    display: flex;
    justify-content: center;
    align-items: center;

    height: 3rem;

    position: relative;
    z-index: 2;
    width: 100%;
    overflow: hidden;

    outline: solid 0.0625rem #797a7d;
    border: 0.0625rem #464749 solid;
    border-radius: 1rem;
}

.finalSuggestion a,
.finalSuggestion .taskChip {
    max-width: 100%;
}

.finalSuggestion a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}


.suggestion .roulette {
    z-index: 20;
    
    display: flex;
    align-items: center;
    justify-content: center;

    position: absolute;

    width: 100%;
    height: 100%;

    perspective: 50rem;
    transform-origin: 1rem 1rem center;

    --rrOffset: 30deg;
    --slotDepth: 6.5rem;
    --NslotDepth: calc( -1 * var(--slotDepth));
    --slotBlur: 0.35rem;
    --slotGlow: rgba(0, 170, 255, 0.25);

    transition: 0.2s;
    
    overflow: hidden;
}
.suggestion .roulette.hidden {
    transition: 1s;

    opacity: 0;
    filter: blur(1rem);
}

.suggestion .roulette .slot {
    position: absolute;

    display: flex;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 3rem;

    background: linear-gradient(180deg, rgba(20, 24, 28, 0.9), rgba(8, 10, 12, 0.9));
    border: 1px solid rgba(60, 70, 80, 0.7);
    border-radius: 0.75rem;

    opacity: calc(0.25 + (0.75 * var(--focus)));
    filter: blur(calc(var(--slotBlur) * (1 - var(--focus))));
    transform-style: preserve-3d;
    transition: opacity 0.15s ease, filter 0.15s ease;
}

.suggestion .roulette .slot1 {  transform: translateZ(var(--NslotDepth)) rotateX(calc(var(--rr) - calc(var(--rrOffset) * 2))) translateZ(var(--slotDepth)); }
.suggestion .roulette .slot2 {  transform: translateZ(var(--NslotDepth)) rotateX(calc(var(--rr) - calc(var(--rrOffset)))) translateZ(var(--slotDepth));}
.suggestion .roulette .slot3 {  transform: translateZ(var(--NslotDepth)) rotateX(var(--rr)) translateZ(var(--slotDepth));}
.suggestion .roulette .slot4 {  transform: translateZ(var(--NslotDepth)) rotateX(calc(var(--rr) + calc(var(--rrOffset)))) translateZ(var(--slotDepth));}
.suggestion .roulette .slot5 {  transform: translateZ(var(--NslotDepth)) rotateX(calc(var(--rr) + calc(var(--rrOffset) * 2))) translateZ(var(--slotDepth));}

/* #endregion SUGGESTIONS */

/* #region SETTINGS */

.settings {
    position: absolute;
    top: calc(100% + 0.5rem);

    width: 100%;

    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: flex-end;
    gap: 0.25rem;

    font-size: 0.875rem;
}

.settingInputWrapper {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    align-items: center;
    gap: 0.125rem;
}

.settingInput {
    background: #0d1012;
    border: none;
    border-radius: 1rem;
    padding: 0.25rem 0.5rem;
    color: white;

    width: 5rem;
}

.settingInput::placeholder {
    color: #464749;
}

.label {
    color: #464749;
    font-size: 0.5rem;
    font-weight: 500;
    user-select: none;

    z-index: 5;
    bottom: 100%;
}

.settingWrapper {
    display: flex;
    flex-direction: row;
    align-items: center;

    position: relative;
}


/* #region SWITCHER */

.switcher {
    position: relative;

    display: grid;
    grid-template-columns: 1fr 1fr;

    background: #0d1012;
    border-radius: 2rem;
}

.switcherSide {
    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 0.25rem 0.5rem;

    cursor: pointer;

    z-index: 2;
}

.switcher .switcherSelector {
    position: absolute;
    top: 0.0625rem;

    width: calc(50% - 0.125rem);
    height: calc(100% - 0.125rem);

    background: #00aaff;
    border-radius: 2rem;

    transition: left 0.3s ease;
}

.switcher .switcherSelector.left {
    left: 0.125rem;
}

.switcher .switcherSelector.right {
    left: calc(50% + 0.125rem);
}

/* #endregion SWITCHER */

/* #endregion SETTINGS */
</style>
