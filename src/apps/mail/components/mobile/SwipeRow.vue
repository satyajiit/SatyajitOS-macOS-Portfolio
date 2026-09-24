<script setup lang="ts">
import { computed, ref } from 'vue'

import type { SwipeAction } from './types'

/**
 * A list row you can swipe, like Mail's. Drag left to reveal the trailing
 * actions (a long, fast swipe runs the last one), drag right to run the
 * leading one. The row tracks the finger 1:1 after a 10px dead zone, resists
 * past the edge, and projects the release velocity to decide where to land.
 * Vertical drags are left to the scroll view.
 */
const props = defineProps<{ trailing: SwipeAction[]; leading?: SwipeAction }>()
const emit = defineEmits<{ tap: [] }>()

const ACTION_WIDTH = 74
const x = ref(0)
const dragging = ref(false)
const row = ref<HTMLElement | null>(null)

const trailingWidth = computed(() => props.trailing.length * ACTION_WIDTH)

let start: { x: number; y: number; base: number; id: number } | null = null
let axis: 'x' | 'y' | null = null
let samples: { x: number; t: number }[] = []
let suppressClick = false

/** Progressive resistance past the edge (Apple's rubber-band curve). */
function rubberband(overshoot: number, dimension: number, c = 0.55) {
  return (overshoot * dimension * c) / (dimension + c * Math.abs(overshoot))
}

function onDown(e: PointerEvent) {
  if (e.button !== 0) return
  start = { x: e.clientX, y: e.clientY, base: x.value, id: e.pointerId }
  axis = null
  samples = [{ x: e.clientX, t: e.timeStamp }]
}

function onMove(e: PointerEvent) {
  if (!start || e.pointerId !== start.id) return
  const dx = e.clientX - start.x
  const dy = e.clientY - start.y
  if (!axis) {
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      axis = 'x'
      dragging.value = true
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } else if (Math.abs(dy) > 10) {
      axis = 'y'
    }
  }
  if (axis !== 'x') return
  const width = row.value?.clientWidth ?? 375
  const min = -width
  const max = props.leading ? ACTION_WIDTH * 1.4 : 0
  let next = start.base + dx
  if (next > max) next = max + rubberband(next - max, width)
  if (next < min) next = min + rubberband(next - min, width)
  x.value = next
  samples.push({ x: e.clientX, t: e.timeStamp })
  if (samples.length > 5) samples.shift()
}

function onUp(e: PointerEvent) {
  if (!start || e.pointerId !== start.id) return
  const wasDrag = axis === 'x'
  start = null
  dragging.value = false
  if (!wasDrag) return
  suppressClick = true

  const first = samples[0]!
  const last = samples.at(-1)!
  const velocity = ((last.x - first.x) / Math.max(1, last.t - first.t)) * 1000
  // Where the row would coast to (Apple's projection, decelerationRate 0.99).
  const projected = x.value + ((velocity / 1000) * 0.99) / (1 - 0.99)
  const width = row.value?.clientWidth ?? 375

  if (projected < -width * 0.6 && props.trailing.length) {
    x.value = -width
    props.trailing.at(-1)!.run()
    return
  }
  if (projected < -trailingWidth.value / 2) {
    x.value = -trailingWidth.value
    return
  }
  if (props.leading && projected > ACTION_WIDTH) props.leading.run()
  x.value = 0
}

function onClick() {
  if (suppressClick) {
    suppressClick = false
    return
  }
  if (x.value !== 0) x.value = 0
  else emit('tap')
}

function runAction(action: SwipeAction) {
  x.value = 0
  action.run()
}
</script>

<template>
  <li ref="row" class="swipe relative overflow-clip">
    <div v-if="leading" class="absolute inset-y-0 left-0 flex" aria-hidden="true">
      <span
        class="action"
        :class="`tone-${leading.tone}`"
        :style="{ width: `${Math.max(0, x)}px` }"
      >
        <component :is="leading.icon" class="size-5 shrink-0" />
      </span>
    </div>
    <div class="absolute inset-y-0 right-0 flex" :style="{ width: `${Math.max(0, -x)}px` }">
      <button
        v-for="action in trailing"
        :key="action.label"
        type="button"
        class="action focus-ring flex-1"
        :class="`tone-${action.tone}`"
        :aria-label="action.label"
        :tabindex="x < 0 ? 0 : -1"
        @click="runAction(action)"
      >
        <component :is="action.icon" class="size-5 shrink-0" />
        <span class="text-ios-caption-2">{{ action.label }}</span>
      </button>
    </div>
    <div
      class="content relative bg-ios-bg"
      :class="{ 'is-dragging': dragging }"
      :style="{ transform: `translateX(${x}px)` }"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @click="onClick"
    >
      <slot />
    </div>
  </li>
</template>

<style scoped>
.content {
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
  transition: transform var(--dur-short) var(--ease-out);
}
.content.is-dragging {
  transition: none;
}
.action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 0;
  overflow: hidden;
  color: var(--label-on-accent);
}
.action:active {
  filter: brightness(0.88);
}
.tone-accent {
  background: var(--accent);
}
.tone-orange {
  background: var(--sys-orange);
}
.tone-red {
  background: var(--sys-red);
}
.tone-gray {
  background: var(--sys-gray);
}
</style>
