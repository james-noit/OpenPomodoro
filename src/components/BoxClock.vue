<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useClockStore } from '../stores/clock'
import { useSettingsStore } from '../stores/settings'

const clock = useClockStore()
const settings = useSettingsStore()

const totalMinutes = computed(() => Math.max(1, clock.durationMinutes))
const rows = 5
const columns = computed(() => Math.ceil(totalMinutes.value / rows))

const grid = computed(() => {
  const cols: number[][] = []
  for (let c = 0; c < columns.value; c++) {
    const col: number[] = []
    for (let r = 0; r < rows; r++) {
      const index = c * rows + r
      if (index < totalMinutes.value) col.push(index)
    }
    cols.push(col)
  }
  return cols
})

function shuffledOrder(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

const order = ref<number[]>(
  settings.boxClockOrder === 'random' ? shuffledOrder(totalMinutes.value) : Array.from({ length: totalMinutes.value }, (_, i) => i),
)

function regenerateOrder() {
  order.value =
    settings.boxClockOrder === 'random'
      ? shuffledOrder(totalMinutes.value)
      : Array.from({ length: totalMinutes.value }, (_, i) => i)
}

watch([totalMinutes, () => settings.boxClockOrder, () => clock.mode], regenerateOrder)

const consumeOrder = computed(() => {
  const map = new Map<number, number>()
  order.value.forEach((boxIndex, position) => map.set(boxIndex, position))
  return map
})

const elapsedSeconds = computed(() => Math.max(0, clock.totalSeconds - clock.remainingSeconds))
const minutesElapsed = computed(() => Math.floor(elapsedSeconds.value / 60))
const currentMinuteProgress = computed(() => (elapsedSeconds.value % 60) / 60)

function boxState(boxIndex: number): 'remaining' | 'active' | 'gone' {
  const position = consumeOrder.value.get(boxIndex) ?? 0
  if (position < minutesElapsed.value) return 'gone'
  if (position === minutesElapsed.value) return 'active'
  return 'remaining'
}

function boxProgress(boxIndex: number): number {
  const position = consumeOrder.value.get(boxIndex) ?? 0
  return position === minutesElapsed.value ? currentMinuteProgress.value : 0
}
</script>

<template>
  <div class="box-clock" :style="{ '--columns': columns }">
    <div v-for="(column, columnIndex) in grid" :key="columnIndex" class="box-clock__column">
      <span
        v-for="boxIndex in column"
        :key="boxIndex"
        class="box-clock__box"
        :class="`box-clock__box--${boxState(boxIndex)}`"
        :style="{ '--p': boxProgress(boxIndex) }"
      ></span>
    </div>
  </div>
</template>

<style scoped>
.box-clock {
  display: flex;
  gap: 0.35rem;
}

.box-clock__column {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.box-clock__box {
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 5px;
  background-color: var(--color-surface-alt);
  transform-origin: center;
  transition: transform 1s linear, opacity 1s linear, background-color 1s linear;
}

.box-clock__box--remaining {
  background-color: var(--color-primary);
}

.box-clock__box--active {
  background-color: color-mix(in srgb, var(--color-high) calc(var(--p) * 100%), var(--color-primary));
  transform: scale(calc(1 - var(--p) * 0.65));
  opacity: calc(1 - var(--p) * 0.85);
}

.box-clock__box--gone {
  transform: scale(0);
  opacity: 0;
}

@media (max-width: 799px) {
  .box-clock {
    gap: 0.2rem;
  }

  .box-clock__column {
    gap: 0.2rem;
  }

  .box-clock__box {
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 3px;
  }
}
</style>
