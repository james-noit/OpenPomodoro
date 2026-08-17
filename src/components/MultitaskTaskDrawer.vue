<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTodosStore } from '../stores/todos'
import { useMultitaskStore } from '../stores/multitask'
import TodoForm from './TodoForm.vue'
import TodoFilters from './TodoFilters.vue'
import CompletedTasksStack from './CompletedTasksStack.vue'
import ProjectsPanel from './ProjectsPanel.vue'
import TaskProjectTag from './TaskProjectTag.vue'

const { t } = useI18n()
const todos = useTodosStore()
const multitask = useMultitaskStore()

const open = ref(false)

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function assignToNewCard(taskId: string) {
  multitask.addCard(taskId)
}
</script>

<template>
  <div class="task-drawer">
    <button
      type="button"
      class="task-drawer__trigger"
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="toggle"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="currentColor" d="M4 4h16v2H4zm0 7h16v2H4zm0 7h10v2H4z" />
      </svg>
      <span>{{ t('multitask.manageTasks') }}</span>
      <span v-if="todos.todos.length" class="task-drawer__badge">{{ todos.filteredTodos.length }}</span>
    </button>

    <div v-if="open" class="task-drawer__overlay" @click="close"></div>
    <aside v-if="open" class="task-drawer__panel" role="dialog" :aria-label="t('multitask.manageTasks')">
      <div class="task-drawer__header">
        <h3>{{ t('multitask.manageTasks') }}</h3>
        <button type="button" class="task-drawer__close" :aria-label="t('todo.close')" @click="close">✕</button>
      </div>

      <div class="task-drawer__tabs" role="tablist">
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

        <div v-if="todos.todos.length" class="task-drawer__toolbar">
          <TodoFilters />
          <CompletedTasksStack v-if="todos.completedTodos.length" />
        </div>

        <h4 class="task-drawer__pool-heading">{{ t('multitask.taskPool') }}</h4>
        <p v-if="!todos.filteredTodos.length" class="task-drawer__empty">{{ t('todo.empty') }}</p>
        <ul v-else class="task-drawer__pool">
          <li v-for="todo in todos.filteredTodos" :key="todo.id" class="task-drawer__pool-item">
            <div class="task-drawer__pool-content">
              <span class="task-drawer__pool-title">{{ todo.title }}</span>
              <div class="task-drawer__pool-badges">
                <span class="badge" :class="`badge--${todo.importance}`">{{ t(`todo.${todo.importance}`) }}</span>
                <span class="badge" :class="`badge--${todo.urgency}`">{{ t(`todo.${todo.urgency}`) }}</span>
              </div>
              <TaskProjectTag :todo="todo" />
            </div>
            <span v-if="multitask.assignedTaskIds.has(todo.id)" class="task-drawer__pool-status">
              {{ t('multitask.inGrid') }}
            </span>
            <button
              v-else
              type="button"
              class="task-drawer__pool-assign"
              :aria-label="t('multitask.assignToCard')"
              :title="t('multitask.assignToCard')"
              @click="assignToNewCard(todo.id)"
            >
              +
            </button>
          </li>
        </ul>
      </template>
      <ProjectsPanel v-else multitask-mode />
    </aside>
  </div>
</template>

<style scoped>
.task-drawer {
  display: flex;
}

.task-drawer__trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  padding: 0.5rem 0.9rem;
}

.task-drawer__trigger:hover {
  background-color: var(--color-surface-alt);
}

.task-drawer__badge {
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  border-radius: 999px;
  font-size: 0.7rem;
  line-height: 1;
  padding: 0.2rem 0.45rem;
}

.task-drawer__overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.35);
  z-index: 24;
}

.task-drawer__panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 360px;
  max-width: 100%;
  margin-left: auto;
  background-color: var(--color-surface);
  border-left: 1px solid var(--color-border);
  z-index: 25;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1rem;
  overflow-y: auto;
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.25);
  animation: task-drawer-slide-in 0.2s ease-out;
}

@keyframes task-drawer-slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.task-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-drawer__header h3 {
  margin: 0;
}

.task-drawer__close {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  padding: 0.2rem 0.5rem;
}

.task-drawer__tabs {
  display: flex;
  gap: 0.5rem;
}

.task-drawer__tabs button {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-muted);
  padding: 0.35rem 1rem;
}

.task-drawer__tabs button.active {
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  border-color: var(--color-primary);
}

.task-drawer__toolbar {
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.task-drawer__pool-heading {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.task-drawer__empty {
  color: var(--color-text-muted);
}

.task-drawer__pool {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.task-drawer__pool-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.5rem 0.6rem;
}

.task-drawer__pool-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.task-drawer__pool-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-drawer__pool-badges {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.task-drawer__pool-status {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.task-drawer__pool-assign {
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  border-radius: 50%;
  font-size: 1.1rem;
  line-height: 1;
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
</style>
