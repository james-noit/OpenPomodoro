<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTodosStore } from '../stores/todos'
import TaskProjectTag from './TaskProjectTag.vue'
import type { Todo } from '../types/todo'

const props = defineProps<{ todo: Todo }>()
const { t } = useI18n()
const todos = useTodosStore()

function onDragOver(event: DragEvent) {
  event.preventDefault()
  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const before = event.clientY < rect.top + rect.height / 2
  todos.dragOverTodo(props.todo.id, before)
}
</script>

<template>
  <li
    class="todo-item"
    :class="{ 'todo-item--done': props.todo.done, 'todo-item--dragging': todos.draggedId === props.todo.id }"
    draggable="true"
    @dragstart="todos.startDrag(props.todo.id)"
    @dragover="onDragOver"
    @drop.prevent="todos.endDrag()"
    @dragend="todos.endDrag()"
  >
    <span class="todo-item__handle" :aria-label="t('todo.dragHandle')" aria-hidden="true">⠿</span>
    <input
      type="checkbox"
      :checked="props.todo.done"
      @change="todos.toggleDone(props.todo.id)"
    />
    <span class="todo-item__title">{{ props.todo.title }}</span>
    <div class="todo-item__badges">
      <span class="badge" :class="`badge--${props.todo.importance}`">{{ t(`todo.${props.todo.importance}`) }}</span>
      <span class="badge" :class="`badge--${props.todo.urgency}`">{{ t(`todo.${props.todo.urgency}`) }}</span>
      <span v-for="tag in props.todo.tags" :key="tag" class="badge badge--tag">{{ tag }}</span>
    </div>
    <TaskProjectTag :todo="props.todo" />
    <button type="button" class="todo-item__delete" :aria-label="t('todo.delete')" @click="todos.removeTodo(props.todo.id)">✕</button>
  </li>
</template>

<style scoped>
.todo-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-surface);
  transition: opacity 0.15s, transform 0.15s;
  overflow-x: auto;
}

.todo-item--done .todo-item__title {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.todo-item--dragging {
  opacity: 0.4;
}

.todo-item__handle {
  cursor: grab;
  color: var(--color-text-muted);
  line-height: 1.6;
  user-select: none;
  flex-shrink: 0;
}

.todo-item__title {
  flex: 1 1 auto;
  min-width: 4rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.todo-item__badges {
  display: flex;
  gap: 0.35rem;
  flex-shrink: 0;
}

.badge {
  font-size: 0.7rem;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background-color: var(--color-surface-alt);
  color: var(--color-text-muted);
  white-space: nowrap;
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

.todo-item__delete {
  flex-shrink: 0;
  min-width: 2.25rem;
  min-height: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  padding: 0.2rem 0.5rem;
}

.todo-item input[type='checkbox'] {
  width: 1.15rem;
  height: 1.15rem;
  flex-shrink: 0;
}
</style>
