<script setup lang="ts">
import { Check, Sun } from '@lucide/vue'
import { computed } from 'vue'

import wallpaperDark from '@/assets/wallpapers/horizon-dark.webp'
import wallpaperLight from '@/assets/wallpapers/horizon-light.webp'
import { useAppearanceStore, ACCENTS, type AccentColor } from '@/stores/appearance'
import { useMobileStore } from '@/stores/mobile'
import { UiListGroup, UiListRow, UiSlider, UiSwitch } from '@/ui'

import SettingsPage from '../SettingsPage.vue'

const appearance = useAppearanceStore()
const store = useMobileStore()

const options = [
  { value: 'light', label: 'Light', wallpaper: wallpaperLight },
  { value: 'dark', label: 'Dark', wallpaper: wallpaperDark },
] as const

const automatic = computed({
  get: () => appearance.mode === 'auto',
  set: (on: boolean) => appearance.setMode(on ? 'auto' : appearance.resolved),
})
const brightness = computed({
  get: () => store.controls.brightness,
  set: (value: number) => (store.controls.brightness = value),
})

const accentName = (accent: AccentColor) => accent[0]!.toUpperCase() + accent.slice(1)
</script>

<template>
  <SettingsPage title="Display & Brightness">
    <UiListGroup header="Appearance">
      <li class="flex justify-around px-4 pb-3 pt-5" role="radiogroup" aria-label="Appearance">
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          role="radio"
          class="choice focus-ring"
          :aria-checked="appearance.resolved === option.value"
          @click="appearance.setMode(option.value)"
        >
          <span
            class="preview bg-cover bg-center"
            :style="{ backgroundImage: `url(${option.wallpaper})` }"
            aria-hidden="true"
          >
            <span class="preview-bar" :class="option.value === 'dark' ? 'bg-black/60' : 'bg-white/70'" />
          </span>
          <span class="text-ios-subheadline text-ios-label">{{ option.label }}</span>
          <span class="radio" :class="{ 'is-on': appearance.resolved === option.value }" aria-hidden="true">
            <Check v-if="appearance.resolved === option.value" />
          </span>
        </button>
      </li>
      <UiListRow title="Automatic" :subtitle="automatic ? 'Follows your device' : undefined">
        <template #accessory><UiSwitch v-model="automatic" label="Automatic appearance" platform="ios" /></template>
      </UiListRow>
    </UiListGroup>

    <UiListGroup header="Brightness">
      <li class="flex items-center gap-3 px-4 py-3">
        <Sun class="size-4 shrink-0 text-ios-label-secondary" aria-hidden="true" />
        <UiSlider v-model="brightness" label="Brightness" platform="ios" class="flex-1" />
        <Sun class="size-6 shrink-0 text-ios-label-secondary" aria-hidden="true" />
      </li>
    </UiListGroup>

    <UiListGroup header="Accent Colour" footer="Tints buttons, switches in macOS style, selection and links.">
      <li class="flex flex-wrap justify-between gap-2 px-4 py-4" role="radiogroup" aria-label="Accent colour">
        <button
          v-for="accent in ACCENTS"
          :key="accent"
          type="button"
          role="radio"
          class="dot focus-ring"
          :aria-checked="appearance.accent === accent"
          :aria-label="accentName(accent)"
          :title="accentName(accent)"
          :style="{ background: `var(--sys-${accent})` }"
          @click="appearance.setAccent(accent)"
        />
      </li>
    </UiListGroup>
  </SettingsPage>
</template>

<style scoped>
.choice {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  padding: 4px;
}
.choice:active .preview {
  transform: scale(0.96);
}
.preview {
  position: relative;
  display: block;
  width: 72px;
  height: 148px;
  border-radius: 14px;
  box-shadow:
    0 0 0 0.5px var(--ios-separator),
    var(--elev-control);
  overflow: clip;
  transition: transform var(--dur-micro) var(--ease-out);
}
.preview-bar {
  position: absolute;
  inset: auto 8px 8px;
  height: 22px;
  border-radius: 8px;
}
.radio {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  box-shadow: inset 0 0 0 1.5px var(--ios-label-tertiary);
  color: var(--label-on-accent);
}
.radio.is-on {
  background: var(--accent);
  box-shadow: none;
}
.radio svg {
  width: 13px;
  height: 13px;
  stroke-width: 3.2;
}
.dot {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  transition: transform var(--dur-micro) var(--ease-out);
}
.dot:active {
  transform: scale(0.9);
}
.dot[aria-checked='true'] {
  box-shadow:
    0 0 0 3px var(--ios-bg-grouped-secondary),
    0 0 0 5px var(--ios-label-tertiary);
}
</style>
