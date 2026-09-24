<script setup lang="ts">
import {
  BatteryCharging,
  Bluetooth,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Contrast,
  Leaf,
  Moon,
  Radio,
  Sun,
  SunDim,
  User,
  Volume1,
  Volume2,
  Wifi,
} from '@lucide/vue'
import { onClickOutside } from '@vueuse/core'
import { computed, ref, type Component } from 'vue'

import { ACCENTS, useAppearanceStore, type AccentColor } from '@/stores/appearance'
import { useSystemStatusStore, type FocusMode } from '@/stores/systemStatus'
import UiSlider from '@/ui/UiSlider.vue'
import UiSwitch from '@/ui/UiSwitch.vue'

import { closeMenus } from '../shellUi'
import CcCircle from './CcCircle.vue'

/**
 * Control Center, macOS layout: connectivity block on the left, Focus and
 * two quick toggles on the right, then Display, Sound, accent colour and
 * battery modules. Every colour on screen re-themes live from here.
 */
const status = useSystemStatusStore()
const appearance = useAppearanceStore()

const panel = ref<HTMLElement | null>(null)
onClickOutside(panel, closeMenus, { ignore: ['[data-panel-toggle="control-center"]'] })

const focusExpanded = ref(false)
const focusModes: { id: Exclude<FocusMode, 'off'>; label: string; icon: Component }[] = [
  { id: 'dnd', label: 'Do Not Disturb', icon: Moon },
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'work', label: 'Work', icon: BriefcaseBusiness },
  { id: 'sleep', label: 'Sleep', icon: Leaf },
]
const activeFocus = computed(() => focusModes.find((m) => m.id === status.focusMode))

function pickFocus(mode: Exclude<FocusMode, 'off'>) {
  status.setFocusMode(status.focusMode === mode ? 'off' : mode)
}

const wifiOn = computed(() => status.wifiStatus !== 'disconnected')
const bluetoothOn = computed(() => status.bluetoothStatus !== 'off')

const wifiDetail = computed(() => {
  if (status.wifiStatus === 'connecting') return 'Connecting…'
  return status.currentWifiNetwork?.name ?? 'Off'
})
const bluetoothDetail = computed(() => {
  if (status.bluetoothStatus === 'off') return 'Off'
  if (status.bluetoothStatus === 'connecting') return 'Turning on…'
  const n = status.connectedBluetoothDevices.length
  return n ? status.connectedBluetoothDevices.map((d) => d.name).join(', ') : 'On'
})

const brightness = computed({
  get: () => status.brightnessLevel,
  set: (v: number) => status.setBrightnessLevel(v),
})
const volume = computed({
  get: () => status.effectiveVolume,
  set: (v: number) => status.setVolumeLevel(v),
})

const accentLabel: Record<AccentColor, string> = {
  blue: 'Blue',
  purple: 'Purple',
  pink: 'Pink',
  red: 'Red',
  orange: 'Orange',
  yellow: 'Yellow',
  green: 'Green',
  graphite: 'Graphite',
}
</script>

