<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settings'
import { useTodosStore } from '../stores/todos'
import type { BellSoundId } from '../stores/settings'

const { t } = useI18n()
const settings = useSettingsStore()
const todos = useTodosStore()

type Mode = 'focus' | 'break'

const mode = ref<Mode>('focus')
const running = ref(false)
let intervalId: ReturnType<typeof setInterval> | undefined
let hasTicked = false

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

const focusPresets = [1, 5, 10, 15, 20, 25, 30, 45, 60, 90, 120, 180]
const breakPresets = [1, 5, 10, 15, 20, 25, 30, 45, 60]

const durationOptions = computed(() => {
  const presets = mode.value === 'focus' ? focusPresets : breakPresets
  if (presets.includes(durationMinutes.value)) return presets
  return [...presets, durationMinutes.value].sort((a, b) => a - b)
})

function onDurationChange(event: Event) {
  const minutes = Number((event.target as HTMLSelectElement).value)
  if (mode.value === 'focus') settings.setFocusMinutes(minutes)
  else settings.setBreakMinutes(minutes)
}

const bellSounds: { id: BellSoundId }[] = [
  { id: 'digital' },
  { id: 'classic' },
  { id: 'chime' },
  { id: 'soft' },
  { id: 'wave' },
  { id: 'deep' },
  { id: 'ambient' },
]

const soundPanelOpen = ref(false)

let audioCtx: AudioContext | null = null

function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function playNote(
  ctx: AudioContext,
  frequency: number,
  startDelay: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.3,
) {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  const startTime = ctx.currentTime + startDelay

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startTime)

  gainNode.gain.setValueAtTime(gain, startTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

function playSound(id: BellSoundId) {
  const ctx = getAudioCtx()
  if (id === 'digital') {
    // ~0.5s
    playNote(ctx, 1046.5, 0, 0.12, 'square', 0.15)
    playNote(ctx, 1046.5, 0.18, 0.12, 'square', 0.15)
    playNote(ctx, 1046.5, 0.36, 0.12, 'square', 0.15)
  } else if (id === 'classic') {
    // ~0.8s
    playNote(ctx, 880, 0, 0.5)
    playNote(ctx, 880, 0.3, 0.5)
  } else if (id === 'chime') {
    // ~0.9s
    playNote(ctx, 523.25, 0, 0.4)
    playNote(ctx, 659.25, 0.18, 0.4)
    playNote(ctx, 783.99, 0.36, 0.5)
  } else if (id === 'soft') {
    // 1s
    playNote(ctx, 330, 0, 1.0, 'sine', 0.2)
  } else if (id === 'wave') {
    // 2s
    playNote(ctx, 440, 0, 1.0, 'sine', 0.22)
    playNote(ctx, 330, 1.0, 1.0, 'sine', 0.22)
  } else if (id === 'deep') {
    // 3s
    playNote(ctx, 196, 0, 3.0, 'sine', 0.25)
  } else if (id === 'ambient') {
    // 4s
    playNote(ctx, 261.63, 0, 1.4, 'sine', 0.2)
    playNote(ctx, 329.63, 1.3, 1.4, 'sine', 0.2)
    playNote(ctx, 392.0, 2.6, 1.4, 'sine', 0.2)
  }
}

function ensureNotificationPermission() {
  if (typeof Notification === 'undefined') return
  if (Notification.permission === 'default') {
    void Notification.requestPermission()
  }
}

function sendNotification(finishedMode: Mode) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  const body = finishedMode === 'focus' ? t('clock.notificationBodyFocus') : t('clock.notificationBodyBreak')
  new Notification(t('clock.notificationTitle'), { body })
}

const sessionModalOpen = ref(false)

function tick() {
  if (remainingSeconds.value <= 0) {
    if (!hasTicked) {
      hasTicked = true
      pause()
      if (settings.bellSound) playSound(settings.bellSoundId)
      sendNotification(mode.value)
      switchToNextMode()
    }
    return
  }
  remainingSeconds.value -= 1
}

