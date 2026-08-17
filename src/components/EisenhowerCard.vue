<script setup lang="ts">
import { useTodosStore } from '../stores/todos'
import TaskProjectTag from './TaskProjectTag.vue'
import type { Todo } from '../types/todo'

const props = defineProps<{ todo: Todo }>()
const todos = useTodosStore()
</script>

<template>
  <li class="eisenhower-card">
    <input
      type="checkbox"
      :checked="props.todo.done"
      @change="todos.toggleDone(props.todo.id)"
    />
    <div class="eisenhower-card__content">
      <span class="eisenhower-card__title">{{ props.todo.title }}</span>
      <TaskProjectTag :todo="props.todo" />
    </div>
  </li>
</template>

<style scoped>
.eisenhower-card {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-surface);
}

.eisenhower-card input[type='checkbox'] {
  margin-top: 0.15rem;
  width: 1.05rem;
  height: 1.05rem;
  flex-shrink: 0;
}

.eisenhower-card__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.eisenhower-card__title {
  overflow-wrap: break-word;
  font-size: 0.9rem;
}
</style>
