<template>
    <div class="battlePass" @mouseleave="scrollToCurrentReward">
        <aside class="battlePassLevelCircle">
            <div class="circleProgressBar">
                <svg :width="180" :height="180" viewBox="0 0 180 180">
                    <circle class="trail" :cx="90" :cy="90" :r="circleRadius" :stroke-width="14" fill="none" />
                    <circle class="path" :cx="90" :cy="90" :r="circleRadius" :stroke-dasharray="circleLength"
                        :stroke-dashoffset="dashOffset" :stroke-width="14" fill="none" />
                </svg>
                <div class="center">
                    <div class="levelNumber">{{ level }}</div>
                    <div class="levelLabel">level</div>
                </div>
            </div>
        </aside>

        <div id="battlePassTrackWrapper">
            <section id="battlePassTrack" ref="track">
                <div class="rewardsRow">
                    <div class="reward" v-for="reward in rewards" :key="reward.id" :data-id="reward.id"
                        :class="{ active: reward.id <= level, [reward.description]: true, current: reward.id == level }">
                        <!-- <div class="particles" v-if="reward.id == level">
                            <div 
                                class="particle" 
                                v-for="i in 50" 
                                :key="i"
                                :style="{
                                    '--animationDelay': '-'+(1+Math.random()*5)+'s',
                                    '--animationTime': (1+Math.random()*5)+'s',
                                    ...targetXY(),
                                }"
                                >
                            </div>
                        </div> -->
                        <span class="material-symbols-rounded rewardIcon">{{ reward.icon }}</span>
                        <div class="rewardDescription">{{ reward.description }}</div>
                        <div class="rewardTail"></div>
                    </div>
                </div>

                <div class="progressTrack">
                    <template v-for="lv in levels" :key="lv">
                        <div class="node" :class="{ active: lv <= level }">
                            <div class="nodeInner">{{ lv }}</div>
                        </div>
                        <div v-if="lv < levelsCount - 1" class="trial"
                            :style="{ '--partial': (levelProgressForLvl(lv)) + '%' }"
                            :class="{ finished: lv < level, current: lv === level, waiting: lv > level }">
                            <StarFourPointsIcon v-if="lv == level" />
                        </div>
                    </template>
                </div>
                <div class="progressEnding">
                    <span class="material-symbols-rounded">more_horiz</span>
                </div>
            </section>
        </div>
    </div>
</template>

<script>

import StarFourPointsIcon from '../svg/StarFourPointsIcon.vue';

