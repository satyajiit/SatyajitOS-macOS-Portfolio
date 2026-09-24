<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * The tall brightness / volume pill. The level fills from the bottom and
 * follows the finger 1:1 relative to where it touched (no jump to the tap
 * point), exactly like Control Centre. Arrow keys nudge by 5.
 */
const value = defineModel<number>({ required: true })
defineProps<{ label: string }>()
const emit = defineEmits<{ active: [boolean] }>()

const track = ref<HTMLElement | null>(null)
let grab: { y: number; start: number } | null = null

const fillStyle = computed(() => ({ transform: `scaleY(${value.value / 100})` }))
const covered = computed(() => value.value > 16)

function clamp(n: number) {
  return Math.round(Math.min(100, Math.max(0, n)))
}

function onDown(event: PointerEvent) {
  grab = { y: event.clientY, start: value.value }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  emit('active', true)
}

function onMove(event: PointerEvent) {
  if (!grab || !track.value) return
  const h = track.value.clientHeight
  value.value = clamp(grab.start - ((event.clientY - grab.y) / h) * 100)
}

function onUp() {
  grab = null
  emit('active', false)
}

function nudge(delta: number) {
  value.value = clamp(value.value + delta)
}
</script>

<template>
  <div
    ref="track"
    class="v-slider material-ios-module focus-ring"
    role="slider"
    tabindex="0"
    :aria-label="label"
    aria-orientation="vertical"
    :aria-valuenow="value"
    aria-valuemin="0"
    aria-valuemax="100"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
    @keydown.up.prevent="nudge(5)"
    @keydown.right.prevent="nudge(5)"
    @keydown.down.prevent="nudge(-5)"
    @keydown.left.prevent="nudge(-5)"
    @focus="emit('active', true)"
    @blur="emit('active', false)"
  >
    <span class="fill" :style="fillStyle" aria-hidden="true" />
    <span class="glyph" :class="covered ? 'text-black' : 'text-ios-label'" aria-hidden="true">
      <slot :value="value" />
    </span>
  </div>
</template>

<style scoped>
.v-slider {
  position: relative;
  width: var(--u);
  height: 100%;
  border-radius: calc(var(--u) / 2);
  overflow: clip;
  touch-action: none;
  transition: transform var(--dur-micro) var(--ease-out);
}

.v-slider:active {
  transform: scaleX(1.04);
}

.fill {
  position: absolute;
  inset: 0;
  background: var(--ios-tint-module-on);
  transform-origin: 50% 100%;
}

.glyph {
  position: absolute;
  inset: auto 0 16px;
  display: grid;
  place-items: center;
  transition: color var(--dur-micro) var(--ease-out);
}

.glyph :deep(svg) {
  width: 24px;
  height: 24px;
}
</style>
