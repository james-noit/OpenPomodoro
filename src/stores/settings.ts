import { defineStore } from 'pinia'
import { useLocalStorage } from '../composables/useLocalStorage'

export type Theme = 'light' | 'dark' | 'japanese' | 'nordic'
export type Language = 'en' | 'es'
export type BellSoundId = 'digital' | 'classic' | 'siren' | 'buzzer'
export type ClockStyle = 'boxes' | 'ring'
export type BoxClockOrder = 'sequential' | 'random'

export const DEFAULT_FOCUS_MINUTES = 25
export const DEFAULT_BREAK_MINUTES = 5
export const DEFAULT_BELL_SOUND_ID: BellSoundId = 'classic'
export const DEFAULT_CLOCK_STYLE: ClockStyle = 'boxes'
export const DEFAULT_BOX_CLOCK_ORDER: BoxClockOrder = 'sequential'

export const useSettingsStore = defineStore('settings', () => {
  const theme = useLocalStorage<Theme>('openpomodoro.theme', 'light')
  const language = useLocalStorage<Language>('openpomodoro.language', 'en')
  const focusMinutes = useLocalStorage<number>('openpomodoro.focusMinutes', DEFAULT_FOCUS_MINUTES)
  const breakMinutes = useLocalStorage<number>('openpomodoro.breakMinutes', DEFAULT_BREAK_MINUTES)
  const bellSound = useLocalStorage<boolean>('openpomodoro.bellSound', true)
  const bellSoundId = useLocalStorage<BellSoundId>('openpomodoro.bellSoundId', DEFAULT_BELL_SOUND_ID)
  const clockStyle = useLocalStorage<ClockStyle>('openpomodoro.clockStyle', DEFAULT_CLOCK_STYLE)
  const boxClockOrder = useLocalStorage<BoxClockOrder>('openpomodoro.boxClockOrder', DEFAULT_BOX_CLOCK_ORDER)

  function setTheme(next: Theme) {
    theme.value = next
  }

  function setLanguage(lang: Language) {
    language.value = lang
  }

  function setFocusMinutes(minutes: number) {
    focusMinutes.value = Math.max(1, Math.min(180, Math.round(minutes)))
  }

  function setBreakMinutes(minutes: number) {
    breakMinutes.value = Math.max(1, Math.min(60, Math.round(minutes)))
  }

  function setBellSound(val: boolean) {
    bellSound.value = val
  }

  function setBellSoundId(id: BellSoundId) {
    bellSoundId.value = id
  }

  function setClockStyle(style: ClockStyle) {
    clockStyle.value = style
  }

  function setBoxClockOrder(order: BoxClockOrder) {
    boxClockOrder.value = order
  }

  function reset() {
    theme.value = 'light'
    language.value = 'en'
    focusMinutes.value = DEFAULT_FOCUS_MINUTES
    breakMinutes.value = DEFAULT_BREAK_MINUTES
    bellSound.value = true
    bellSoundId.value = DEFAULT_BELL_SOUND_ID
    clockStyle.value = DEFAULT_CLOCK_STYLE
    boxClockOrder.value = DEFAULT_BOX_CLOCK_ORDER
  }

  return {
    theme,
    language,
    focusMinutes,
    breakMinutes,
    bellSound,
    bellSoundId,
    clockStyle,
    boxClockOrder,
    setTheme,
    setLanguage,
    setFocusMinutes,
    setBreakMinutes,
    setBellSound,
    setBellSoundId,
    setClockStyle,
    setBoxClockOrder,
    reset,
  }
})
