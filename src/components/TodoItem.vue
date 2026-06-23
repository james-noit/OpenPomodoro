<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTodosStore } from '../stores/todos'
import type { Todo } from '../types/todo'

const props = defineProps<{ todo: Todo; isFirst: boolean; isLast: boolean }>()
const { t } = useI18n()
const todos = useTodosStore()
</script>

<template>
  <li class="todo-item" :class="{ 'todo-item--done': props.todo.done }">
    <input
      type="checkbox"
      :checked="props.todo.done"
      @change="todos.toggleDone(props.todo.id)"
    />
    <div class="todo-item__content">
      <span class="todo-item__title">{{ props.todo.title }}</span>
      <div class="todo-item__badges">
        <span class="badge" :class="`badge--${props.todo.importance}`">{{ t(`todo.${props.todo.importance}`) }}</span>
        <span class="badge" :class="`badge--${props.todo.urgency}`">{{ t(`todo.${props.todo.urgency}`) }}</span>
        <span v-for="tag in props.todo.tags" :key="tag" class="badge badge--tag">{{ tag }}</span>
      </div>
    </div>
    <div class="todo-item__actions">
      <button
        type="button"
        :disabled="props.isFirst"
        :aria-label="t('todo.moveUp')"
        @click="todos.moveTodo(props.todo.id, -1)"
      >
        ↑
      </button>
      <button
        type="button"
        :disabled="props.isLast"
        :aria-label="t('todo.moveDown')"
        @click="todos.moveTodo(props.todo.id, 1)"
      >
        ↓
      </button>
      <button type="button" :aria-label="t('todo.delete')" @click="todos.removeTodo(props.todo.id)">✕</button>
    </div>
  </li>
</template>

<style scoped>
.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-surface);
}

.todo-item--done .todo-item__title {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.todo-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.todo-item__badges {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.badge {
  font-size: 0.7rem;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background-color: var(--color-surface-alt);
  color: var(--color-text-muted);
}

.badge--low {
  background-color: var(--color-low);
  color: #fff;
}

.badge--medium {
  background-color: var(--color-medium);
  color: #fff;
}

.badge--high {
  background-color: var(--color-high);
  color: #fff;
}

.todo-item__actions {
  display: flex;
  gap: 0.25rem;
}

.todo-item__actions button {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  padding: 0.2rem 0.5rem;
}

.todo-item__actions button:disabled {
  opacity: 0.4;
  cursor: default;
}
</style>
