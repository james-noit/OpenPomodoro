import { defineStore } from 'pinia'
import { useLocalStorage } from '../composables/useLocalStorage'

export type Theme = 'light' | 'dark' | 'japanese' | 'nordic'
export type Language = 'en' | 'es'
export type BellSoundId = 'digital' | 'classic' | 'siren' | 'buzzer'

export const DEFAULT_FOCUS_MINUTES = 25
export const DEFAULT_BREAK_MINUTES = 5
export const DEFAULT_BELL_SOUND_ID: BellSoundId = 'classic'

export const useSettingsStore = defineStore('settings', () => {
  const theme = useLocalStorage<Theme>('openpomodoro.theme', 'light')
  const language = useLocalStorage<Language>('openpomodoro.language', 'en')
  const focusMinutes = useLocalStorage<number>('openpomodoro.focusMinutes', DEFAULT_FOCUS_MINUTES)
  const breakMinutes = useLocalStorage<number>('openpomodoro.breakMinutes', DEFAULT_BREAK_MINUTES)
  const bellSound = useLocalStorage<boolean>('openpomodoro.bellSound', true)
  const bellSoundId = useLocalStorage<BellSoundId>('openpomodoro.bellSoundId', DEFAULT_BELL_SOUND_ID)

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

  function reset() {
    theme.value = 'light'
    language.value = 'en'
    focusMinutes.value = DEFAULT_FOCUS_MINUTES
    breakMinutes.value = DEFAULT_BREAK_MINUTES
    bellSound.value = true
    bellSoundId.value = DEFAULT_BELL_SOUND_ID
  }

  return {
    theme,
    language,
    focusMinutes,
    breakMinutes,
    bellSound,
    bellSoundId,
    setTheme,
    setLanguage,
    setFocusMinutes,
    setBreakMinutes,
    setBellSound,
    setBellSoundId,
    reset,
  }
})