function switchToNextMode() {
  mode.value = mode.value === 'focus' ? 'break' : 'focus'
  hasTicked = false
  sessionModalOpen.value = true
}

function start() {
  if (running.value || remainingSeconds.value <= 0) return
  ensureNotificationPermission()
  running.value = true
  intervalId = setInterval(tick, 1000)
}

function pause() {
  running.value = false
  if (intervalId) clearInterval(intervalId)
  intervalId = undefined
}

function reset() {
  hasTicked = false
  pause()
  remainingSeconds.value = totalSeconds.value
}

function setMode(next: Mode) {
  hasTicked = false
  pause()
  mode.value = next
  remainingSeconds.value = totalSeconds.value
}

function startNextSession() {
  sessionModalOpen.value = false
  start()
}

function dismissSessionModal() {
  sessionModalOpen.value = false
}

const taskModalOpen = ref(false)

function openTaskModal() {
  taskModalOpen.value = true
}

function selectTask(id: string) {
  todos.setCurrentTask(id)
  taskModalOpen.value = false
}

function finishTask() {
  if (!todos.currentTask) return
  todos.toggleDone(todos.currentTask.id)
  taskModalOpen.value = true
}

onMounted(() => {
  ensureNotificationPermission()
})

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
      <div class="clock__bell-wrap">
        <button
          type="button"
          class="clock__bell"
          :class="{ 'clock__bell--muted': !settings.bellSound }"
          :aria-label="t('clock.soundSettings')"
          aria-haspopup="true"
          :aria-expanded="soundPanelOpen"
          @click="soundPanelOpen = !soundPanelOpen"
        >
          {{ settings.bellSound ? '🔔' : '🔕' }}
        </button>
        <div v-if="soundPanelOpen" class="clock__bell-overlay" @click="soundPanelOpen = false"></div>
        <div v-if="soundPanelOpen" class="clock__bell-panel" role="dialog" :aria-label="t('clock.soundSettings')">
          <label class="clock__bell-toggle">
            <input
              type="checkbox"
              :checked="settings.bellSound"
              @change="settings.setBellSound(($event.target as HTMLInputElement).checked)"
            />
            {{ settings.bellSound ? t('clock.bellOff') : t('clock.bellOn') }}
          </label>
          <ul class="clock__sound-list">
            <li v-for="sound in bellSounds" :key="sound.id" class="clock__sound-item">
              <label>
                <input
                  type="radio"
                  name="bellSoundId"
                  :value="sound.id"
                  :checked="settings.bellSoundId === sound.id"
                  @change="settings.setBellSoundId(sound.id)"
                />
                {{ t(`clock.sounds.${sound.id}`) }}
              </label>
              <button
                type="button"
                class="clock__sound-preview"
                :aria-label="t('clock.preview')"
                @click="playSound(sound.id)"
              >
                ▶
              </button>
            </li>
          </ul>
        </div>
      </div>
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

    <div class="clock__task">
      <template v-if="todos.currentTask">
        <span class="clock__task-label">{{ t('clock.currentTask') }}</span>
        <span class="clock__task-title">{{ todos.currentTask.title }}</span>
        <div class="clock__task-actions">
          <button type="button" class="clock__task-finish" @click="finishTask">{{ t('clock.finished') }}</button>
          <button type="button" class="clock__task-change" @click="openTaskModal">{{ t('clock.changeTask') }}</button>
        </div>
      </template>
      <template v-else>
        <button type="button" class="clock__task-select" @click="openTaskModal">{{ t('clock.selectTask') }}</button>
      </template>
    </div>

    <div class="clock__duration">
      <label>
        {{ t('clock.duration') }}
        <select :value="durationMinutes" :disabled="running" @change="onDurationChange">
          <option v-for="m in durationOptions" :key="m" :value="m">{{ m }} {{ t('clock.minutes') }}</option>
        </select>
      </label>
    </div>

    <div class="clock__controls">
      <button type="button" v-if="!running" @click="start">{{ t('clock.start') }}</button>
      <button type="button" v-else @click="pause">{{ t('clock.pause') }}</button>
      <button type="button" @click="reset">{{ t('clock.reset') }}</button>
    </div>

    <div v-if="taskModalOpen" class="clock__overlay" @click.self="taskModalOpen = false">
      <div class="clock__modal" role="dialog" aria-modal="true" :aria-label="t('clock.selectTask')">
        <div class="clock__modal-header">
          <h3>{{ t('clock.selectTask') }}</h3>
          <button type="button" class="clock__modal-close" :aria-label="t('todo.close')" @click="taskModalOpen = false">✕</button>
        </div>
        <p v-if="!todos.filteredTodos.length" class="clock__modal-empty">{{ t('todo.empty') }}</p>
        <ul v-else class="clock__task-list">
          <li v-for="todo in todos.filteredTodos" :key="todo.id">
            <button type="button" class="clock__task-list-item" @click="selectTask(todo.id)">{{ todo.title }}</button>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="sessionModalOpen" class="clock__overlay">
      <div class="clock__modal" role="dialog" aria-modal="true" :aria-label="t('clock.timeUp')">
        <h3>{{ mode === 'break' ? t('clock.timeUpFocusTitle') : t('clock.timeUpBreakTitle') }}</h3>
        <p>{{ mode === 'break' ? t('clock.startBreakPrompt') : t('clock.startFocusPrompt') }}</p>
        <div class="clock__modal-actions">
          <button type="button" @click="startNextSession">{{ t('clock.startNow') }}</button>
          <button type="button" class="clock__modal-secondary" @click="dismissSessionModal">{{ t('clock.later') }}</button>
        </div>
      </div>
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
  align-items: center;
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