<template>
  <section
    ref="panel"
    class="cc material-popover chrome fixed w-[320px] rounded-popover p-2.5"
    aria-label="Control Center"
    @keydown.esc="closeMenus"
  >
    <div class="grid grid-cols-2 gap-2.5">
      <!-- Connectivity -->
      <div class="module row-span-2 flex flex-col justify-between gap-2.5 p-2.5">
        <div class="flex items-center gap-2">
          <CcCircle :on="wifiOn" label="Wi-Fi" @toggle="status.toggleWifi()"><Wifi /></CcCircle>
          <div class="min-w-0">
            <p class="text-headline">Wi-Fi</p>
            <p class="truncate text-subheadline text-label-secondary">{{ wifiDetail }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <CcCircle :on="bluetoothOn" label="Bluetooth" @toggle="status.toggleBluetooth()">
            <Bluetooth />
          </CcCircle>
          <div class="min-w-0">
            <p class="text-headline">Bluetooth</p>
            <p class="truncate text-subheadline text-label-secondary">{{ bluetoothDetail }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <CcCircle :on="status.airDropEnabled" label="AirDrop" @toggle="status.toggleAirDrop()">
            <Radio />
          </CcCircle>
          <div class="min-w-0">
            <p class="text-headline">AirDrop</p>
            <p class="truncate text-subheadline text-label-secondary">
              {{ status.airDropEnabled ? 'Contacts Only' : 'Off' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Focus -->
      <div class="module flex items-center gap-2 p-2.5">
        <CcCircle
          :on="status.focusMode !== 'off'"
          label="Do Not Disturb"
          @toggle="status.setFocusMode(status.focusMode === 'off' ? 'dnd' : 'off')"
        >
          <component :is="activeFocus?.icon ?? Moon" />
        </CcCircle>
        <button
          type="button"
          class="tile-label flex min-w-0 flex-1 items-center justify-between"
          :aria-expanded="focusExpanded"
          @click="focusExpanded = !focusExpanded"
        >
          <span class="min-w-0 text-left">
            <span class="block text-headline">Focus</span>
            <span class="block truncate text-subheadline text-label-secondary">
              {{ activeFocus?.label ?? 'Off' }}
            </span>
          </span>
          <ChevronRight
            class="size-3.5 shrink-0 text-label-secondary transition-transform duration-150"
            :class="{ 'rotate-90': focusExpanded }"
          />
        </button>
      </div>

      <!-- Quick toggles -->
      <div class="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          class="module small-tile"
          :aria-pressed="appearance.isDark"
          @click="appearance.toggleDark()"
        >
          <Contrast class="size-[18px]" :class="appearance.isDark ? 'text-accent' : ''" />
          <span class="text-footnote">Dark Mode</span>
        </button>
        <button
          type="button"
          class="module small-tile"
          :aria-pressed="status.powerSavingMode"
          @click="status.togglePowerSaving()"
        >
          <BatteryCharging class="size-[18px]" :class="status.powerSavingMode ? 'text-yellow' : ''" />
          <span class="text-footnote">Low Power</span>
        </button>
      </div>
    </div>

    <!-- Focus modes (expanded) -->
    <div v-if="focusExpanded" class="module mt-2.5 p-1.5" role="group" aria-label="Focus modes">
      <button
        v-for="mode in focusModes"
        :key="mode.id"
        type="button"
        class="focus-row"
        :aria-pressed="status.focusMode === mode.id"
        @click="pickFocus(mode.id)"
      >
        <span class="focus-icon" :class="{ 'is-on': status.focusMode === mode.id }">
          <component :is="mode.icon" />
        </span>
        <span class="flex-1 text-left text-body">{{ mode.label }}</span>
        <Check v-if="status.focusMode === mode.id" class="size-3.5 text-label-secondary" />
      </button>
    </div>

    <!-- Display -->
    <div class="module mt-2.5 p-2.5">
      <p class="mb-2 text-headline">Display</p>
      <div class="flex items-center gap-2 text-label-secondary">
        <SunDim class="size-4 shrink-0" />
        <UiSlider v-model="brightness" label="Display brightness" :min="10" />
        <Sun class="size-4 shrink-0" />
      </div>
    </div>

    <!-- Sound -->
    <div class="module mt-2.5 p-2.5">
      <div class="mb-2 flex items-baseline justify-between gap-2">
        <p class="text-headline">Sound</p>
        <p class="truncate text-subheadline text-label-secondary">{{ status.outputDevice }}</p>
      </div>
      <div class="flex items-center gap-2 text-label-secondary">
        <button
          type="button"
          class="icon-toggle"
          :aria-label="status.isMuted ? 'Unmute' : 'Mute'"
          :aria-pressed="status.isMuted"
          @click="status.toggleMute()"
        >
          <Volume1 class="size-4" />
        </button>
        <UiSlider v-model="volume" label="Volume" />
        <Volume2 class="size-4 shrink-0" />
      </div>
    </div>

    <!-- Accent colour -->
    <div class="module mt-2.5 p-2.5">
      <p class="mb-2 text-headline">Accent Colour</p>
      <div class="flex items-center justify-between" role="radiogroup" aria-label="Accent colour">
        <button
          v-for="accent in ACCENTS"
          :key="accent"
          type="button"
          role="radio"
          class="swatch"
          :style="{ '--swatch': `var(--sys-${accent})` }"
          :aria-checked="appearance.accent === accent"
          :aria-label="accentLabel[accent]"
          :title="accentLabel[accent]"
          @click="appearance.setAccent(accent)"
        />
      </div>
    </div>

    <!-- Battery -->
    <div class="module mt-2.5 flex items-center justify-between p-2.5">
      <div>
        <p class="text-headline">Battery</p>
        <p class="tabular text-subheadline text-label-secondary">
          {{ Math.round(status.batteryLevel) }}% ·
          {{ status.isCharging ? status.batteryTimeRemaining : `${status.batteryTimeRemaining} remaining` }}
        </p>
      </div>
      <UiSwitch
        :model-value="status.powerSavingMode"
        label="Low Power Mode"
        @update:model-value="status.togglePowerSaving()"
      />
    </div>
  </section>
</template>

<style scoped>
.cc {
  top: calc(var(--menubar-height) + 6px);
  right: 8px;
  z-index: var(--z-control-center);
  max-height: calc(100vh - var(--menubar-height) - 16px);
  overflow-y: auto;
  transform-origin: top right;
}

.module {
  border-radius: var(--radius-module);
  background: var(--fill-tertiary);
  box-shadow: inset 0 0 0 0.5px var(--separator);
}

.small-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  color: var(--label);
  transition: background-color var(--dur-micro) var(--ease-out);
}
.small-tile:hover {
  background: var(--fill-secondary);
}
.small-tile:active {
  background: var(--fill);
}
.small-tile:focus-visible,
.tile-label:focus-visible,
.focus-row:focus-visible,
.icon-toggle:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 0;
}

.tile-label {
  border-radius: var(--radius-control);
}
.tile-label:hover .text-headline {
  color: var(--label);
}

.focus-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 4px 6px;
  border-radius: var(--radius-control);
}
.focus-row:hover {
  background: var(--fill-tertiary);
}
.focus-row:active {
  background: var(--fill-secondary);
}
.focus-icon {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: var(--fill);
  color: var(--label);
}
.focus-icon.is-on {
  background: var(--sys-indigo);
  color: var(--label-on-accent);
}
.focus-icon :deep(svg) {
  width: 14px;
  height: 14px;
}

.icon-toggle {
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
}
.icon-toggle:hover {
  color: var(--label);
}
.icon-toggle[aria-pressed='true'] {
  color: var(--sys-red);
}

.swatch {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: var(--swatch);
  box-shadow: inset 0 0 0 0.5px var(--edge-dark);
  transition: transform var(--dur-micro) var(--ease-out);
}
.swatch:hover {
  transform: scale(1.1);
}
.swatch:active {
  transform: scale(0.94);
}
.swatch[aria-checked='true'] {
  outline: 2px solid var(--swatch);
  outline-offset: 2px;
}
.swatch:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
