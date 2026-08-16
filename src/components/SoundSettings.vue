<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../stores/settings'
import { playSound } from '../stores/clock'
import type { BellSoundId } from '../stores/settings'

const { t } = useI18n()
const settings = useSettingsStore()

const bellSounds: { id: BellSoundId }[] = [
  { id: 'digital' },
  { id: 'classic' },
  { id: 'siren' },
  { id: 'buzzer' },
]

const open = ref(false)
</script>

<template>
  <div class="sound-settings">
    <button
      type="button"
      class="sound-settings__bell"
      :class="{ 'sound-settings__bell--muted': !settings.bellSound }"
      :aria-label="t('clock.soundSettings')"
      aria-haspopup="true"
      :aria-expanded="open"
      @click="open = !open"
    >
      {{ settings.bellSound ? '🔔' : '🔕' }}
    </button>
    <div v-if="open" class="sound-settings__overlay" @click="open = false"></div>
    <div v-if="open" class="sound-settings__panel" role="dialog" :aria-label="t('clock.soundSettings')">
      <label class="sound-settings__toggle">
        <input
          type="checkbox"
          :checked="settings.bellSound"
          @change="settings.setBellSound(($event.target as HTMLInputElement).checked)"
        />
        {{ settings.bellSound ? t('clock.bellOff') : t('clock.bellOn') }}
      </label>
      <ul class="sound-settings__list">
        <li v-for="sound in bellSounds" :key="sound.id" class="sound-settings__item">
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
          <button type="button" class="sound-settings__preview" :aria-label="t('clock.preview')" @click="playSound(sound.id)">
            ▶
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.sound-settings {
  position: relative;
  display: flex;
}

.sound-settings__bell {
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
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
}

.sound-settings__bell:hover {
  filter: brightness(0.9);
}

.sound-settings__bell--muted {
  opacity: 0.5;
}

.sound-settings__overlay {
  position: fixed;
  inset: 0;
  z-index: 19;
}

.sound-settings__panel {
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
  gap: 0.6rem;
  padding: 0.75rem;
  width: 220px;
  max-width: calc(100vw - 2rem);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  text-align: left;
}

.sound-settings__toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.sound-settings__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.sound-settings__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text);
}

.sound-settings__item label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.sound-settings__preview {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  padding: 0.1rem 0.5rem;
}
</style>
