<script setup lang="ts">
import { Plane } from '@lucide/vue'
import { computed } from 'vue'

import { usePlatform } from '@/composables/usePlatform'
import { useMobileStore, type Panel } from '@/stores/mobile'

import { useClock } from './useClock'

/**
 * The iPhone status bar. The left ear opens Notification Centre, the right
 * ear opens Control Centre, by tap or by pulling down. In an installed PWA
 * the real status bar is already there, so only the gesture areas remain.
 */
defineProps<{ onDark: boolean }>()

const store = useMobileStore()
const { isStandalone } = usePlatform()
const { time } = useClock()

const batteryWidth = computed(() => Math.max(2, (store.battery / 100) * 20))
const wifiOn = computed(() => store.controls.wifi)

let start: { y: number; panel: Panel; opened: boolean } | null = null

function onDown(panel: Panel, event: PointerEvent) {
  if (event.button !== 0) return
  start = { y: event.clientY, panel, opened: false }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onMove(event: PointerEvent) {
  if (!start || start.opened) return
  if (event.clientY - start.y > 18) {
    start.opened = true
    store.openPanel(start.panel)
  }
}

function onUp(event: PointerEvent) {
  if (!start) return
  const moved = Math.abs(event.clientY - start.y) > 8
  if (!start.opened && !moved) store.togglePanel(start.panel)
  start = null
}
</script>

<template>
  <header
    class="status chrome"
    :class="onDark ? 'text-white' : 'text-ios-label'"
    aria-label="Status bar"
  >
    <button
      type="button"
      class="ear focus-ring"
      :aria-label="store.panel === 'notifications' ? 'Close Notification Centre' : 'Open Notification Centre'"
      :aria-expanded="store.panel === 'notifications'"
      @pointerdown="onDown('notifications', $event)"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @keydown.enter.prevent="store.togglePanel('notifications')"
    >
      <span v-if="!isStandalone" class="time tabular">{{ time }}</span>
    </button>

    <span aria-hidden="true" />

    <button
      type="button"
      class="ear focus-ring"
      :aria-label="store.panel === 'control' ? 'Close Control Centre' : 'Open Control Centre'"
      :aria-expanded="store.panel === 'control'"
      @pointerdown="onDown('control', $event)"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @keydown.enter.prevent="store.togglePanel('control')"
    >
      <span v-if="!isStandalone" class="flex items-center gap-[5px]">
        <Plane v-if="store.controls.airplane" class="size-[15px]" style="stroke-width: 2.4" aria-label="Airplane mode" />
        <svg v-else width="18" height="12" viewBox="0 0 18 12" aria-label="Signal">
          <rect
            v-for="(h, i) in [4, 6, 8.5, 11]"
            :key="i"
            :x="i * 4.8"
            :y="12 - h"
            width="3.2"
            :height="h"
            rx="1"
            fill="currentColor"
            :opacity="i < store.signalBars ? 1 : 0.3"
          />
        </svg>
        <svg v-if="wifiOn" width="16" height="12" viewBox="0 0 16 12" aria-label="Wi-Fi">
          <path
            d="M8 2.2c2.4 0 4.6.9 6.3 2.4l1.2-1.3A11 11 0 0 0 8 .4 11 11 0 0 0 .5 3.3l1.2 1.3A9.2 9.2 0 0 1 8 2.2Z"
            fill="currentColor"
          />
          <path
            d="M8 5.6c1.5 0 2.9.6 3.9 1.5l1.2-1.3A7.4 7.4 0 0 0 8 3.8c-2 0-3.8.7-5.1 2l1.2 1.3c1-.9 2.4-1.5 3.9-1.5Z"
            fill="currentColor"
          />
          <path d="M8 9c.6 0 1.2.2 1.6.6L8 11.4 6.4 9.6c.4-.4 1-.6 1.6-.6Z" fill="currentColor" />
          <path d="M8 7.2c1.1 0 2.1.4 2.8 1.1l-1.2 1.3A2.3 2.3 0 0 0 8 9a2.3 2.3 0 0 0-1.6.6L5.2 8.3c.7-.7 1.7-1.1 2.8-1.1Z" fill="currentColor" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" :aria-label="`Battery ${store.battery}%`">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" :width="batteryWidth" height="9" rx="2.4" fill="currentColor" />
          <path d="M25 4.4v4.2c.8-.3 1.4-1.1 1.4-2.1s-.6-1.8-1.4-2.1Z" fill="currentColor" opacity="0.45" />
        </svg>
      </span>
    </button>
  </header>
</template>

<style scoped>
.status {
  position: absolute;
  inset: 0 0 auto;
  height: var(--ios-status-height);
  display: grid;
  grid-template-columns: 1fr min(126px, 30vw) 1fr;
  align-items: stretch;
  transition: color var(--dur-short) var(--ease-out);
}

.ear {
  display: grid;
  place-items: center;
  padding-top: 4px;
  touch-action: none;
}

.ear:active {
  opacity: 0.7;
}

.ear:focus-visible {
  outline-offset: -4px;
  border-radius: 14px;
}

.time {
  font-size: var(--text-ios-headline);
  font-weight: 600;
  letter-spacing: -0.01em;
}
</style>
