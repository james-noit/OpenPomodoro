<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTodosStore } from '../stores/todos'
import EisenhowerCard from './EisenhowerCard.vue'
import type { Todo } from '../types/todo'

const { t } = useI18n()
const todos = useTodosStore()

const activeTodos = computed(() => todos.sortTasks(todos.todos.filter((todo) => !todo.done)))

const isImportant = (todo: Todo) => todo.importance !== 'low'
const isUrgent = (todo: Todo) => todo.urgency !== 'low'

const doFirst = computed(() => activeTodos.value.filter((todo) => isImportant(todo) && isUrgent(todo)))
const schedule = computed(() => activeTodos.value.filter((todo) => isImportant(todo) && !isUrgent(todo)))
const delegate = computed(() => activeTodos.value.filter((todo) => !isImportant(todo) && isUrgent(todo)))
const eliminate = computed(() => activeTodos.value.filter((todo) => !isImportant(todo) && !isUrgent(todo)))
</script>

<template>
  <main class="eisenhower-view">
    <h2>{{ t('eisenhower.title') }}</h2>
    <p v-if="!activeTodos.length" class="eisenhower-view__empty">{{ t('todo.empty') }}</p>
    <div v-else class="eisenhower-view__grid">
      <section class="eisenhower-quadrant eisenhower-quadrant--do-first">
        <header class="eisenhower-quadrant__header">
          <h3>{{ t('eisenhower.doFirst') }}</h3>
          <span class="eisenhower-quadrant__hint">{{ t('eisenhower.doFirstHint') }}</span>
        </header>
        <ul class="eisenhower-quadrant__list">
          <EisenhowerCard v-for="todo in doFirst" :key="todo.id" :todo="todo" />
          <li v-if="!doFirst.length" class="eisenhower-quadrant__empty">{{ t('eisenhower.empty') }}</li>
        </ul>
      </section>

      <section class="eisenhower-quadrant eisenhower-quadrant--schedule">
        <header class="eisenhower-quadrant__header">
          <h3>{{ t('eisenhower.schedule') }}</h3>
          <span class="eisenhower-quadrant__hint">{{ t('eisenhower.scheduleHint') }}</span>
        </header>
        <ul class="eisenhower-quadrant__list">
          <EisenhowerCard v-for="todo in schedule" :key="todo.id" :todo="todo" />
          <li v-if="!schedule.length" class="eisenhower-quadrant__empty">{{ t('eisenhower.empty') }}</li>
        </ul>
      </section>

      <section class="eisenhower-quadrant eisenhower-quadrant--delegate">
        <header class="eisenhower-quadrant__header">
          <h3>{{ t('eisenhower.delegate') }}</h3>
          <span class="eisenhower-quadrant__hint">{{ t('eisenhower.delegateHint') }}</span>
        </header>
        <ul class="eisenhower-quadrant__list">
          <EisenhowerCard v-for="todo in delegate" :key="todo.id" :todo="todo" />
          <li v-if="!delegate.length" class="eisenhower-quadrant__empty">{{ t('eisenhower.empty') }}</li>
        </ul>
      </section>

      <section class="eisenhower-quadrant eisenhower-quadrant--eliminate">
        <header class="eisenhower-quadrant__header">
          <h3>{{ t('eisenhower.eliminate') }}</h3>
          <span class="eisenhower-quadrant__hint">{{ t('eisenhower.eliminateHint') }}</span>
        </header>
        <ul class="eisenhower-quadrant__list">
          <EisenhowerCard v-for="todo in eliminate" :key="todo.id" :todo="todo" />
          <li v-if="!eliminate.length" class="eisenhower-quadrant__empty">{{ t('eisenhower.empty') }}</li>
        </ul>
      </section>

      <span class="eisenhower-view__axis eisenhower-view__axis--urgent-top">{{ t('eisenhower.axisUrgent') }}</span>
      <span class="eisenhower-view__axis eisenhower-view__axis--urgent-bottom">{{ t('eisenhower.axisNotUrgent') }}</span>
      <span class="eisenhower-view__axis eisenhower-view__axis--important-left">{{ t('eisenhower.axisImportant') }}</span>
    </div>
  </main>
</template>

<style scoped>
.eisenhower-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
}

.eisenhower-view h2 {
  margin: 0;
}

.eisenhower-view__empty {
  color: var(--color-text-muted);
}

.eisenhower-view__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 0.75rem;
  position: relative;
}

.eisenhower-quadrant {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.75rem;
  min-height: 160px;
  border-top: 4px solid var(--color-border);
}

.eisenhower-quadrant--do-first {
  border-top-color: var(--color-high);
}

.eisenhower-quadrant--schedule {
  border-top-color: var(--color-medium);
}

.eisenhower-quadrant--delegate {
  border-top-color: var(--color-medium);
}

.eisenhower-quadrant--eliminate {
  border-top-color: var(--color-low);
}

.eisenhower-quadrant__header {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.eisenhower-quadrant__header h3 {
  margin: 0;
  font-size: 0.95rem;
}

.eisenhower-quadrant__hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.eisenhower-quadrant__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  overflow-y: auto;
}

.eisenhower-quadrant__empty {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.eisenhower-view__axis {
  display: none;
}

@media (min-width: 700px) {
  .eisenhower-view__grid {
    padding: 1.5rem 0 0 4.5rem;
  }

  .eisenhower-view__axis {
    display: block;
    position: absolute;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--color-text-muted);
    letter-spacing: 0.02em;
  }

  .eisenhower-view__axis--urgent-top {
    top: 0;
    left: 4.5rem;
    right: 0;
    text-align: center;
  }

  .eisenhower-view__axis--urgent-bottom {
    bottom: -1.25rem;
    left: 4.5rem;
    right: 0;
    text-align: center;
  }

  .eisenhower-view__axis--important-left {
    top: 1.5rem;
    bottom: 0;
    left: 0;
    width: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    writing-mode: vertical-lr;
    transform: rotate(180deg);
  }

}
</style>
