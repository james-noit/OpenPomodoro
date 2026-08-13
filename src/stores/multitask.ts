import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import { useTodosStore } from './todos'
import type { MultitaskCard } from '../types/multitask'

export const DEFAULT_CAPACITY = 3

function createId(): string {
  return crypto.randomUUID()
}

export const useMultitaskStore = defineStore('multitask', () => {
  const todos = useTodosStore()

  const enabled = useLocalStorage<boolean>('openpomodoro.multitaskEnabled', false)
  const capacity = useLocalStorage<number>('openpomodoro.multitaskCapacity', DEFAULT_CAPACITY)
  const cards = useLocalStorage<MultitaskCard[]>('openpomodoro.multitaskCards', [])

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

  function setCapacity(n: number) {
    capacity.value = Math.max(1, Math.round(n))
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

  function reset() {
    enabled.value = false
    capacity.value = DEFAULT_CAPACITY
    cards.value = []
  }

  return {
    enabled,
    capacity,
    cards,
    assignedTaskIds,
    addCard,
    removeCard,
    assignTask,
    clearCard,
    finishCard,
    setCapacity,
    setEnabled,
    enableWithCurrentTask,
    reset,
  }
})
