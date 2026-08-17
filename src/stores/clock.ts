import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from './settings'
import type { BellSoundId } from './settings'

export type ClockMode = 'focus' | 'break'

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

export function playSound(id: BellSoundId) {
  const ctx = getAudioCtx()
  if (id === 'digital') {
    for (let i = 0; i < 10; i++) {
      playNote(ctx, 1200, i * 0.2, 0.1, 'square', 0.35)
    }
  } else if (id === 'classic') {
    for (let i = 0; i < 10; i++) {
      playNote(ctx, i % 2 === 0 ? 880 : 1108.7, i * 0.2, 0.2, 'square', 0.32)
    }
  } else if (id === 'siren') {
    for (let i = 0; i < 10; i++) {
      playNote(ctx, i % 2 === 0 ? 600 : 1400, i * 0.2, 0.2, 'sawtooth', 0.3)
    }
  } else if (id === 'buzzer') {
    for (let i = 0; i < 5; i++) {
      playNote(ctx, 220, i * 0.4, 0.35, 'sawtooth', 0.35)
    }
  }
}

export const useClockStore = defineStore('clock', () => {
  const settings = useSettingsStore()
  const { t } = useI18n()

  const mode = ref<ClockMode>('focus')
  const running = ref(false)
  let intervalId: ReturnType<typeof setInterval> | undefined
  let hasTicked = false

  const durationSeconds = computed(() =>
    mode.value === 'focus' ? settings.focusSeconds : settings.breakSeconds,
  )
  const totalSeconds = computed(() => durationSeconds.value)
  const remainingSeconds = ref(totalSeconds.value)

  function adjustDuration(deltaSeconds: number) {
    if (running.value) return
    if (mode.value === 'focus') settings.setFocusSeconds(settings.focusSeconds + deltaSeconds)
    else settings.setBreakSeconds(settings.breakSeconds + deltaSeconds)
  }

  watch([mode, totalSeconds], () => {
    if (!running.value) remainingSeconds.value = totalSeconds.value
  })

  const sessionModalOpen = ref(false)
  const lastFocusEndAt = ref<number | null>(null)

  function ensureNotificationPermission() {
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'default') {
      void Notification.requestPermission()
    }
  }

  function sendNotification(finishedMode: ClockMode) {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const body = finishedMode === 'focus' ? t('clock.notificationBodyFocus') : t('clock.notificationBodyBreak')
    new Notification(t('clock.notificationTitle'), { body })
  }

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
    const wasFocus = mode.value === 'focus'
    mode.value = mode.value === 'focus' ? 'break' : 'focus'
    hasTicked = false
    sessionModalOpen.value = true
    if (wasFocus) lastFocusEndAt.value = Date.now()
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

  function setMode(next: ClockMode) {
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

  return {
    mode,
    running,
    remainingSeconds,
    durationSeconds,
    totalSeconds,
    sessionModalOpen,
    lastFocusEndAt,
    ensureNotificationPermission,
    start,
    pause,
    reset,
    setMode,
    adjustDuration,
    startNextSession,
    dismissSessionModal,
  }
})
