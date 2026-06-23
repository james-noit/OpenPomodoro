<script setup lang="ts">
import AppMenu from './AppMenu.vue'
import ThemeToggle from './ThemeToggle.vue'
import LanguageSelector from './LanguageSelector.vue'

const appVersion = __APP_VERSION__
</script>

<template>
  <header class="app-header">
    <div class="app-header__start">
      <AppMenu />
    </div>
    <div class="app-header__title">
      <span class="app-header__name">OpenPomodoro</span>
      <span class="app-header__version">v{{ appVersion }}</span>
    </div>
    <div class="app-header__end">
      <LanguageSelector />
      <ThemeToggle />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.app-header__start,
.app-header__end {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.app-header__title {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  white-space: nowrap;
}

.app-header__name {
  font-weight: 600;
}

.app-header__version {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
</style>
