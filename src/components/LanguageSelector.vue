<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSettingsStore, type Language } from '../stores/settings'

const { t } = useI18n()
const settings = useSettingsStore()

function onChange(event: Event) {
  settings.setLanguage((event.target as HTMLSelectElement).value as Language)
}
</script>

<template>
  <label class="language-selector">
    <span class="visually-hidden">{{ t('language.label') }}</span>
    <select :value="settings.language" @change="onChange">
      <option value="en">{{ t('language.en') }}</option>
      <option value="es">{{ t('language.es') }}</option>
    </select>
  </label>
</template>

<style scoped>
.language-selector select {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.3rem 0.5rem;
}
</style>
