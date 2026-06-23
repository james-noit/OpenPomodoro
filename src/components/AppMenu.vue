<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTodosStore } from '../stores/todos'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const todos = useTodosStore()
const settings = useSettingsStore()

const open = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function exportTodo() {
  const data = todos.exportTodos()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'todo.openpomodoro.json'
  link.click()
  URL.revokeObjectURL(url)
  close()
}

function importTodo() {
  fileInput.value?.click()
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  close()
  if (!file) return
  const text = await file.text()
  try {
    todos.importTodos(JSON.parse(text))
  } catch (error) {
    console.error('Failed to import to-do file', error)
  }
}

function resetAll() {
  close()
  if (window.confirm(t('menu.resetConfirm'))) {
    todos.reset()
    settings.reset()
  }
}
</script>

<template>
  <div class="app-menu">
    <button
      class="app-menu__trigger"
      type="button"
      :aria-label="t('menu.open')"
      aria-haspopup="true"
      :aria-expanded="open"
      @click="toggle"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
      </svg>
    </button>
    <div v-if="open" class="app-menu__panel" role="menu">
      <div class="app-menu__group">
        <span class="app-menu__group-label">{{ t('menu.file') }}</span>
        <button type="button" role="menuitem" @click="exportTodo">{{ t('menu.exportTodo') }}</button>
        <button type="button" role="menuitem" @click="importTodo">{{ t('menu.importTodo') }}</button>
      </div>
      <div class="app-menu__group">
        <button type="button" role="menuitem" class="app-menu__danger" @click="resetAll">
          {{ t('menu.reset') }}
        </button>
      </div>
    </div>
    <input ref="fileInput" type="file" accept=".json,application/json" class="visually-hidden" @change="onFileSelected" />
  </div>
</template>

<style scoped>
.app-menu {
  position: relative;
}

.app-menu__trigger {
  background: none;
  border: none;
  color: var(--color-text);
  padding: 0.4rem;
  display: flex;
  align-items: center;
  border-radius: 4px;
}

.app-menu__trigger:hover {
  background-color: var(--color-surface-alt);
}

.app-menu__panel {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.25rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  min-width: 200px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.app-menu__group {
  display: flex;
  flex-direction: column;
  padding: 0.25rem 0;
}

.app-menu__group + .app-menu__group {
  border-top: 1px solid var(--color-border);
}

.app-menu__group-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--color-text-muted);
  padding: 0.25rem 1rem;
}

.app-menu__panel button {
  background: none;
  border: none;
  text-align: left;
  padding: 0.5rem 1rem;
  color: var(--color-text);
}

.app-menu__panel button:hover {
  background-color: var(--color-surface-alt);
}

.app-menu__danger {
  color: var(--color-high);
}
</style>
