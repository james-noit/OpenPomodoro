import { defineStore } from 'pinia'
import { useLocalStorage } from '../composables/useLocalStorage'
import type { AdvanceProgress, AdvanceRecord } from '../types/multitask'

export const useAdvanceHistoryStore = defineStore('advanceHistory', () => {
  const records = useLocalStorage<AdvanceRecord[]>('openpomodoro.advanceHistory', [])

  function recordAdvance(cardId: string, taskId: string, phaseEndedAt: number, progress: AdvanceProgress) {
    records.value.push({ cardId, taskId, phaseEndedAt, progress, recordedAt: Date.now() })
  }

  function reset() {
    records.value = []
  }

  return {
    records,
    recordAdvance,
    reset,
  }
})
