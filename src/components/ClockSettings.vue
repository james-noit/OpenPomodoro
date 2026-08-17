<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settings'
import { playSound } from '../stores/clock'
import type { BellSoundId, ClockStyle, BoxClockOrder } from '../stores/settings'

const { t } = useI18n()
const settings = useSettingsStore()

const bellSounds: { id: BellSoundId }[] = [
  { id: 'digital' },
  { id: 'classic' },
  { id: 'siren' },
  { id: 'buzzer' },
]

const clockStyles: { id: ClockStyle }[] = [{ id: 'boxes' }, { id: 'ring' }]
const boxOrders: { id: BoxClockOrder }[] = [{ id: 'sequential' }, { id: 'random' }]

const open = ref(false)
</script>

<template>
  <div class="clock-settings">
    <button
      type="button"
      class="clock-settings__trigger"
      :aria-label="t('clock.settings')"
      aria-haspopup="true"
      :aria-expanded="open"
      @click="open = !open"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          fill="currentColor"
          d="M19.14 12.94a7.14 7.14 0 0 0 .06-.94 7.14 7.14 0 0 0-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.66 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.15 7.15 0 0 0-.07.94 7.15 7.15 0 0 0 .07.94L2.78 14.5a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.42.32.66.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.29.28.42.5.42h3.84c.22 0 .45-.13.5-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.24.1.52.02.66-.22l1.92-3.32a.5.5 0 0 0-.12-.64ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"
        />
      </svg>
    </button>
    <div v-if="open" class="clock-settings__overlay" @click="open = false"></div>
    <div v-if="open" class="clock-settings__panel" role="dialog" :aria-label="t('clock.settings')">
      <div class="clock-settings__section">
        <span class="clock-settings__section-label">{{ t('clock.clockStyle') }}</span>
        <div class="clock-settings__pills">
          <button
            v-for="style in clockStyles"
            :key="style.id"
            type="button"
            :class="{ active: settings.clockStyle === style.id }"
            @click="settings.setClockStyle(style.id)"
          >
            {{ t(`clock.clockStyles.${style.id}`) }}
          </button>
        </div>
        <div v-if="settings.clockStyle === 'boxes'" class="clock-settings__pills">
          <button
            v-for="order in boxOrders"
            :key="order.id"
            type="button"
            :class="{ active: settings.boxClockOrder === order.id }"
            @click="settings.setBoxClockOrder(order.id)"
          >
            {{ t(`clock.boxOrders.${order.id}`) }}
          </button>
        </div>
      </div>
      <div class="clock-settings__section">
        <span class="clock-settings__section-label">{{ t('clock.soundSettings') }}</span>
        <label class="clock-settings__toggle">
          <input
            type="checkbox"
            :checked="settings.bellSound"
            @change="settings.setBellSound(($event.target as HTMLInputElement).checked)"
          />
          {{ settings.bellSound ? t('clock.bellOff') : t('clock.bellOn') }}
        </label>
        <ul class="clock-settings__list">
          <li v-for="sound in bellSounds" :key="sound.id" class="clock-settings__item">
            <label>
              <input
                type="radio"
                name="bellSoundId"
                :value="sound.id"
                :checked="settings.bellSoundId === sound.id"
                @change="settings.setBellSoundId(sound.id)"
              />
              {{ t(`clock.sounds.${sound.id}`) }}
            </label>
            <button type="button" class="clock-settings__preview" :aria-label="t('clock.preview')" @click="playSound(sound.id)">
              ▶
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.clock-settings {
  position: relative;
  display: flex;
}

.clock-settings__trigger {
  padding: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  outline: 2px solid #555;
  color: var(--color-text);
  background: linear-gradient(135deg, #f5e6d3, #e8d4c0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.clock-settings__trigger:hover {
  filter: brightness(0.9);
}

.clock-settings__overlay {
  position: fixed;
  inset: 0;
  z-index: 19;
}

.clock-settings__panel {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  width: 240px;
  max-width: calc(100vw - 2rem);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  text-align: left;
}

.clock-settings__section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.clock-settings__section + .clock-settings__section {
  padding-top: 0.6rem;
  border-top: 1px solid var(--color-border);
}

.clock-settings__section-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.clock-settings__pills {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.clock-settings__pills button {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
}

.clock-settings__pills button.active {
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  border-color: var(--color-primary);
}

.clock-settings__toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text);
}

.clock-settings__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.clock-settings__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text);
}

.clock-settings__item label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.clock-settings__preview {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  padding: 0.1rem 0.5rem;
}
</style>
