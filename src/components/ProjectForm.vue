<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Project } from '../types/project'

const props = defineProps<{ project?: Project }>()
const emit = defineEmits<{ save: [data: { icon: string; name: string; description: string; notes: string }]; cancel: [] }>()

const { t } = useI18n()

const ICONS = ['📁', '📌', '🚀', '🎯', '📚', '💼', '🛠️', '🎨', '🧪', '🏗️', '🌱', '🔥']

const icon = ref(props.project?.icon ?? ICONS[0])
const name = ref(props.project?.name ?? '')
const description = ref(props.project?.description ?? '')
const notes = ref(props.project?.notes ?? '')

function submit() {
  const trimmed = name.value.trim()
  if (!trimmed) return
  emit('save', { icon: icon.value, name: trimmed, description: description.value.trim(), notes: notes.value.trim() })
}
</script>

<template>
  <form class="project-form" @submit.prevent="submit">
    <div class="project-form__icons">
      <button
        v-for="option in ICONS"
        :key="option"
        type="button"
        class="project-form__icon"
        :class="{ 'project-form__icon--selected': icon === option }"
        :aria-label="option"
        @click="icon = option"
      >
        {{ option }}
      </button>
    </div>
    <label>
      {{ t('projects.name') }}
      <input v-model="name" type="text" :placeholder="t('projects.namePlaceholder')" required />
    </label>
    <label>
      {{ t('projects.description') }}
      <input v-model="description" type="text" :placeholder="t('projects.descriptionPlaceholder')" />
    </label>
    <label>
      {{ t('projects.notes') }}
      <textarea v-model="notes" rows="3" :placeholder="t('projects.notesPlaceholder')"></textarea>
    </label>
    <div class="project-form__actions">
      <button type="submit" class="project-form__save">{{ t('projects.save') }}</button>
      <button type="button" class="project-form__cancel" @click="emit('cancel')">{{ t('projects.cancel') }}</button>
    </div>
  </form>
</template>

<style scoped>
.project-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
}

.project-form label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.project-form input,
.project-form textarea {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  font-family: inherit;
  resize: vertical;
}

.project-form__icons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.project-form__icon {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-surface-alt);
  border: 2px solid transparent;
  border-radius: 6px;
  font-size: 1.1rem;
}

.project-form__icon--selected {
  border-color: var(--color-primary);
}

.project-form__actions {
  display: flex;
  gap: 0.5rem;
}

.project-form__save {
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.25rem;
}

.project-form__cancel {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  padding: 0.5rem 1.25rem;
}
</style>
