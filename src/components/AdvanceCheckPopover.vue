<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { AdvanceProgress } from '../types/multitask'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ answer: [progress: AdvanceProgress] }>()

const { t } = useI18n()

const options: { value: AdvanceProgress; symbol: string }[] = [
  { value: 'stalled', symbol: '[X]' },
  { value: 'moving', symbol: '>' },
  { value: 'moving-fast', symbol: '>>' },
]
</script>

<template>
  <div v-if="open" class="advance-check" role="dialog" :aria-label="t('multitask.advanceQuestion')">
    <div class="advance-check__panel">
      <p class="advance-check__question">{{ t('multitask.advanceQuestion') }}</p>
      <ul class="advance-check__options" role="radiogroup" :aria-label="t('multitask.advanceQuestion')">
        <li v-for="opt in options" :key="opt.value">
          <button
            type="button"
            role="radio"
            :aria-checked="false"
            class="advance-check__option"
            :class="`advance-check__option--${opt.value}`"
            @click="emit('answer', opt.value)"
          >
            <span class="advance-check__mark">{{ opt.symbol }}</span>
            {{ t(`multitask.advanceOptions.${opt.value}`) }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.advance-check {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.55);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  z-index: 10;
}

.advance-check__panel {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.85rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.advance-check__question {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}

.advance-check__options {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.advance-check__option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface-alt);
  color: var(--color-text);
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  font-size: 0.85rem;
  transition: transform 0.15s, filter 0.15s;
}

.advance-check__option:hover {
  filter: brightness(1.08);
}

.advance-check__option:active {
  transform: scale(0.97);
}

.advance-check__mark {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-weight: 700;
  min-width: 1.6rem;
}

.advance-check__option--stalled .advance-check__mark {
  color: var(--color-capacity-critical);
}

.advance-check__option--moving .advance-check__mark {
  color: var(--color-capacity-elevated);
}

.advance-check__option--moving-fast .advance-check__mark {
  color: var(--color-capacity-safe);
}
</style>
