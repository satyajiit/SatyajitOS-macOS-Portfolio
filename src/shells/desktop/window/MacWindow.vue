<script lang="ts">
/** Last frame of each window before it minimised, so it can restore out of the Dock. */
const minimizedFrames = new Map<string, { x: number; y: number; width: number; height: number }>()
</script>

<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { motion } from 'motion-v'
import { computed, defineAsyncComponent, provide, ref, shallowRef } from 'vue'

import { getApp, type AppId } from '@/apps/registry'
import { spring } from '@/design/motion'
import { useWindowsStore } from '@/stores/windows'
import { WINDOW_CONTEXT } from '@/ui/window/context'

import { dockTargets, minimizedFromDock } from '../dock/dockTargets'
import { useWindowDrag } from './useWindowDrag'
import { EDGES, useWindowResize, type Edge } from './useWindowResize'
import WindowLoading from './WindowLoading.vue'

/**
 * A macOS window: frame, shadow, focus, drag, resize. The app inside draws its
 * own title bar or toolbar with the pieces in src/ui/window.
 */
const props = defineProps<{ id: AppId }>()

const store = useWindowsStore()
const app = getApp(props.id)!
const spec = app.desktop!
const win = computed(() => store.windows[props.id]!)
const isKey = computed(() => store.focusedId === props.id)
const isZoomed = computed(() => win.value.isZoomed)

const root = ref<HTMLElement | null>(null)
const drag = useWindowDrag(props.id, root)
const resize = useWindowResize(props.id)

const AppView = shallowRef(
  defineAsyncComponent({ loader: spec.component, loadingComponent: WindowLoading, delay: 120 }),
)

provide(WINDOW_CONTEXT, {
  id: props.id,
  title: spec.title,
  chrome: spec.chrome,
  isKey,
  isZoomed,
  close: () => store.close(props.id),
  minimize: () => store.minimize(props.id),
  toggleZoom: () => store.toggleZoom(props.id),
})

const frame = computed(() => ({
  width: `${win.value.width}px`,
  height: `${win.value.height}px`,
  transform: `translate3d(${win.value.x}px, ${win.value.y}px, 0)`,
  zIndex: win.value.zIndex,
}))

const resizable = spec.resizable !== false
const reduced = usePreferredReducedMotion()

/**
 * Minimise shrinks the window into its Dock icon (a pared-down genie);
 * restoring plays it backwards. Close and open are a quick scale + fade.
 */
function towardDock(rect: { x: number; y: number; width: number; height: number }) {
  const target = dockTargets.get(props.id)
  if (!target || reduced.value === 'reduce') return null
  return {
    x: target.x - (rect.x + rect.width / 2),
    y: target.y - (rect.y + rect.height / 2),
    scale: 0.06,
    opacity: 0,
  }
}

const restoreFrom = minimizedFromDock.has(props.id) ? minimizedFrames.get(props.id) : undefined
minimizedFromDock.delete(props.id)
const initial = (restoreFrom && towardDock(restoreFrom)) || { opacity: 0, scale: 0.96 }

// A variant function runs when the exit starts, so it sees why the window is
// leaving (minimise vs close) even though this component won't re-render first.
const variants = {
  exit: () => {
    const current = store.windows[props.id]
    if (current?.isMinimized) {
      const frame = { x: current.x, y: current.y, width: current.width, height: current.height }
      minimizedFrames.set(props.id, frame)
      minimizedFromDock.add(props.id)
      const dock = towardDock(frame)
      if (dock) return { ...dock, transition: { duration: 0.38, ease: [0.55, 0, 0.8, 0.2] } }
    }
    minimizedFromDock.delete(props.id)
    return { opacity: 0, scale: 0.96, transition: { duration: 0.16 } }
  },
}

const onHandle = (edge: Edge, event: PointerEvent) => resize.start(edge, event)

// Like AppKit, the traffic lights of a background window act without first
// bringing that window to the front.
function onPointerDownCapture(event: PointerEvent) {
  if (event.target instanceof Element && event.target.closest('.traffic')) return
  store.focus(props.id)
}
</script>

<template>
  <section
    ref="root"
    class="mac-window absolute left-0 top-0"
    :style="frame"
    :aria-label="spec.title"
    :data-key="isKey || undefined"
    :data-window="id"
    @pointerdown.capture="onPointerDownCapture"
    @pointerdown="drag.onPointerDown"
    @pointermove="drag.onPointerMove"
    @pointerup="drag.onPointerUp"
    @pointercancel="drag.onPointerUp"
    @dblclick="drag.onDoubleClick"
  >
    <motion.div
      class="frame flex h-full w-full flex-col overflow-clip rounded-window"
      :class="[isKey ? 'shadow-window' : 'shadow-window-inactive', spec.vibrant ? '' : 'bg-window-content']"
      :initial="initial"
      :animate="{ opacity: 1, scale: 1, x: 0, y: 0 }"
      :variants="variants"
      exit="exit"
      :transition="spring.default"
    >
      <component :is="AppView" />
    </motion.div>

    <template v-if="resizable && !isZoomed">
      <div
        v-for="edge in EDGES"
        :key="edge"
        class="edge"
        :class="`edge-${edge}`"
        aria-hidden="true"
        @pointerdown="onHandle(edge, $event)"
      />
    </template>
  </section>
</template>

<style scoped>
.mac-window {
  contain: layout style;
}
.mac-window[data-dragging] {
  cursor: default;
  user-select: none;
}

.edge {
  position: absolute;
  z-index: 1;
}
.edge-n,
.edge-s {
  left: 12px;
  right: 12px;
  height: 8px;
  cursor: ns-resize;
}
.edge-e,
.edge-w {
  top: 12px;
  bottom: 12px;
  width: 8px;
  cursor: ew-resize;
}
.edge-n {
  top: -4px;
}
.edge-s {
  bottom: -4px;
}
.edge-e {
  right: -4px;
}
.edge-w {
  left: -4px;
}
.edge-ne,
.edge-nw,
.edge-se,
.edge-sw {
  width: 16px;
  height: 16px;
}
.edge-ne {
  top: -4px;
  right: -4px;
  cursor: nesw-resize;
}
.edge-sw {
  bottom: -4px;
  left: -4px;
  cursor: nesw-resize;
}
.edge-nw {
  top: -4px;
  left: -4px;
  cursor: nwse-resize;
}
.edge-se {
  bottom: -4px;
  right: -4px;
  cursor: nwse-resize;
}
</style>
