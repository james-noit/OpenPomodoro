<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMultitaskStore } from '../stores/multitask'

const { t } = useI18n()
const multitask = useMultitaskStore()

const efficiency = computed(() => multitask.efficiency)

const percentage = computed(() => (efficiency.value === null ? null : Math.round(efficiency.value * 100)))

const colorVar = computed(() => {
  const value = efficiency.value
  if (value === null) return 'var(--color-text-muted)'
  if (value >= 0.9) return 'var(--color-capacity-safe)'
  if (value >= 0.75) return 'var(--color-capacity-elevated)'
  if (value >= 0.5) return 'var(--color-capacity-high)'
  return 'var(--color-capacity-critical)'
})

function restart() {
  if (!window.confirm(t('multitask.restartCounterConfirm'))) return
  multitask.resetAccomplishments()
}
</script>

<template>
  <div class="effectivity">
    <div class="effectivity__body">
      <span class="effectivity__label">{{ t('multitask.effectivityTitle') }}</span>
      <span class="effectivity__pct" :style="{ color: colorVar }">{{ percentage === null ? '—' : `${percentage}%` }}</span>
      <span class="effectivity__counts">
        <span class="effectivity__count">
          <span class="effectivity__swatch effectivity__swatch--green" aria-hidden="true" />
          <span class="visually-hidden">{{ t('multitask.effectivityGreen') }}</span>
          {{ multitask.greenBoxes }}
        </span>
        <span class="effectivity__count">
          <span class="effectivity__swatch effectivity__swatch--red" aria-hidden="true" />
          <span class="visually-hidden">{{ t('multitask.effectivityRed') }}</span>
          {{ multitask.redBoxes }}
        </span>
      </span>
    </div>
    <button
      type="button"
      class="effectivity__restart"
      :aria-label="t('multitask.restartCounter')"
      :title="t('multitask.restartCounter')"
      @click="restart"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 5V2L7 7l5 5V8c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
        />
      </svg>
    </button>
    <div class="effectivity__popover" role="tooltip">
      {{ t('multitask.effectivityTooltip') }}
    </div>
  </div>
</template>

<style scoped>
.effectivity {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.4rem 0.5rem;
}

.effectivity__body {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.effectivity__label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.effectivity__pct {
  font-size: 1.05rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.effectivity__counts {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.effectivity__count {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.effectivity__swatch {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 3px;
  display: inline-block;
}

.effectivity__swatch--green {
  background-color: var(--color-capacity-safe);
}

.effectivity__swatch--red {
  background-color: var(--color-capacity-critical);
}

.effectivity__restart {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.75rem;
  height: 1.75rem;
  padding: 0 0.35rem;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-muted);
}

.effectivity__restart:hover {
  background-color: var(--color-surface);
  color: var(--color-text);
  border-color: var(--color-primary);
}

.effectivity__popover {
  display: none;
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.5rem 0.7rem;
  font-size: 0.75rem;
  line-height: 1.4;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 15;
}

.effectivity__popover::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--color-surface);
}

.effectivity:hover .effectivity__popover,
.effectivity:focus-within .effectivity__popover {
  display: block;
}
</style>
