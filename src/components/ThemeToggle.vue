<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settings'

const { t } = useI18n()
const settings = useSettingsStore()

const isDark = computed(() => settings.theme === 'dark')
const label = computed(() => (isDark.value ? t('theme.toggleToLight') : t('theme.toggleToDark')))
</script>

<template>
  <button type="button" class="theme-toggle" :aria-label="label" :title="label" @click="settings.toggleTheme">
    <svg v-if="isDark" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <circle cx="12" cy="12" r="5" fill="currentColor" />
      <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </g>
    </svg>
    <svg v-else viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path fill="currentColor" d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  color: var(--color-text);
  padding: 0.4rem;
  display: flex;
  align-items: center;
  border-radius: 4px;
}

.theme-toggle:hover {
  background-color: var(--color-surface-alt);
}
</style>
