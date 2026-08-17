<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMultitaskStore } from '../stores/multitask'
import { useClockStore } from '../stores/clock'
import { useSettingsStore } from '../stores/settings'
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

const focusPresets = [1, 5, 10, 15, 20, 25, 30, 45, 60, 90, 120, 180]
const breakPresets = [1, 5, 10, 15, 20, 25, 30, 45, 60]

const durationOptions = computed(() => {
  const presets = clock.mode === 'focus' ? focusPresets : breakPresets
  if (presets.includes(clock.durationMinutes)) return presets
  return [...presets, clock.durationMinutes].sort((a, b) => a - b)
})

function onDurationChange(event: Event) {
  const minutes = Number((event.target as HTMLSelectElement).value)
  if (clock.mode === 'focus') settings.setFocusMinutes(minutes)
  else settings.setBreakMinutes(minutes)
}

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
      <span class="multitask-view__time">{{ formattedTime }}</span>
      <label class="multitask-view__duration">
        {{ t('clock.duration') }}
        <select :value="clock.durationMinutes" :disabled="clock.running" @change="onDurationChange">
          <option v-for="m in durationOptions" :key="m" :value="m">{{ m }} {{ t('clock.minutes') }}</option>
        </select>
      </label>
      <div class="multitask-view__controls">
        <button type="button" v-if="!clock.running" @click="clock.start()">{{ t('clock.start') }}</button>
        <button type="button" v-else @click="clock.pause()">{{ t('clock.pause') }}</button>
        <button type="button" @click="clock.reset()">{{ t('clock.reset') }}</button>
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
  gap: 0.5rem;
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

.multitask-view__time {
  font-size: 1.5rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.multitask-view__duration {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.multitask-view__duration select {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.3rem 0.5rem;
}

.multitask-view__controls {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.multitask-view__controls button {
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  border-radius: 6px;
  padding: 0.4rem 1rem;
}

.multitask-view__controls button:last-child {
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
