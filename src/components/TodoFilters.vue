<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTodosStore } from '../stores/todos'
import type { Priority } from '../types/todo'

const { t } = useI18n()
const todos = useTodosStore()

const open = ref(false)

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

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
    <button
      type="button"
      class="todo-filters__trigger"
      aria-haspopup="true"
      :aria-expanded="open"
      @click="toggle"
    >
      {{ t('todo.filterToDos') }}
    </button>
    <div v-if="open" class="todo-filters__overlay" @click="close"></div>
    <div v-if="open" class="todo-filters__panel" role="dialog" :aria-label="t('todo.filterToDos')">
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
  </div>
</template>

<style scoped>
.todo-filters {
  position: relative;
}

.todo-filters__trigger {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  padding: 0.6rem 0.9rem;
}

.todo-filters__trigger:hover {
  background-color: var(--color-surface-alt);
}

.todo-filters__overlay {
  position: fixed;
  inset: 0;
  z-index: 19;
}

.todo-filters__panel {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.25rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  min-width: 220px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.todo-filters__panel label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.todo-filters__panel select {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
}
</style>
