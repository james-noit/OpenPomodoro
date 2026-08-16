<script setup lang="ts">
import AppMenu from './AppMenu.vue'
import MultitaskToggle from './MultitaskToggle.vue'

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
      <MultitaskToggle />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.app-header__start,
.app-header__end {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.app-header__end {
  justify-content: flex-end;
  margin-left: auto;
}

@media (min-width: 480px) {
  .app-header {
    padding: 0.5rem 1rem;
  }
}

.app-header__title {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  white-space: nowrap;
}

.app-header__name {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--color-primary), var(--color-high));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: var(--color-primary);
  transition: background 0.2s;
}

.app-header__version {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
</style>
