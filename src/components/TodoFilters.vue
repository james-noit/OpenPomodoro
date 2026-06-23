<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTodosStore } from '../stores/todos'
import type { Priority } from '../types/todo'

const { t } = useI18n()
const todos = useTodosStore()

function onImportance(event: Event) {
  todos.setFilters({ importance: (event.target as HTMLSelectElement).value as Priority | 'all' })
}

function onUrgency(event: Event) {
  todos.setFilters({ urgency: (event.target as HTMLSelectElement).value as Priority | 'all' })
}

function onTag(event: Event) {
  todos.setFilters({ tag: (event.target as HTMLSelectElement).value })
}
</script>

<template>
  <div class="todo-filters">
    <label>
      {{ t('todo.importance') }}
      <select :value="todos.filters.importance" @change="onImportance">
        <option value="all">{{ t('todo.filterAll') }}</option>
        <option value="low">{{ t('todo.low') }}</option>
        <option value="medium">{{ t('todo.medium') }}</option>
        <option value="high">{{ t('todo.high') }}</option>
      </select>
    </label>
    <label>
      {{ t('todo.urgency') }}
      <select :value="todos.filters.urgency" @change="onUrgency">
        <option value="all">{{ t('todo.filterAll') }}</option>
        <option value="low">{{ t('todo.low') }}</option>
        <option value="medium">{{ t('todo.medium') }}</option>
        <option value="high">{{ t('todo.high') }}</option>
      </select>
    </label>
    <label>
      {{ t('todo.tags') }}
      <select :value="todos.filters.tag" @change="onTag">
        <option value="all">{{ t('todo.filterAll') }}</option>
        <option v-for="tag in todos.allTags" :key="tag" :value="tag">{{ tag }}</option>
      </select>
    </label>
  </div>
</template>

<style scoped>
.todo-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.todo-filters label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  flex: 1 1 120px;
}

.todo-filters select {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
}
</style>
