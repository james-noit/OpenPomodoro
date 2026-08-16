<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTodosStore } from '../stores/todos'
import TodoForm from './TodoForm.vue'
import TodoFilters from './TodoFilters.vue'
import TodoItem from './TodoItem.vue'
import CompletedTasksStack from './CompletedTasksStack.vue'
import ProjectsPanel from './ProjectsPanel.vue'

const { t } = useI18n()
const todos = useTodosStore()
</script>

<template>
  <section class="todo-list">
    <h2>{{ t('todo.title') }}</h2>
    <div class="todo-list__tabs" role="tablist">
      <button
        type="button"
        role="tab"
        :aria-selected="todos.viewMode === 'all'"
        :class="{ active: todos.viewMode === 'all' }"
        @click="todos.setViewMode('all')"
      >
        {{ t('todo.viewAll') }}
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="todos.viewMode === 'projects'"
        :class="{ active: todos.viewMode === 'projects' }"
        @click="todos.setViewMode('projects')"
      >
        {{ t('todo.viewProjects') }}
      </button>
    </div>

    <template v-if="todos.viewMode === 'all'">
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
    </template>
    <ProjectsPanel v-else />
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

.todo-list__tabs {
  display: flex;
  gap: 0.5rem;
}

.todo-list__tabs button {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-muted);
  padding: 0.35rem 1rem;
}

.todo-list__tabs button.active {
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  border-color: var(--color-primary);
}

.todo-list__toolbar {
  display: flex;
  align-items: stretch;
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
