<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMultitaskStore } from '../stores/multitask'
import { useClockStore } from '../stores/clock'
import { useSettingsStore, MIN_DURATION_SECONDS, MAX_FOCUS_SECONDS, MAX_BREAK_SECONDS } from '../stores/settings'
import MultitaskCard from './MultitaskCard.vue'
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

    <div class="multitask-view__grid">
      <MultitaskCard v-for="card in multitask.cards" :key="card.id" :card="card" :border-color="borderColor" />
      <button type="button" class="multitask-view__add-card" :aria-label="t('multitask.addCard')" @click="multitask.addCard()">
        <span class="multitask-view__add-card-icon" aria-hidden="true">+</span>
        <span class="multitask-view__add-card-label">{{ t('multitask.addCard') }}</span>
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

.multitask-view__grid {
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.multitask-view__add-card {
  container-type: inline-size;
  flex: 1 1 0;
  min-width: 3.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: none;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  min-height: 140px;
  color: var(--color-text-muted);
}

.multitask-view__add-card:hover {
  background-color: var(--color-surface-alt);
  color: var(--color-text);
}

.multitask-view__add-card-icon {
  font-size: 1.75rem;
  line-height: 1;
}

.multitask-view__add-card-label {
  font-size: 0.85rem;
}

@container (max-width: 90px) {
  .multitask-view__add-card-label {
    display: none;
  }

  .multitask-view__add-card-icon {
    font-size: 1.4rem;
  }
}
</style>
