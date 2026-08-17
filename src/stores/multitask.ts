import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import { useTodosStore } from './todos'
import type { MultitaskCard } from '../types/multitask'

function createId(): string {
  return crypto.randomUUID()
}

const DISSOLVE_DELAY_MS = 5000

export const useMultitaskStore = defineStore('multitask', () => {
  const todos = useTodosStore()

  const enabled = useLocalStorage<boolean>('openpomodoro.multitaskEnabled', false)
  const cards = useLocalStorage<MultitaskCard[]>('openpomodoro.multitaskCards', [])
  const capacityTipDismissed = useLocalStorage<boolean>('openpomodoro.multitaskTipDismissed', false)

  const dissolveTimers = new Map<string, ReturnType<typeof setTimeout>>()

  function cancelDissolve(cardId: string) {
    const timer = dissolveTimers.get(cardId)
    if (timer) {
      clearTimeout(timer)
      dissolveTimers.delete(cardId)
    }
  }

  function scheduleDissolveIfEmpty(cardId: string) {
    cancelDissolve(cardId)
    const card = cards.value.find((c) => c.id === cardId)
    if (!card || card.taskId !== null) return
    dissolveTimers.set(
      cardId,
      setTimeout(() => {
        dissolveTimers.delete(cardId)
        removeCard(cardId)
      }, DISSOLVE_DELAY_MS),
    )
  }

  const assignedTaskIds = computed(() => {
    const ids = new Set<string>()
    for (const card of cards.value) {
      if (card.taskId) ids.add(card.taskId)
    }
    return ids
  })

  function addCard(taskId: string | null = null) {
    const id = createId()
    cards.value.push({ id, taskId, createdAt: Date.now() })
    if (taskId === null) scheduleDissolveIfEmpty(id)
  }

  function removeCard(cardId: string) {
    cancelDissolve(cardId)
    cards.value = cards.value.filter((card) => card.id !== cardId)
  }

  function assignTask(cardId: string, taskId: string | null) {
    const card = cards.value.find((c) => c.id === cardId)
    if (!card) return
    card.taskId = taskId
    if (taskId !== null) cancelDissolve(cardId)
  }

  function clearCard(cardId: string) {
    assignTask(cardId, null)
    scheduleDissolveIfEmpty(cardId)
  }

  function finishCard(cardId: string) {
    const card = cards.value.find((c) => c.id === cardId)
    if (!card || !card.taskId) return
    todos.toggleDone(card.taskId)
    card.taskId = null
    scheduleDissolveIfEmpty(cardId)
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
    for (const cardId of Array.from(dissolveTimers.keys())) cancelDissolve(cardId)
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
    cancelDissolve,
    scheduleDissolveIfEmpty,
    setEnabled,
    enableWithCurrentTask,
    dismissCapacityTip,
    reset,
  }
})
