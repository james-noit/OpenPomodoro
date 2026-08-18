<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTodosStore } from '../stores/todos'
import { useProjectsStore } from '../stores/projects'
import type { Priority, Todo } from '../types/todo'

const props = defineProps<{ todo: Todo }>()
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()
const todos = useTodosStore()
const projects = useProjectsStore()

const title = ref(props.todo.title)
const importance = ref<Priority>(props.todo.importance)
const urgency = ref<Priority>(props.todo.urgency)
const tagsInput = ref(props.todo.tags.join(', '))

watch(
  () => props.todo.id,
  () => {
    title.value = props.todo.title
    importance.value = props.todo.importance
    urgency.value = props.todo.urgency
    tagsInput.value = props.todo.tags.join(', ')
  },
)

const project = computed(() => projects.projects.find((p) => p.id === props.todo.projectId))
const milestone = computed(() => projects.milestones.find((m) => m.id === props.todo.milestoneId))

function commitTitle() {
  const trimmed = title.value.trim()
  if (!trimmed || trimmed === props.todo.title) {
    title.value = props.todo.title
    return
  }
  todos.updateTodo(props.todo.id, { title: trimmed })
}

function commitImportance() {
  todos.updateTodo(props.todo.id, { importance: importance.value })
}

function commitUrgency() {
  todos.updateTodo(props.todo.id, { urgency: urgency.value })
}

function commitTags() {
  const tags = tagsInput.value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  todos.updateTodo(props.todo.id, { tags })
}

function remove() {
  todos.removeTodo(props.todo.id)
  emit('close')
}
</script>

<template>
  <div class="task-detail__overlay" @click.self="emit('close')">
    <div class="task-detail__modal" role="dialog" aria-modal="true" :aria-label="t('eisenhower.taskDetail')">
      <div class="task-detail__header">
        <h3>{{ t('eisenhower.taskDetail') }}</h3>
        <button type="button" class="task-detail__close" :aria-label="t('todo.close')" @click="emit('close')">✕</button>
      </div>

      <label class="task-detail__done">
        <input type="checkbox" :checked="props.todo.done" @change="todos.toggleDone(props.todo.id)" />
        {{ t('eisenhower.markDone') }}
      </label>

      <input
        v-model="title"
        type="text"
        class="task-detail__title"
        @change="commitTitle"
      />

      <div v-if="project" class="task-detail__project">
        <span aria-hidden="true">{{ project.icon }}</span>
        {{ project.name }}<template v-if="milestone"> · {{ milestone.name }}</template>
      </div>

      <div class="task-detail__row">
        <label>
          {{ t('todo.importance') }}
          <select v-model="importance" @change="commitImportance">
            <option value="low">{{ t('todo.low') }}</option>
            <option value="medium">{{ t('todo.medium') }}</option>
            <option value="high">{{ t('todo.high') }}</option>
          </select>
        </label>
        <label>
          {{ t('todo.urgency') }}
          <select v-model="urgency" @change="commitUrgency">
            <option value="low">{{ t('todo.low') }}</option>
            <option value="medium">{{ t('todo.medium') }}</option>
            <option value="high">{{ t('todo.high') }}</option>
          </select>
        </label>
      </div>

      <label class="task-detail__tags-label">
        {{ t('todo.tags') }}
        <input v-model="tagsInput" type="text" :placeholder="t('todo.tagsPlaceholder')" @change="commitTags" />
      </label>

      <button type="button" class="task-detail__delete" @click="remove">{{ t('todo.delete') }}</button>
    </div>
  </div>
</template>

<style scoped>
.task-detail__overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
  padding: 1rem;
}

.task-detail__modal {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  width: 100%;
  max-width: 420px;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 0.75rem;
  text-align: left;
}

.task-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-detail__header h3 {
  margin: 0;
}

.task-detail__close {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  padding: 0.2rem 0.5rem;
}

.task-detail__done {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.task-detail__done input {
  width: 1.05rem;
  height: 1.05rem;
}

.task-detail__title,
.task-detail__row select,
.task-detail__tags-label input {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
}

.task-detail__title {
  width: 100%;
  font-size: 1rem;
  font-weight: 600;
}

.task-detail__project {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.task-detail__row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.task-detail__row label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  flex: 1 1 120px;
}

.task-detail__tags-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.task-detail__delete {
  align-self: flex-start;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  padding: 0.5rem 1.25rem;
}

.task-detail__delete:hover {
  background-color: var(--color-surface-alt);
}
</style>