export default {
    components: {
        StarFourPointsIcon
    },
    props: {
        doneCount: {
            type: Number,
            required: true
        },
        totalCount: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            iconPool: [
                "grade", "bolt", "swords", "star", "wallet", "pets", "favorite", "psychiatry",
                "sports_esports", "emoji_events", "diamond", "workspace_premium", "stadia_controller",
                "local_fire_department", "shield", "auto_awesome", "military_tech", "magic_button", "redeem", "rocket"
            ]
        };
    },
    methods: {
        getLevel(done) {
            if (done < 0) return 0;
            return Math.floor(Math.sqrt(done));
        },
        levelProgressForLvl(lv) {
            if (lv === this.level) return this.levelProgress * 100;
            if (lv < this.level) return 100;
            return 0;
        },
        centerScrollTo(el) {
            const container = this.$refs.track;
            if (!container || !el) return;

            const cRect = container.getBoundingClientRect();
            const eRect = el.getBoundingClientRect();
            const elementLeft = (eRect.left - cRect.left) + container.scrollLeft;
            const targetLeft = elementLeft + (el.offsetWidth / 2) - (container.clientWidth / 2);
            const prevSnap = container.style.scrollSnapType;
            
            container.style.scrollSnapType = 'none';
            container.scrollTo({ left: Math.max(0, Math.round(targetLeft)), behavior: 'smooth' });
            window.setTimeout(() => { container.style.scrollSnapType = prevSnap || ''; }, 350);
        },
        scrollToCurrentReward() {
            this.$nextTick(() => {
                const container = this.$refs.track;
                if (!container) return;
                const target = container.querySelector(`.reward[data-id="${this.level}"]`);
                if (target) this.centerScrollTo(target);
            });
        },
        getDescription(i) {
            return i == 0 ? "Common" :
                i % 23 === 0 ? 'Eternal' :
                    i % 19 === 0 ? 'Masterwork' :
                        i % 17 === 0 ? 'Relic' :
                            i % 13 === 0 ? 'Mythic' :
                                i % 11 === 0 ? 'Legendary' :
                                    i % 7 === 0 ? 'Epic' :
                                        i % 5 === 0 ? 'Rare' :
                                            i % 3 === 0 ? 'Uncommon' :
                                                'Common'
        },
        pickIcon(id) {
            return this.iconPool[id % this.iconPool.length];
        },
        // targetXY(){
        //     let x = 0, y = 0;
        //     switch( Math.floor(Math.random()*4)) {
        //         case 0:
        //             x = Math.round(Math.random()*100)+'%';
        //             y = "100%";
        //             break;
        //         case 1:
        //             x = Math.round(Math.random()*100)+'%';
        //             y = "0%";
        //             break;
        //         case 2: 
        //             x = "100%";
        //             y = Math.round(Math.random()*100)+'%';
        //             break;
        //         case 3:
        //             x = "0%";
        //             y = Math.round(Math.random()*100)+'%';
        //             break;
        //     }
        //     return { '--targetX': x,
        //             '--targetY': y, }
        // }

    },
    computed: {

        level() {
            return Math.ceil(this.getLevel(this.doneCount));
        },

        nextLevelRequirement() {
            return (this.level + 1) * (this.level + 1);
        },

        todosToNextLevel() {
            return Math.max(0, this.nextLevelRequirement - this.doneCount);
        },

        todosInCurrentLevel() {
            return 2 * this.level + 1;
        },

        todosDoneWithinLevel() {
            return this.doneCount - this.level * this.level;
        },

        levelProgress() {
            return this.todosInCurrentLevel === 0 ? 1 : (this.todosDoneWithinLevel / this.todosInCurrentLevel);
        },
        levels() {
            return Array.from({ length: this.getLevel(this.totalCount) + 2 }, (_, i) => i);
        },
        levelsCount() {
            return this.levels.length;
        },
        circleRadius() {
            return 70; // px
        },
        circleLength() {
            return 2 * Math.PI * this.circleRadius;
        },
        dashOffset() {
            return this.circleLength * (1 - this.levelProgress);
        },
        rewards() {
            return Array.from({ length: this.getLevel(this.totalCount) + 2 }, (_, i) => ({
                id: i,
                name: `Reward ${i}`,
                description: this.getDescription(i),
                icon: this.pickIcon(i),
            }))
        }
    },
    watch: {
        level() {
            this.scrollToCurrentReward();
        }
    },
    mounted() {
        this.scrollToCurrentReward();
    }
}

</script>

<style scoped>

.battlePass {
    position: sticky;
    top: 1rem;
    z-index: 10;

    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0;
    align-items: stretch;
    justify-content: start;

    --lvlIndicatorWidth: 2rem;
    --lvlTrailWidth: 6rem;

    width: clamp(40rem, 75vw, 90vw);

    background-color: #17171a;

    border-radius: 10rem 2rem 2rem 10rem;
    border: 0.125rem #464749 solid;
    padding-right: 1rem;

    box-shadow: 0 0 1rem 0.5rem #15161a;
}

/*  #region BATTLE PASS CIRCLE PROGRESS INDICATOR */

.battlePassLevelCircle {
    display: flex;
}

.circleProgressBar {
    position: relative;
    width: 180px;
    height: 180px;
    display: grid;
    place-items: center;
}

.circleProgressBar svg {
    transform: rotate(-90deg);
}

.trail {
    stroke: #2b2d33;
    stroke-linecap: round;
}

.path {
    stroke: #00aaff;
    stroke-linecap: round;
    transition: stroke-dashoffset .3s ease;
}

.circleProgressBar .center {
    position: absolute;

    display: flex;
    flex-direction: column;
    place-items: center;
    text-align: center;

    gap: .125rem;
}

.levelNumber {
    font-size: 4em;
    font-weight: 800;
    color: #eaeaea;
    line-height: 1;
}

.levelLabel {
    font-size: .75rem;
    color: #a8abb2;
}

.subprogress {
    font-size: .75rem;
    color: #a8abb2;
}

/* #endregion BATTLE PASS CIRCLE PROGRESS INDICATOR */

#battlePassTrackWrapper {
    display: flex;
    width: 100%;

    overflow-x: visible;
    overflow-y: hidden;

    position: relative;
}
#battlePassTrackWrapper:before,
#battlePassTrackWrapper:after {
    content: "";
    position: absolute;
    height: 100%;
    width: 15%;
    z-index: 20;
    pointer-events: none;
}
#battlePassTrackWrapper:before {
    left: 0;
    background: linear-gradient(90deg, #17171a, #0000 80%);
}
#battlePassTrackWrapper:after {
    right: 0;
    background: linear-gradient(-90deg, #17171a, #0000 80%);
}

