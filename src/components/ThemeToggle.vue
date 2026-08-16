<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSettingsStore, type Theme } from '../stores/settings'

const { t } = useI18n()
const settings = useSettingsStore()

function onChange(event: Event) {
  settings.setTheme((event.target as HTMLSelectElement).value as Theme)
}
</script>

<template>
  <label class="theme-selector">
    <span class="visually-hidden">{{ t('theme.label') }}</span>
    <select :value="settings.theme" @change="onChange">
      <option value="light">{{ t('theme.light') }}</option>
      <option value="dark">{{ t('theme.dark') }}</option>
      <option value="japanese">{{ t('theme.japanese') }}</option>
      <option value="nordic">{{ t('theme.nordic') }}</option>
    </select>
  </label>
</template>

<style scoped>
.theme-selector select {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.3rem 0.5rem;
}
</style>
