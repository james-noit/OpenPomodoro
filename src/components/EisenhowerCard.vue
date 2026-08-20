<script setup lang="ts">
import { useTodosStore } from '../stores/todos'
import TaskProjectTag from './TaskProjectTag.vue'
import type { Todo } from '../types/todo'
import type { EisenhowerViewMode } from '../types/eisenhower'

const props = defineProps<{ todo: Todo; viewMode: EisenhowerViewMode }>()
const emit = defineEmits<{ open: [todoId: string] }>()
const todos = useTodosStore()
</script>

<template>
  <li
    class="eisenhower-card"
    :class="[`eisenhower-card--${props.viewMode}`, { 'eisenhower-card--dragging': todos.draggedId === props.todo.id }]"
    draggable="true"
    @dragstart="todos.startDrag(props.todo.id)"
    @dragend="todos.endDrag()"
    @click="emit('open', props.todo.id)"
  >
    <input
      v-if="props.viewMode === 'detailed'"
      type="checkbox"
      :checked="props.todo.done"
      @click.stop
      @change="todos.toggleDone(props.todo.id)"
    />
    <div class="eisenhower-card__content">
      <span class="eisenhower-card__title">{{ props.todo.title }}</span>
      <TaskProjectTag v-if="props.viewMode === 'detailed'" :todo="props.todo" />
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
  cursor: pointer;
  transition: opacity 0.15s;
  min-width: 0;
  overflow: hidden;
}

.eisenhower-card--dragging {
  opacity: 0.4;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  font-size: 0.9rem;
}

.eisenhower-card--compact {
  padding: 0.4rem 0.6rem;
}

.eisenhower-card--compact .eisenhower-card__title {
  font-size: 0.85rem;
}

.eisenhower-card--minimal {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.eisenhower-card--minimal .eisenhower-card__title {
  font-size: 0.8rem;
}
</style>
