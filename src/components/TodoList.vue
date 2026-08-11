<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTodosStore } from '../stores/todos'
import TodoForm from './TodoForm.vue'
import TodoFilters from './TodoFilters.vue'
import TodoItem from './TodoItem.vue'
import CompletedTasksStack from './CompletedTasksStack.vue'

const { t } = useI18n()
const todos = useTodosStore()
</script>

<template>
  <section class="todo-list">
    <h2>{{ t('todo.title') }}</h2>
    <TodoForm />
    <div v-if="todos.todos.length" class="todo-list__toolbar">
      <TodoFilters />
      <CompletedTasksStack v-if="todos.completedTodos.length" />
    </div>
    <p v-if="!todos.filteredTodos.length" class="todo-list__empty">{{ t('todo.empty') }}</p>
    <ul v-else class="todo-list__items">
      <TodoItem
        v-for="(todo, index) in todos.filteredTodos"
        :key="todo.id"
        :todo="todo"
        :is-first="index === 0"
        :is-last="index === todos.filteredTodos.length - 1"
      />
    </ul>
  </section>
</template>

<style scoped>
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.todo-list h2 {
  margin: 0;
}

.todo-list__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.todo-list__items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.todo-list__empty {
  color: var(--color-text-muted);
}
</style>
