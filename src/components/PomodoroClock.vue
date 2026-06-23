<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const settings = useSettingsStore()

type Mode = 'focus' | 'break'

const mode = ref<Mode>('focus')
const running = ref(false)
let intervalId: ReturnType<typeof setInterval> | undefined

const durationMinutes = computed(() =>
  mode.value === 'focus' ? settings.focusMinutes : settings.breakMinutes,
)
const totalSeconds = computed(() => durationMinutes.value * 60)
const remainingSeconds = ref(totalSeconds.value)

watch([mode, totalSeconds], () => {
  if (!running.value) remainingSeconds.value = totalSeconds.value
})

const progress = computed(() =>
  totalSeconds.value === 0 ? 0 : 1 - remainingSeconds.value / totalSeconds.value,
)

const radius = 90
const circumference = 2 * Math.PI * radius
const dashOffset = computed(() => circumference * (1 - progress.value))

const formattedTime = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

function tick() {
  if (remainingSeconds.value <= 0) {
    pause()
    return
  }
  remainingSeconds.value -= 1
}

function start() {
  if (running.value || remainingSeconds.value <= 0) return
  running.value = true
  intervalId = setInterval(tick, 1000)
}

function pause() {
  running.value = false
  if (intervalId) clearInterval(intervalId)
  intervalId = undefined
}

function reset() {
  pause()
  remainingSeconds.value = totalSeconds.value
}

function setMode(next: Mode) {
  pause()
  mode.value = next
  remainingSeconds.value = totalSeconds.value
}

function onDurationInput(event: Event) {
  const minutes = Number((event.target as HTMLInputElement).value)
  if (mode.value === 'focus') settings.setFocusMinutes(minutes)
  else settings.setBreakMinutes(minutes)
}

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <section class="clock">
    <div class="clock__modes">
      <button type="button" :class="{ active: mode === 'focus' }" @click="setMode('focus')">
        {{ t('clock.focus') }}
      </button>
      <button type="button" :class="{ active: mode === 'break' }" @click="setMode('break')">
        {{ t('clock.break') }}
      </button>
    </div>

    <div class="clock__dial">
      <svg viewBox="0 0 200 200" width="240" height="240">
        <circle cx="100" cy="100" :r="radius" class="clock__track" fill="none" stroke-width="10" />
        <circle
          cx="100"
          cy="100"
          :r="radius"
          class="clock__progress"
          fill="none"
          stroke-width="10"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          transform="rotate(-90 100 100)"
        />
      </svg>
      <span class="clock__time">{{ formattedTime }}</span>
    </div>

    <div class="clock__duration">
      <label>
        {{ durationMinutes }} {{ t('clock.minutes') }}
        <input
          type="range"
          min="1"
          :max="mode === 'focus' ? 180 : 60"
          :value="durationMinutes"
          :disabled="running"
          @input="onDurationInput"
        />
      </label>
    </div>

    <div class="clock__controls">
      <button type="button" v-if="!running" @click="start">{{ t('clock.start') }}</button>
      <button type="button" v-else @click="pause">{{ t('clock.pause') }}</button>
      <button type="button" @click="reset">{{ t('clock.reset') }}</button>
    </div>
  </section>
</template>

<style scoped>
.clock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem 1rem;
}

.clock__modes {
  display: flex;
  gap: 0.5rem;
}

.clock__modes button {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  border-radius: 999px;
  padding: 0.3rem 1rem;
}

.clock__modes button.active {
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  border-color: var(--color-primary);
}

.clock__dial {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clock__track {
  stroke: var(--color-surface-alt);
}

.clock__progress {
  stroke: var(--color-primary);
  transition: stroke-dashoffset 0.3s linear;
}

.clock__time {
  position: absolute;
  font-size: 2.5rem;
  font-weight: 600;
}

.clock__duration {
  width: 100%;
  max-width: 240px;
  text-align: center;
}

.clock__duration label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.clock__duration input[type='range'] {
  width: 100%;
}

.clock__controls {
  display: flex;
  gap: 0.75rem;
}

.clock__controls button {
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.25rem;
}

.clock__controls button:last-child {
  background-color: var(--color-surface-alt);
  color: var(--color-text);
}
</style>
