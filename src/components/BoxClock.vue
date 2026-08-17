<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useClockStore } from '../stores/clock'
import { useSettingsStore } from '../stores/settings'

const clock = useClockStore()
const settings = useSettingsStore()

const boxCount = computed(() => Math.max(1, Math.ceil(clock.durationSeconds / 60)))
const boxIndices = computed(() => Array.from({ length: boxCount.value }, (_, i) => i))

function shuffledOrder(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

function freshOrder(): number[] {
  return settings.boxClockOrder === 'random' ? shuffledOrder(boxCount.value) : Array.from({ length: boxCount.value }, (_, i) => i)
}

const order = ref<number[]>(freshOrder())

function regenerateOrder() {
  order.value = freshOrder()
}

watch([boxCount, () => settings.boxClockOrder, () => clock.mode], regenerateOrder)

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

// Explicit JS transition hooks (css: false) instead of Vue's automatic CSS-duration
// detection: rapid successive duration adjustments can interrupt a box mid-"enter"
// with a "leave" before Vue finishes its own enter bookkeeping, which leaves the
// element's leave transition never resolving. Owning the timing ourselves avoids that.
const ENTER_MS = 450
const LEAVE_MS = 300
const pendingTimers = new WeakMap<Element, ReturnType<typeof setTimeout>>()

function clearPending(el: Element) {
  const timer = pendingTimers.get(el)
  if (timer) {
    clearTimeout(timer)
    pendingTimers.delete(el)
  }
}

function onEnter(el: Element, done: () => void) {
  const target = el as HTMLElement
  clearPending(el)
  target.classList.remove('box-clock-item--leaving')
  target.classList.add('box-clock-item--entering')
  pendingTimers.set(
    el,
    setTimeout(() => {
      pendingTimers.delete(el)
      done()
    }, ENTER_MS),
  )
}

function onAfterEnter(el: Element) {
  ;(el as HTMLElement).classList.remove('box-clock-item--entering')
}

function onEnterCancelled(el: Element) {
  clearPending(el)
  ;(el as HTMLElement).classList.remove('box-clock-item--entering')
}

function onLeave(el: Element, done: () => void) {
  const target = el as HTMLElement
  clearPending(el)
  target.classList.remove('box-clock-item--entering')
  target.classList.add('box-clock-item--leaving')
  pendingTimers.set(
    el,
    setTimeout(() => {
      pendingTimers.delete(el)
      done()
    }, LEAVE_MS),
  )
}
</script>

<template>
  <TransitionGroup
    tag="div"
    class="box-clock"
    :css="false"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @enter-cancelled="onEnterCancelled"
    @leave="onLeave"
  >
    <span
      v-for="boxIndex in boxIndices"
      :key="boxIndex"
      class="box-clock__box"
      :class="`box-clock__box--${boxState(boxIndex)}`"
      :style="{ '--p': boxProgress(boxIndex) }"
    ></span>
  </TransitionGroup>
</template>

<style scoped>
.box-clock {
  --box-size: 1.15rem;
  --box-gap: 0.35rem;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: var(--box-gap);
  height: calc(5 * var(--box-size) + 4 * var(--box-gap));
}

.box-clock__box {
  width: var(--box-size);
  height: var(--box-size);
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

@keyframes box-clock-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.2) rotate(-35deg) translateY(8px);
  }
  60% {
    opacity: 1;
    transform: scale(1.15) rotate(6deg) translateY(-2px);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0) translateY(0);
  }
}

@keyframes box-clock-pop-out {
  0% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.2) rotate(35deg) translateY(-8px);
  }
}

.box-clock-item--entering {
  animation: box-clock-pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.box-clock-item--leaving {
  animation: box-clock-pop-out 0.3s ease-in forwards;
}

@media (max-width: 799px) {
  .box-clock {
    --box-size: 0.7rem;
    --box-gap: 0.2rem;
  }

  .box-clock__box {
    border-radius: 3px;
  }
}
</style>
