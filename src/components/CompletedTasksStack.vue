<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTodosStore } from '../stores/todos'

const { t } = useI18n()
const todos = useTodosStore()

const open = ref(false)

function show() {
  open.value = true
}

function close() {
  open.value = false
}
</script>

<template>
  <div class="completed-stack">
    <button type="button" class="completed-stack__trigger" @click="show">
      <span class="completed-stack__cards" aria-hidden="true">
        <span class="completed-stack__card"></span>
        <span class="completed-stack__card"></span>
        <span class="completed-stack__card"></span>
      </span>
      <span class="completed-stack__label">
        {{ t('todo.completedTasks') }} ({{ todos.completedTodos.length }})
      </span>
    </button>

    <div v-if="open" class="completed-stack__overlay" @click.self="close">
      <div class="completed-stack__modal" role="dialog" aria-modal="true" :aria-label="t('todo.completedTasks')">
        <div class="completed-stack__header">
          <h3>{{ t('todo.completedTasks') }}</h3>
          <button type="button" class="completed-stack__close" :aria-label="t('todo.close')" @click="close">✕</button>
        </div>
        <p v-if="!todos.completedTodos.length" class="completed-stack__empty">{{ t('todo.noCompleted') }}</p>
        <ul v-else class="completed-stack__list">
          <li v-for="todo in todos.completedTodos" :key="todo.id" class="completed-item">
            <div class="completed-item__content">
              <span class="completed-item__title">{{ todo.title }}</span>
              <div class="completed-item__badges">
                <span class="badge" :class="`badge--${todo.importance}`">{{ t(`todo.${todo.importance}`) }}</span>
                <span class="badge" :class="`badge--${todo.urgency}`">{{ t(`todo.${todo.urgency}`) }}</span>
                <span v-for="tag in todo.tags" :key="tag" class="badge badge--tag">{{ tag }}</span>
              </div>
            </div>
            <div class="completed-item__actions">
              <button type="button" class="completed-item__restore" :aria-label="t('todo.restore')" :title="t('todo.restore')" @click="todos.toggleDone(todo.id)">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 5V2L7 7l5 5V8c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
                  />
                </svg>
              </button>
              <button type="button" :aria-label="t('todo.delete')" @click="todos.removeTodo(todo.id)">✕</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.completed-stack {
  display: flex;
}

.completed-stack__trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.6rem 0.9rem;
  color: var(--color-text);
}

.completed-stack__trigger:hover {
  background-color: var(--color-surface-alt);
}

.completed-stack__cards {
  position: relative;
  width: 1.6rem;
  height: 1.4rem;
  flex-shrink: 0;
}

.completed-stack__card {
  position: absolute;
  inset: 0;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-surface);
}

.completed-stack__card:nth-child(1) {
  transform: translate(0, 2px) rotate(-6deg);
}

.completed-stack__card:nth-child(2) {
  transform: translate(0, 1px) rotate(4deg);
}

.completed-stack__card:nth-child(3) {
  transform: translate(0, 0);
  background-color: var(--color-surface-alt);
}

.completed-stack__label {
  font-size: 0.9rem;
}

.completed-stack__overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
  padding: 1rem;
}

.completed-stack__modal {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  width: 100%;
  max-width: 520px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 0.75rem;
}

.completed-stack__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.completed-stack__header h3 {
  margin: 0;
}

.completed-stack__close {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  padding: 0.2rem 0.5rem;
}

.completed-stack__empty {
  color: var(--color-text-muted);
}

.completed-stack__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.completed-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.completed-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.completed-item__title {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.completed-item__badges {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.completed-item__actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.completed-item__actions button {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  padding: 0.2rem 0.5rem;
  display: flex;
  align-items: center;
}

.completed-item__restore:hover {
  color: var(--color-primary);
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
