import { defineStore } from 'pinia'
import { useLocalStorage } from '../composables/useLocalStorage'

export type Theme = 'light' | 'dark'
export type Language = 'en' | 'es'

export const DEFAULT_FOCUS_MINUTES = 25
export const DEFAULT_BREAK_MINUTES = 5

export const useSettingsStore = defineStore('settings', () => {
  const theme = useLocalStorage<Theme>('openpomodoro.theme', 'dark')
  const language = useLocalStorage<Language>('openpomodoro.language', 'en')
  const focusMinutes = useLocalStorage<number>('openpomodoro.focusMinutes', DEFAULT_FOCUS_MINUTES)
  const breakMinutes = useLocalStorage<number>('openpomodoro.breakMinutes', DEFAULT_BREAK_MINUTES)
  const bellSound = useLocalStorage<boolean>('openpomodoro.bellSound', true)

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
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

  function reset() {
    theme.value = 'dark'
    language.value = 'en'
    focusMinutes.value = DEFAULT_FOCUS_MINUTES
    breakMinutes.value = DEFAULT_BREAK_MINUTES
    bellSound.value = true
  }

  return {
    theme,
    language,
    focusMinutes,
    breakMinutes,
    bellSound,
    toggleTheme,
    setLanguage,
    setFocusMinutes,
    setBreakMinutes,
    setBellSound,
    reset,
  }
})
