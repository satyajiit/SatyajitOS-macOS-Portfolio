<script setup lang="ts">
import { usePreferredReducedMotion, useWindowSize } from '@vueuse/core'
import { animate, motion, useMotionValue, useTransform } from 'motion-v'
import { computed, defineAsyncComponent, provide, shallowRef, watch, type Component } from 'vue'

import { getApp, type AppId } from '@/apps/registry'
import { spring } from '@/design/motion'
import { useMobileStore, type LaunchRect } from '@/stores/mobile'
import UiSpinner from '@/ui/UiSpinner.vue'
import { MOBILE_APP_CONTEXT } from '@/ui/mobile/context'

import { createVelocityTracker, project, rubberband } from './gestures'

/**
 * The foreground app. It grows out of its icon, and the home indicator drags
 * it back: the card tracks the finger 1:1, shrinks as it rises, and on
 * release either flies home (if the flick projects far enough) or springs
 * back, carrying the finger's velocity either way.
 */
const store = useMobileStore()
const reduced = usePreferredReducedMotion()
const { width, height } = useWindowSize()

const shownId = shallowRef<AppId | null>(null)
const view = shallowRef<Component | null>(null)

const x = useMotionValue(0)
const y = useMotionValue(0)
const scale = useMotionValue(1)
const opacity = useMotionValue(0)
/** Corner radius grows as the card shrinks, so it reads as a screen, not a crop. */
const radius = useTransform(scale, [0.4, 1], [48, 0])

/** Release velocity of the swipe that closed the app, handed to the close spring. */
let pendingVelocity = 0

const bg = computed(() => (shownId.value ? 'bg-ios-bg' : ''))

function iconRect(id: AppId): LaunchRect | null {
  const el = document.querySelector<HTMLElement>(`[data-app-icon="${id}"]`)
  const rect = el?.getBoundingClientRect()
  return rect && rect.width ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null
}

/** Transform that makes the full-screen card sit exactly over `rect`. */
function frameFor(rect: LaunchRect | null) {
  if (!rect) return { x: 0, y: 0, scale: 0.35 }
  return {
    x: rect.x + rect.width / 2 - width.value / 2,
    y: rect.y + rect.height / 2 - height.value / 2,
    scale: rect.width / width.value,
  }
}

function open(id: AppId) {
  const app = getApp(id)
  if (!app?.mobile) return
  shownId.value = id
  view.value = defineAsyncComponent({ loader: app.mobile.component, loadingComponent: UiSpinner })

  if (reduced.value === 'reduce') {
    x.set(0)
    y.set(0)
    scale.set(1)
    opacity.set(0)
    animate(opacity, 1, { duration: 0.15 })
    return
  }
  const from = frameFor(store.launchRect ?? iconRect(id))
  x.set(from.x)
  y.set(from.y)
  scale.set(from.scale)
  opacity.set(0)
  animate(x, 0, spring.default)
  animate(y, 0, spring.default)
  animate(scale, 1, spring.default)
  animate(opacity, 1, { duration: 0.18 })
}

async function close(velocityY = 0) {
  const id = shownId.value
  if (!id) return
  if (reduced.value === 'reduce') {
    await animate(opacity, 0, { duration: 0.15 })
  } else {
    const to = frameFor(iconRect(id))
    const transition = velocityY ? spring.momentum : spring.default
    await Promise.all([
      animate(x, to.x, transition),
      animate(y, to.y, { ...transition, velocity: velocityY }),
      animate(scale, to.scale, transition),
      animate(opacity, 0, { duration: 0.28, delay: 0.08 }),
    ])
  }
  // A different app may have been opened while this one was leaving.
  if (shownId.value === id && !store.activeApp) {
    shownId.value = null
    view.value = null
  }
}

watch(
  () => store.activeApp,
  (id, previous) => {
    if (id) open(id)
    else if (previous) close(pendingVelocity)
    pendingVelocity = 0
  },
  { immediate: true },
)

provide(MOBILE_APP_CONTEXT, { close: () => store.closeApp() })

/* ── Home indicator drag ─────────────────────────────────────────────── */

let drag: { startY: number; pointerId: number } | null = null
const tracker = createVelocityTracker()

function onDown(event: PointerEvent) {
  if (!shownId.value) return
  drag = { startY: event.clientY, pointerId: event.pointerId }
  tracker.reset()
  tracker.add(event.clientY)
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  x.stop()
  y.stop()
  scale.stop()
}

function onMove(event: PointerEvent) {
  if (!drag || event.pointerId !== drag.pointerId) return
  tracker.add(event.clientY)
  const dy = event.clientY - drag.startY
  if (dy < 0) {
    y.set(dy)
    scale.set(Math.max(0.45, 1 + (dy / height.value) * 0.9))
  } else {
    y.set(rubberband(dy, height.value))
    scale.set(1)
  }
}

function onUp(event: PointerEvent) {
  if (!drag || event.pointerId !== drag.pointerId) return
  drag = null
  const velocity = tracker.velocity()
  const projected = y.get() + project(velocity)
  if (projected < -height.value * 0.22) {
    pendingVelocity = velocity
    store.closeApp()
  } else {
    animate(y, 0, { ...spring.momentum, velocity })
    animate(scale, 1, spring.momentum)
  }
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    store.closeApp()
  }
}
</script>

<template>
  <motion.section
    v-if="shownId"
    class="app-card fixed inset-0 overflow-clip"
    :class="bg"
    :style="{ x, y, scale, opacity, borderRadius: radius }"
    :aria-label="getApp(shownId)?.name"
  >
    <div class="h-full w-full">
      <component :is="view" v-if="view" />
    </div>

    <div
      class="indicator-zone chrome"
      role="button"
      tabindex="0"
      aria-label="Go to Home Screen"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @keydown="onKey"
    >
      <span class="indicator bg-ios-label" />
    </div>
  </motion.section>
</template>

<style scoped>
.app-card {
  transform-origin: 50% 50%;
  will-change: transform;
}

.indicator-zone {
  position: absolute;
  left: 50%;
  bottom: 0;
  translate: -50% 0;
  width: min(60%, 220px);
  height: var(--ios-home-indicator-height);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: max(env(safe-area-inset-bottom), 8px);
  touch-action: none;
  z-index: 20;
}

.indicator {
  width: 134px;
  max-width: 100%;
  height: 5px;
  border-radius: 999px;
  opacity: 0.85;
  transition: transform var(--dur-micro) var(--ease-out);
}

.indicator-zone:active .indicator {
  transform: scaleX(1.06);
}

.indicator-zone:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: -3px;
  border-radius: 12px;
}
</style>