#battlePassTrack {

    overflow-x: auto;
    scroll-snap-type: x proximity;
    scroll-padding-inline: 50%;
    padding-bottom: .5rem;

    display: grid;
    grid-template-areas: 'r e' 't e';
    grid-template-rows: 1fr auto;
    gap: 0.25rem;
    justify-content: start;
    align-items: stretch;

    position: relative;
}

.trackOverlay {
    position: sticky;
    inset: 0;
    z-index: 100;
    pointer-events: none;
    /* najwazniejsze: rozciagnij na cala siatke, niech NIE tworzy nowego wiersza */
    grid-column: 1 / -1;
    grid-row: 1 / -1;
    /* rownowaznie mogloby byc: grid-area: 1 / 1 / -1 / -1; */
}

.trackOverlay::before,
.trackOverlay::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 64px;
    height: 100%;
}

.trackOverlay::before {
    left: 0;
    background: red;
}

.trackOverlay::after {
    right: 0;
    background: green;
}

.rewardsRow {
    grid-area: r;

    display: flex;
    align-items: flex-end;
    padding: .5rem 1rem 1.25rem;

    gap: var(--lvlIndicatorWidth, 2rem);
}

/* #region RARITIES COLORS */

.reward.Common { --rarityColor: #8a9ba8; --inactiveColor: #5a6b78; }
.reward.Uncommon { --rarityColor: #5fe22b; --inactiveColor: #3fa01b; }
.reward.Rare { --rarityColor: #2b65e2; --inactiveColor: #1b45a2; }
.reward.Epic { --rarityColor: #8a2be2; --inactiveColor: #5a1ba2; }
.reward.Legendary { --rarityColor: #f1c40f; --inactiveColor: #d1a40f; }
.reward.Mythic { --rarityColor: #d35400; --inactiveColor: #b3500e; }
.reward.Relic { --rarityColor: #e74c3c; --inactiveColor: #c7342c; }
.reward.Masterwork { --rarityColor: #f39c12; --inactiveColor: #d37c02; }
.reward.Eternal { --rarityColor: #e91e63; --inactiveColor: #c91e53; }


/* #endregion RARITIES COLORS */

.reward {
    position: relative;
    width: var(--lvlTrailWidth, 8rem);
    height: 100%;
    padding: .5rem;
    border: 0.0625rem solid #17171a;
    background: #0e0f11;
    border-radius: .5rem;
    scroll-snap-align: center;
    gap: .25rem;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    border-color: var(--rarityColor);
    outline: 0 solid var(--rarityColor);

    transition: 0.5s;

    z-index: 10;

    --backgroundColor1: #0e0f11;
    --backgroundColor2: #0e0f11;

    background: linear-gradient(-45deg, var(--backgroundColor1), var(--backgroundColor2), var(--backgroundColor1));
}

.reward.active {
    border: 0.125rem solid var(--rarityColor);
}

.reward.current {
    border: 0.25rem solid var(--rarityColor);

    background-color: var(--rarityColor);
    
    --backgroundColor1: var(--inactiveColor);
    --backgroundColor2: var(--rarityColor);

    transform: scale(1.1);
}

.rewardIcon {
    font-size: 1.75rem;
    line-height: 1;
    margin-bottom: .25rem;
    color: var(--inactiveColor);
}

.reward.active .rewardIcon {
    z-index: 15;
    color: var(--rarityColor);
}

.reward.current .rewardIcon {
    color: #fff;
}

.rewardDescription {
    z-index: 15;
    font-size: .75rem;
    color: #464749;
}

.reward.active .rewardDescription {
    color: var(--rarityColor);
}

.reward.current .rewardDescription {
    color: #fff;
}

.rewardTail {
    position: absolute;
    top: 100%;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 18px solid var(--inactiveColor);
}

.reward.active .rewardTail {
    border-top: 18px solid var(--rarityColor);
}
.reward.current:after,
.reward.current:before  {
    content: "";
    position: absolute;
    z-index: 2;
    opacity: 0.25;
    border-radius: 1rem;

    animation: water-wobble var(--wobble-duration) var(--wobble-delay) ease-in-out infinite;
}
.reward.current:after {

    --wobble-x: 2px;        /* horizontal travel */
    --wobble-y: 1px;         /* vertical travel */
    --wobble-rot: 5deg;    /* tiny tilt */
    --wobble-duration: 6s;   /* loop length */
    --wobble-delay: -2s;

    inset: -0.625rem;
    background: var(--rarityColor);
}
.reward.current:before {

    --wobble-x: 4px;        /* horizontal travel */
    --wobble-y: 2px;         /* vertical travel */
    --wobble-rot: 4deg;    /* tiny tilt */
    --wobble-duration: 5.9s;   /* loop length */
    --wobble-delay: -3s;

    inset: -0.5rem;
    background: var(--inactiveColor);
}

@keyframes water-wobble {
  0%   { transform: translate3d(0,0,0) rotate(0deg); }
  20%  { transform: translate3d(calc(var(--wobble-x)*0.6),  calc(var(--wobble-y)*-0.4), 0) rotate(calc(var(--wobble-rot)*-0.6)); }
  40%  { transform: translate3d(calc(var(--wobble-x)*-0.8), calc(var(--wobble-y)*-1.0), 0) rotate(calc(var(--wobble-rot)*-0.2)); }
  60%  { transform: translate3d(calc(var(--wobble-x)*0.8),  var(--wobble-y),            0) rotate(calc(var(--wobble-rot)*0.8)); }
  80%  { transform: translate3d(calc(var(--wobble-x)*-0.5), calc(var(--wobble-y)*0.4),  0) rotate(calc(var(--wobble-rot)*0.2)); }
  100% { transform: translate3d(0,0,0) rotate(0deg); }
}


/* #region PARTICLES */

.reward .particles {
    position: absolute;
    inset: -2rem;

    z-index: -10;

    display: flex;
    justify-content: center;
    align-items: center;
}


.reward .particles .particle {
    position: absolute;
    width: 0.25rem;
    height: 0.25rem;
    aspect-ratio: 1 / 1;
    background: var(--rarityColor);
    border-radius: 50%;

    z-index: -10;

    --targetX: 0;
    --targetY: 0;
    --animationTime: 1s;
    --animationDelay: 1s;

    animation: particleAnimation var(--animationTime) var(--animationDelay) infinite;
}

@keyframes particleAnimation {
    0% {
        bottom: calc( ( var(--targetY) + 50% )/2 );
        left:   calc( ( var(--targetX) + 50% )/2 );
        /* bottom: 50%;
        left:   50%; */
        opacity: 1;
    }
    50% {
        opacity: 1;
    }
    100% {
        bottom: var(--targetY);
        left: var(--targetX);
        opacity: 0;
    }
}

/* #endregion PARTICLES */






.progressTrack {
    grid-area: t;

    display: flex;
    align-items: center;
    gap: 0;
    min-width: max-content;

    padding-left: calc(var(--lvlTrailWidth, 6rem) * 0.5);
}

.node {
    position: relative;
    width: var(--lvlIndicatorWidth, 2rem);
    height: var(--lvlIndicatorHeight, 2rem);
    border: 0.125rem solid #3c3e43;
    border-radius: 9999px;
    background: #1e1f24;
    display: grid;
    place-items: center;
    z-index: 3;
    scroll-snap-align: center;
}

.node.active {
    border: 0.0625rem solid #00aaff;
    outline: 0.0625rem solid #00aaff;
    /* box-shadow: 0 0 0 0.25rem color-mix(in srgb, #00aaff 30%, transparent); */
}

.nodeInner {
    font-size: .875rem;
    color: #eaeaea;
}

.trial {
    position: relative;
    width: calc( var( --lvlTrailWidth, 6rem) - 0.25rem);
    height: .25rem;
    border-radius: 9999px;
    background: #3c3e43;

    display: flex;
    justify-content: center;
    align-items: center;

    margin-inline: 0.125rem;

    transition: 0.25s;;
}

.trial::after {
    content: '';
    position: absolute;
    left: 0;
}
.trail.finished:after {
    width: 0;
    transition: 0s !important;
}

.trial.finished::after {
    background: linear-gradient(90deg, #00aaff, #2bbbfd, #00aaff);
    border-radius: 9999px;
    width: 100%;
    height: .375rem;
    transition: 0s !important;
}

.trial.current:after {
    transition: 0.5s ease-out;
    width: var(--partial, 0%);
    height: .375rem;
    background: linear-gradient(90deg, #00aaff, #dbf3ff);

    border-radius: 9999px 0 0 9999px;
}



.trial svg {
    position: absolute;
    color: white;
    height: 1.25rem;

    z-index: 2;

    left:  var(--partial, 0%);
    transform: translateX(-50%);

    filter: drop-shadow(0 0 0.5rem black);

    animation: sparkleMove 5s linear infinite;
    
    transition: 0.5s ease-out;
}

@keyframes sparkleMove {
    0%, 100% {
        transform: translateX(-50%) rotate(0deg) scale(1, 1);
    }
    50% {
        transform: translateX(-50%) rotate(5deg) scale(1.1, 0.95);
    }
    75% {
        transform: translateX(-50%) rotate(-5deg) scale(0.95, 1.1);
    }
}


.progressEnding {
    grid-area: e;
    width: var(--lvlTrailWidth);

    display: flex;
    justify-content: center;
    align-items: center;

    color: #4c515f;
}
</style>