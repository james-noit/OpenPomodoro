<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTodosStore } from '../stores/todos'
import type { Priority } from '../types/todo'

const { t } = useI18n()
const todos = useTodosStore()

const title = ref('')
const importance = ref<Priority>('medium')
const urgency = ref<Priority>('medium')
const tagsInput = ref('')

function submit() {
  const trimmed = title.value.trim()
  if (!trimmed) return
  const tags = tagsInput.value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  todos.addTodo({ title: trimmed, importance: importance.value, urgency: urgency.value, tags })
  title.value = ''
  tagsInput.value = ''
}
</script>

<template>
  <form class="todo-form" @submit.prevent="submit">
    <input
      v-model="title"
      type="text"
      class="todo-form__title"
      :placeholder="t('todo.addPlaceholder')"
    />
    <div class="todo-form__row">
      <label>
        {{ t('todo.importance') }}
        <select v-model="importance">
          <option value="low">{{ t('todo.low') }}</option>
          <option value="medium">{{ t('todo.medium') }}</option>
          <option value="high">{{ t('todo.high') }}</option>
        </select>
      </label>
      <label>
        {{ t('todo.urgency') }}
        <select v-model="urgency">
          <option value="low">{{ t('todo.low') }}</option>
          <option value="medium">{{ t('todo.medium') }}</option>
          <option value="high">{{ t('todo.high') }}</option>
        </select>
      </label>
    </div>
    <input v-model="tagsInput" type="text" :placeholder="t('todo.tagsPlaceholder')" />
    <button type="submit">{{ t('todo.add') }}</button>
  </form>
</template>

<style scoped>
.todo-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
}

.todo-form input,
.todo-form select {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
}

.todo-form__title {
  width: 100%;
}

.todo-form__row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.todo-form__row label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  flex: 1 1 120px;
}

.todo-form button {
  align-self: flex-start;
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.25rem;
}
</style>