.clock__bell-wrap {
  position: relative;
  display: flex;
}

.clock__bell {
  padding: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  outline: 2px solid #555;
  color: var(--color-text);
  background: linear-gradient(135deg, #f5e6d3, #e8d4c0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
}

.clock__bell:hover {
  filter: brightness(0.9);
}

.clock__bell--muted {
  opacity: 0.5;
}

.clock__bell-overlay {
  position: fixed;
  inset: 0;
  z-index: 19;
}

.clock__bell-panel {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.75rem;
  min-width: 220px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  text-align: left;
}

.clock__bell-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.clock__sound-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.clock__sound-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text);
}

.clock__sound-item label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.clock__sound-preview {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  padding: 0.1rem 0.5rem;
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

.clock__task {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  width: 100%;
}

.clock__task-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.clock__task-title {
  font-size: 1rem;
  font-weight: 600;
}

.clock__task-actions {
  display: flex;
  gap: 0.5rem;
}

.clock__task-finish {
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  border-radius: 6px;
  padding: 0.4rem 1rem;
}

.clock__task-change,
.clock__task-select {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: 6px;
  padding: 0.4rem 1rem;
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

.clock__duration select {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
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

.clock__overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
  padding: 1rem;
}

.clock__modal {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  width: 100%;
  max-width: 420px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 0.75rem;
  text-align: center;
}

.clock__modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
}

.clock__modal-header h3 {
  margin: 0;
}

.clock__modal-close {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  padding: 0.2rem 0.5rem;
}

.clock__modal-empty {
  color: var(--color-text-muted);
}

.clock__task-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  overflow-y: auto;
  text-align: left;
}

.clock__task-list-item {
  width: 100%;
  text-align: left;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  padding: 0.5rem 0.75rem;
}

.clock__task-list-item:hover {
  background-color: var(--color-surface-alt);
}

.clock__modal-actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.clock__modal-actions button {
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.25rem;
}

.clock__modal-secondary {
  background-color: var(--color-surface-alt) !important;
  color: var(--color-text) !important;
}
</style>
