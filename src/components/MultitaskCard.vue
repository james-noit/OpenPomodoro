<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTodosStore } from '../stores/todos'
import { useMultitaskStore } from '../stores/multitask'
import { useClockStore } from '../stores/clock'
import { useAdvanceHistoryStore } from '../stores/advanceHistory'
import AdvanceCheckPopover from './AdvanceCheckPopover.vue'
import type { MultitaskCard, AdvanceProgress } from '../types/multitask'

const props = defineProps<{ card: MultitaskCard; borderColor: string }>()

const { t } = useI18n()
const todos = useTodosStore()
const multitask = useMultitaskStore()
const clock = useClockStore()
const advanceHistory = useAdvanceHistoryStore()

const task = computed(() => todos.todos.find((todo) => todo.id === props.card.taskId) ?? null)

const taskModalOpen = ref(false)

const pickableTasks = computed(() =>
  todos.filteredTodos.filter((todo) => !multitask.assignedTaskIds.has(todo.id) || todo.id === props.card.taskId),
)

function openTaskModal() {
  taskModalOpen.value = true
}

function selectTask(id: string) {
  multitask.assignTask(props.card.id, id)
  taskModalOpen.value = false
}

function finishTask() {
  multitask.finishCard(props.card.id)
}

function clearTask() {
  multitask.clearCard(props.card.id)
}

const answeredForCurrentPhase = computed(() =>
  advanceHistory.records.some(
    (record) => record.cardId === props.card.id && record.phaseEndedAt === clock.lastFocusEndAt,
  ),
)

const showAdvanceCheck = computed(
  () => props.card.taskId !== null && clock.lastFocusEndAt !== null && !answeredForCurrentPhase.value,
)

function onAdvanceAnswer(progress: AdvanceProgress) {
  if (!props.card.taskId || clock.lastFocusEndAt === null) return
  advanceHistory.recordAdvance(props.card.id, props.card.taskId, clock.lastFocusEndAt, progress)
}
</script>

<template>
  <div class="multitask-card" :style="{ borderTopColor: borderColor }">
    <button
      type="button"
      class="multitask-card__remove"
      :aria-label="t('multitask.removeCard')"
      @click="multitask.removeCard(card.id)"
    >
      ✕
    </button>

    <div class="multitask-card__body">
      <template v-if="task">
        <span class="multitask-card__title">{{ task.title }}</span>
        <div class="multitask-card__actions">
          <button type="button" class="multitask-card__finish" @click="finishTask">
            <span class="multitask-card__icon" aria-hidden="true">✓</span>
            <span class="multitask-card__label">{{ t('multitask.finish') }}</span>
          </button>
          <button type="button" class="multitask-card__clear" @click="clearTask">
            <span class="multitask-card__icon" aria-hidden="true">↺</span>
            <span class="multitask-card__label">{{ t('multitask.clear') }}</span>
          </button>
        </div>
      </template>
      <template v-else>
        <button type="button" class="multitask-card__select" @click="openTaskModal">
          <span class="multitask-card__icon" aria-hidden="true">+</span>
          <span class="multitask-card__label">{{ t('clock.selectTask') }}</span>
        </button>
      </template>
    </div>

    <div v-if="taskModalOpen" class="multitask-card__overlay" @click.self="taskModalOpen = false">
      <div class="multitask-card__modal" role="dialog" aria-modal="true" :aria-label="t('clock.selectTask')">
        <div class="multitask-card__modal-header">
          <h3>{{ t('clock.selectTask') }}</h3>
          <button type="button" class="multitask-card__modal-close" :aria-label="t('todo.close')" @click="taskModalOpen = false">✕</button>
        </div>
        <p v-if="!pickableTasks.length" class="multitask-card__modal-empty">{{ t('todo.empty') }}</p>
        <ul v-else class="multitask-card__task-list">
          <li v-for="todo in pickableTasks" :key="todo.id">
            <button type="button" class="multitask-card__task-list-item" @click="selectTask(todo.id)">{{ todo.title }}</button>
          </li>
        </ul>
      </div>
    </div>

    <AdvanceCheckPopover :open="showAdvanceCheck" @answer="onAdvanceAnswer" />
  </div>
</template>

<style scoped>
.multitask-card {
  position: relative;
  container-type: inline-size;
  flex: 1 1 0;
  min-width: 3.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-top: 4px solid var(--color-border);
  border-radius: 8px;
  padding: 1.25rem 0.75rem 0.85rem;
  min-height: 140px;
  text-align: center;
}

.multitask-card__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  min-width: 0;
}

.multitask-card__remove {
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  background: none;
  border: none;
  color: var(--color-text-muted);
  padding: 0.2rem;
  line-height: 1;
  border-radius: 4px;
}

.multitask-card__remove:hover {
  background-color: var(--color-surface-alt);
  color: var(--color-text);
}

.multitask-card__title {
  display: block;
  width: 100%;
  font-size: 1rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.multitask-card__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.multitask-card__finish,
.multitask-card__clear,
.multitask-card__select {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.multitask-card__finish {
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  border-radius: 6px;
  padding: 0.4rem 1rem;
}

.multitask-card__clear,
.multitask-card__select {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: 6px;
  padding: 0.4rem 1rem;
}

@container (max-width: 150px) {
  .multitask-card__title {
    font-size: 0.8rem;
  }

  .multitask-card__actions {
    flex-direction: column;
  }

  .multitask-card__finish,
  .multitask-card__clear,
  .multitask-card__select {
    width: 100%;
    justify-content: center;
    padding: 0.3rem 0.4rem;
    font-size: 0.75rem;
  }
}

@container (max-width: 90px) {
  .multitask-card__title {
    font-size: 0.7rem;
  }

  .multitask-card__label {
    display: none;
  }

  .multitask-card__finish,
  .multitask-card__clear,
  .multitask-card__select {
    padding: 0.35rem;
  }
}

.multitask-card__overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
  padding: 1rem;
}

.multitask-card__modal {
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

.multitask-card__modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
}

.multitask-card__modal-header h3 {
  margin: 0;
}

.multitask-card__modal-close {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  padding: 0.2rem 0.5rem;
}

.multitask-card__modal-empty {
  color: var(--color-text-muted);
}

.multitask-card__task-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  overflow-y: auto;
  text-align: left;
}

.multitask-card__task-list-item {
  width: 100%;
  text-align: left;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  padding: 0.5rem 0.75rem;
}

.multitask-card__task-list-item:hover {
  background-color: var(--color-surface-alt);
}
</style>
