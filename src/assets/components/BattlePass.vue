<template>
    <div class="battlePass">
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

        <section id="battlePassTrack">
            <div class="rewardsRow">
                <div class="reward" v-for="reward in rewards" :key="reward.id" :class="{ active: reward.id <= level, [reward.description]: true }">
                    <div class="rewardName">{{ reward.name }}</div>
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
                    </div>
                </template>
            </div>
        </section>
    </div>
</template>

<script>

export default {
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
            rewards: Array.from({ length: this.getLevel(this.totalCount) + 5 }, (_, i) => ({
                id: i, name: `Reward ${i}`, description: i == 0 ? null : i % 5 === 0 ? 'Epic' : i % 3 === 0 ? 'Rare' : 'Common'
            })),
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
        }
    },
    computed: {

        level() {
            return this.getLevel(this.doneCount);
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
            return Array.from({ length: this.getLevel(this.totalCount) + 5 }, (_, i) => i);
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
    },
    watch: {
        doneCount(newVal) {
            // scroll to new rewards
            this.$nextTick(() => {
                const container = this.$el.querySelector('.bp-scroll');
                const target = this.$el.querySelector(`.reward.active`);
                if (container && target) {
                    container.scrollTo({
                        left: target.offsetLeft - container.offsetLeft,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }
}

</script>

<style scoped>
.battlePass {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    align-items: stretch;
    justify-content: start;

    --lvlIndicatorWidth: 2rem;
    --lvlTrailWidth: 6rem;

    max-width: 90vw;
}

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


#battlePassTrack {
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x proximity;
    padding-bottom: .5rem;

    display: flex;
    flex-direction: column;
    gap: 0;
    justify-content: stretch;
    align-items: flex-start;
}

.rewardsRow {
    display: flex;
    align-items: flex-end;
    padding: .5rem 1rem 1.25rem;

    gap: var(--lvlIndicatorWidth, 2rem);

    flex-grow: 1;
}


.reward.Common {
    --rarityColor: #5fe22b;
}

.reward.Rare {
    --rarityColor: #2b65e2;
}

.reward.Epic {
    --rarityColor: #8a2be2;
}

.reward {
    position: relative;
    width: var(--lvlTrailWidth, 8rem);
    height: 100%;
    padding: .5rem;
    border: 1px solid #3c3e43;
    background: #282a30;
    border-radius: .5rem;
    scroll-snap-align: center;
    gap: .25rem;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    --rarityColor: #3c3e43;
}

.reward.active {
    border-color: var(--rarityColor);
    box-shadow: 0 0 0 0.25rem var(--rarityColor);
}

.rewardName {
    font-weight: 700;
    font-size: .875rem;
    color: #eaeaea;

    white-space: nowrap;
}

.rewardDescription {
    font-size: .75rem;
    color: #a8abb2;
}

.rewardTail {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -18px;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 18px solid #282a30;
    filter: drop-shadow(0 -1px 0 #3c3e43);
}
.active .rewardTail {
    border-top: 18px solid var(--rarityColor);
}










.progressTrack {
    display: flex;
    align-items: center;
    gap: 0;
    min-width: max-content;
    
    padding-left: calc( var(--lvlTrailWidth, 6rem) * 0.5);
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
    z-index: 2;
    scroll-snap-align: center;
}

.node.active {
    border-color: #00aaff;
    box-shadow: 0 0 0 0.25rem color-mix(in srgb, #00aaff 30%, transparent);
}

.nodeInner {
    font-size: .875rem;
    color: #eaeaea;
}

.trial {
    position: relative;
    width: var(--lvlTrailWidth, 6rem);
    height: .5rem;
    border-radius: 9999px;
    background: #3c3e43;
    overflow: hidden;
}

.trial::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, #00aaff, #66d1ff);
    width: 100%;
}
.trial.current:after {
    transition: 0.5s ease-out;
}
.trail.finished:after,
.trial.waiting:after {
    transition: 0s !important;
}

.trial::after {
    width: var(--partial, 0%);
}
</style>