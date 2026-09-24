<script setup lang="ts">
import { computed, ref } from 'vue'

/** A full-width Control Centre slider for Satyajit's extra modules. Drags 1:1. */
const value = defineModel<number>({ required: true })
defineProps<{ label: string; emoji: string; status: string; hint: string }>()

const track = ref<HTMLElement | null>(null)
let grab: { x: number; start: number } | null = null
const fillStyle = computed(() => ({ transform: `scaleX(${value.value / 100})` }))

const clamp = (n: number) => Math.round(Math.min(100, Math.max(0, n)))

function onDown(event: PointerEvent) {
  grab = { x: event.clientX, start: value.value }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}
function onMove(event: PointerEvent) {
  if (!grab || !track.value) return
  value.value = clamp(grab.start + ((event.clientX - grab.x) / track.value.clientWidth) * 100)
}
const onUp = () => (grab = null)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div
      ref="track"
      class="w-slider material-ios-module focus-ring"
      role="slider"
      tabindex="0"
      :aria-label="label"
      :aria-valuenow="value"
      :aria-valuetext="`${status} ${hint}`"
      aria-valuemin="0"
      aria-valuemax="100"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @keydown.right.prevent="value = clamp(value + 5)"
      @keydown.up.prevent="value = clamp(value + 5)"
      @keydown.left.prevent="value = clamp(value - 5)"
      @keydown.down.prevent="value = clamp(value - 5)"
    >
      <span class="fill" :style="fillStyle" aria-hidden="true" />
      <span class="relative flex h-full items-center gap-3 px-5" aria-hidden="true">
        <span class="text-ios-title-3">{{ emoji }}</span>
        <span class="min-w-0 flex-1 truncate text-ios-subheadline font-semibold text-ios-label">
          {{ label }}
        </span>
        <span class="text-ios-title-3">{{ status }}</span>
      </span>
    </div>
    <p class="px-3 text-ios-caption-1 text-white/70">{{ hint }}</p>
  </div>
</template>

<style scoped>
.w-slider {
  position: relative;
  height: var(--u);
  border-radius: calc(var(--u) / 2);
  overflow: clip;
  touch-action: none;
}

.fill {
  position: absolute;
  inset: 0;
  background: var(--accent);
  opacity: 0.45;
  transform-origin: 0 50%;
}
</style>
