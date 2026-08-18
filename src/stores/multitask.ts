import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import { useTodosStore } from './todos'
import type { AccomplishmentMark, MultitaskCard } from '../types/multitask'

function createId(): string {
  return crypto.randomUUID()
}

const DISSOLVE_DELAY_MS = 5000

export const useMultitaskStore = defineStore('multitask', () => {
  const todos = useTodosStore()

  const enabled = useLocalStorage<boolean>('openpomodoro.multitaskEnabled', false)
  const cards = useLocalStorage<MultitaskCard[]>('openpomodoro.multitaskCards', [])
  const capacityTipDismissed = useLocalStorage<boolean>('openpomodoro.multitaskTipDismissed', false)

  // Cards persisted before the accomplishments/lastAnsweredPhaseEndAt fields existed
  // are missing them entirely (useLocalStorage has no migration step) — backfill once
  // on load so every read site downstream can assume the full shape.
  for (const card of cards.value) {
    if (!card.accomplishments) card.accomplishments = []
    if (card.lastAnsweredPhaseEndAt === undefined) card.lastAnsweredPhaseEndAt = null
  }

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
    cards.value.push({ id, taskId, createdAt: Date.now(), accomplishments: [], lastAnsweredPhaseEndAt: null })
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

  // Finish/Clear both retire the row entirely now (the row animates itself out,
  // then calls these) — unlike the old "clear the task but keep the empty card"
  // behavior, there is no longer an empty-but-kept state reachable from either action.
  function clearCard(cardId: string) {
    removeCard(cardId)
  }

  function finishCard(cardId: string) {
    const card = cards.value.find((c) => c.id === cardId)
    if (!card || !card.taskId) return
    todos.toggleDone(card.taskId)
    removeCard(cardId)
  }

  function recordAccomplishment(cardId: string, marks: AccomplishmentMark[], phaseEndAt: number) {
    const card = cards.value.find((c) => c.id === cardId)
    if (!card) return
    if (!card.accomplishments) card.accomplishments = []
    card.accomplishments.push(...marks)
    card.lastAnsweredPhaseEndAt = phaseEndAt
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
    recordAccomplishment,
    cancelDissolve,
    scheduleDissolveIfEmpty,
    setEnabled,
    enableWithCurrentTask,
    dismissCapacityTip,
    reset,
  }
})
