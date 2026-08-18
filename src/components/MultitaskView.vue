<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMultitaskStore } from '../stores/multitask'
import { useClockStore } from '../stores/clock'
import { useSettingsStore, MIN_DURATION_SECONDS, MAX_FOCUS_SECONDS, MAX_BREAK_SECONDS } from '../stores/settings'
import MultitaskTaskRow from './MultitaskTaskRow.vue'
import MultitaskTaskDrawer from './MultitaskTaskDrawer.vue'
import ClockSettings from './ClockSettings.vue'

const { t } = useI18n()
const multitask = useMultitaskStore()
const clock = useClockStore()
const settings = useSettingsStore()

const formattedTime = computed(() => {
  const minutes = Math.floor(clock.remainingSeconds / 60)
  const seconds = clock.remainingSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const currentDurationSeconds = computed(() => (clock.mode === 'focus' ? settings.focusSeconds : settings.breakSeconds))
const maxDurationSeconds = computed(() => (clock.mode === 'focus' ? MAX_FOCUS_SECONDS : MAX_BREAK_SECONDS))
const canDecreaseDuration = computed(() => !clock.running && currentDurationSeconds.value > MIN_DURATION_SECONDS)
const canIncreaseDuration = computed(() => !clock.running && currentDurationSeconds.value < maxDurationSeconds.value)

function capacityColorVar(count: number): string {
  if (count <= 2) return 'var(--color-capacity-safe)'
  if (count === 3) return 'var(--color-capacity-elevated)'
  if (count <= 5) return 'var(--color-capacity-high)'
  return 'var(--color-capacity-critical)'
}

const borderColor = computed(() => capacityColorVar(multitask.cards.length))

const showIterationBanner = computed(() =>
  clock.lastFocusEndAt !== null &&
  multitask.cards.some((card) => card.taskId !== null && card.lastAnsweredPhaseEndAt !== clock.lastFocusEndAt),
)

// Explicit JS transition hooks (css: false) rather than Vue's automatic CSS-duration
// detection — see BoxClock.vue for why: a row removed shortly after being added can
// interrupt Vue's own enter bookkeeping and leave the leave transition never resolving.
const ROW_ENTER_MS = 380
const ROW_LEAVE_MS = 300
const pendingRowTimers = new WeakMap<Element, ReturnType<typeof setTimeout>>()

function clearPendingRow(el: Element) {
  const timer = pendingRowTimers.get(el)
  if (timer) {
    clearTimeout(timer)
    pendingRowTimers.delete(el)
  }
}

function onRowEnter(el: Element, done: () => void) {
  const target = el as HTMLElement
  clearPendingRow(el)
  target.classList.remove('mt-list-row--leaving')
  target.classList.add('mt-list-row--entering')
  pendingRowTimers.set(
    el,
    setTimeout(() => {
      pendingRowTimers.delete(el)
      done()
    }, ROW_ENTER_MS),
  )
}

function onRowAfterEnter(el: Element) {
  ;(el as HTMLElement).classList.remove('mt-list-row--entering')
}

function onRowEnterCancelled(el: Element) {
  clearPendingRow(el)
  ;(el as HTMLElement).classList.remove('mt-list-row--entering')
}

function onRowLeave(el: Element, done: () => void) {
  const target = el as HTMLElement
  clearPendingRow(el)
  target.classList.remove('mt-list-row--entering')
  target.classList.add('mt-list-row--leaving')
  pendingRowTimers.set(
    el,
    setTimeout(() => {
      pendingRowTimers.delete(el)
      done()
    }, ROW_LEAVE_MS),
  )
}

const BANNER_ENTER_MS = 300
const BANNER_LEAVE_MS = 250
let pendingBannerTimer: ReturnType<typeof setTimeout> | undefined

function clearPendingBanner() {
  if (pendingBannerTimer) {
    clearTimeout(pendingBannerTimer)
    pendingBannerTimer = undefined
  }
}

function onBannerEnter(el: Element, done: () => void) {
  const target = el as HTMLElement
  clearPendingBanner()
  target.classList.remove('multitask-view__banner--leaving')
  target.classList.add('multitask-view__banner--entering')
  pendingBannerTimer = setTimeout(done, BANNER_ENTER_MS)
}

function onBannerAfterEnter(el: Element) {
  ;(el as HTMLElement).classList.remove('multitask-view__banner--entering')
}

function onBannerEnterCancelled(el: Element) {
  clearPendingBanner()
  ;(el as HTMLElement).classList.remove('multitask-view__banner--entering')
}

function onBannerLeave(el: Element, done: () => void) {
  const target = el as HTMLElement
  clearPendingBanner()
  target.classList.remove('multitask-view__banner--entering')
  target.classList.add('multitask-view__banner--leaving')
  pendingBannerTimer = setTimeout(done, BANNER_LEAVE_MS)
}
</script>

<template>
  <main class="multitask-view">
    <div class="multitask-view__clock-strip">
      <div class="multitask-view__mode">
        <button type="button" :class="{ active: clock.mode === 'focus' }" @click="clock.setMode('focus')">
          {{ t('clock.focus') }}
        </button>
        <button type="button" :class="{ active: clock.mode === 'break' }" @click="clock.setMode('break')">
          {{ t('clock.break') }}
        </button>
        <ClockSettings />
      </div>

      <div class="multitask-view__time-group">
        <div class="multitask-view__stepper" role="group" :aria-label="t('clock.adjustDuration')">
          <button
            type="button"
            :disabled="!canDecreaseDuration"
            :aria-label="t('clock.decreaseLarge')"
            :title="t('clock.decreaseLarge')"
            @click="clock.adjustDuration(-300)"
          >
            -5′
          </button>
          <button
            type="button"
            :disabled="!canDecreaseDuration"
            :aria-label="t('clock.decreaseSmall')"
            :title="t('clock.decreaseSmall')"
            @click="clock.adjustDuration(-30)"
          >
            -30″
          </button>
        </div>
        <span class="multitask-view__time">{{ formattedTime }}</span>
        <div class="multitask-view__stepper" role="group" :aria-label="t('clock.adjustDuration')">
          <button
            type="button"
            :disabled="!canIncreaseDuration"
            :aria-label="t('clock.increaseSmall')"
            :title="t('clock.increaseSmall')"
            @click="clock.adjustDuration(30)"
          >
            +30″
          </button>
          <button
            type="button"
            :disabled="!canIncreaseDuration"
            :aria-label="t('clock.increaseLarge')"
            :title="t('clock.increaseLarge')"
            @click="clock.adjustDuration(300)"
          >
            +5′
          </button>
        </div>
      </div>

      <div class="multitask-view__controls">
        <button
          type="button"
          v-if="!clock.running"
          class="multitask-view__icon-button"
          :aria-label="t('clock.start')"
          :title="t('clock.start')"
          @click="clock.start()"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="currentColor" d="M8 5v14l11-7z" />
          </svg>
        </button>
        <button
          type="button"
          v-else
          class="multitask-view__icon-button"
          :aria-label="t('clock.pause')"
          :title="t('clock.pause')"
          @click="clock.pause()"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z" />
          </svg>
        </button>
        <button
          type="button"
          class="multitask-view__icon-button multitask-view__icon-button--secondary"
          :aria-label="t('clock.reset')"
          :title="t('clock.reset')"
          @click="clock.reset()"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 5V2L7 7l5 5V8c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="multitask-view__toolbar">
      <div class="multitask-view__toolbar-actions">
        <MultitaskTaskDrawer />
      </div>
    </div>

    <div v-if="!multitask.capacityTipDismissed" class="multitask-view__tip">
      <p><em>{{ t('multitask.capacityTip') }}</em></p>
      <button
        type="button"
        class="multitask-view__tip-close"
        :aria-label="t('todo.close')"
        @click="multitask.dismissCapacityTip()"
      >
        ✕
      </button>
    </div>

    <div class="multitask-view__list-wrap">
      <Transition
        :css="false"
        @enter="onBannerEnter"
        @after-enter="onBannerAfterEnter"
        @enter-cancelled="onBannerEnterCancelled"
        @leave="onBannerLeave"
      >
        <div v-if="showIterationBanner" class="multitask-view__banner">
          {{ t('multitask.iterationQuestion') }}
        </div>
      </Transition>

      <TransitionGroup
        tag="div"
        class="multitask-view__list"
        :css="false"
        @enter="onRowEnter"
        @after-enter="onRowAfterEnter"
        @enter-cancelled="onRowEnterCancelled"
        @leave="onRowLeave"
      >
        <MultitaskTaskRow v-for="card in multitask.cards" :key="card.id" :card="card" :border-color="borderColor" />
      </TransitionGroup>

      <p v-if="!multitask.cards.length" class="multitask-view__empty">{{ t('multitask.emptyGrid') }}</p>

      <button type="button" class="multitask-view__add-row" @click="multitask.addCard()">
        <span aria-hidden="true">+</span>
        {{ t('multitask.addCard') }}
      </button>
    </div>
  </main>
</template>

<style scoped>
.multitask-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1rem;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
}

.multitask-view__clock-strip {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.multitask-view__mode {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.multitask-view__mode button {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  border-radius: 999px;
  padding: 0.3rem 1rem;
}

.multitask-view__mode button.active {
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  border-color: var(--color-primary);
}

.multitask-view__time-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
}

.multitask-view__time {
  font-size: 1.5rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  min-width: 3.6rem;
  text-align: center;
}

.multitask-view__stepper {
  display: flex;
  gap: 0.3rem;
  flex-shrink: 0;
}

.multitask-view__stepper button {
  min-width: 2.3rem;
  height: 2.3rem;
  padding: 0 0.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-muted);
  font-size: 0.65rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  white-space: nowrap;
  transition: background-color 0.15s, border-color 0.15s, color 0.15s;
}

.multitask-view__stepper button:hover:not(:disabled) {
  background-color: var(--color-surface-alt);
  border-color: var(--color-primary);
  color: var(--color-text);
}

.multitask-view__stepper button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.multitask-view__controls {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.multitask-view__icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  border-radius: 50%;
}

.multitask-view__icon-button:hover {
  filter: brightness(0.95);
}

.multitask-view__icon-button--secondary {
  background-color: var(--color-surface-alt);
  color: var(--color-text);
}

.multitask-view__toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.multitask-view__toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.multitask-view__tip {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background-color: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: var(--color-text);
}

.multitask-view__tip p {
  margin: 0;
  flex: 1;
}

.multitask-view__tip-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--color-text-muted);
  min-width: 1.75rem;
  min-height: 1.75rem;
}

.multitask-view__list-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.multitask-view__banner {
  position: absolute;
  top: -0.6rem;
  left: 50%;
  transform: translate(-50%, -100%);
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  border-radius: 999px;
  padding: 0.55rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  z-index: 15;
}

.multitask-view__banner--entering {
  animation: mt-banner-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes mt-banner-enter {
  0% {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -100%);
  }
}

.multitask-view__banner--leaving {
  animation: mt-banner-leave 0.25s ease-in forwards;
}

@keyframes mt-banner-leave {
  to {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
}

.multitask-view__list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.mt-list-row--entering {
  animation: mt-row-enter 0.38s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes mt-row-enter {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.97);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.mt-list-row--leaving {
  animation: mt-row-leave 0.3s ease-in forwards;
}

@keyframes mt-row-leave {
  to {
    opacity: 0;
    transform: scale(0.96);
  }
}

.multitask-view__empty {
  color: var(--color-text-muted);
  text-align: center;
  padding: 1.5rem 0;
}

.multitask-view__add-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: none;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  padding: 0.6rem;
  color: var(--color-text-muted);
}

.multitask-view__add-row:hover {
  background-color: var(--color-surface-alt);
  color: var(--color-text);
}
</style>
