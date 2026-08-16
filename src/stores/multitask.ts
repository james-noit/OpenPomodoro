import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import { useTodosStore } from './todos'
import type { MultitaskCard } from '../types/multitask'

function createId(): string {
  return crypto.randomUUID()
}

export const useMultitaskStore = defineStore('multitask', () => {
  const todos = useTodosStore()

  const enabled = useLocalStorage<boolean>('openpomodoro.multitaskEnabled', false)
  const cards = useLocalStorage<MultitaskCard[]>('openpomodoro.multitaskCards', [])
  const capacityTipDismissed = useLocalStorage<boolean>('openpomodoro.multitaskTipDismissed', false)

  const assignedTaskIds = computed(() => {
    const ids = new Set<string>()
    for (const card of cards.value) {
      if (card.taskId) ids.add(card.taskId)
    }
    return ids
  })

  function addCard(taskId: string | null = null) {
    cards.value.push({ id: createId(), taskId, createdAt: Date.now() })
  }

  function removeCard(cardId: string) {
    cards.value = cards.value.filter((card) => card.id !== cardId)
  }

  function assignTask(cardId: string, taskId: string | null) {
    const card = cards.value.find((c) => c.id === cardId)
    if (card) card.taskId = taskId
  }

  function clearCard(cardId: string) {
    assignTask(cardId, null)
  }

  function finishCard(cardId: string) {
    const card = cards.value.find((c) => c.id === cardId)
    if (!card || !card.taskId) return
    todos.toggleDone(card.taskId)
    card.taskId = null
  }

  function setEnabled(val: boolean) {
    enabled.value = val
  }

  function enableWithCurrentTask() {
    if (enabled.value) return
    enabled.value = true
    if (cards.value.length === 0 && todos.currentTask) {
      addCard(todos.currentTask.id)
    }
  }

  function dismissCapacityTip() {
    capacityTipDismissed.value = true
  }

  function reset() {
    enabled.value = false
    cards.value = []
    capacityTipDismissed.value = false
  }

  return {
    enabled,
    cards,
    capacityTipDismissed,
    assignedTaskIds,
    addCard,
    removeCard,
    assignTask,
    clearCard,
    finishCard,
    setEnabled,
    enableWithCurrentTask,
    dismissCapacityTip,
    reset,
  }
})
