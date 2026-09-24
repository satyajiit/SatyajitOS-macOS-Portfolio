<script setup lang="ts">
import { usePreferredReducedMotion, useResizeObserver } from '@vueuse/core'
import { animate } from 'motion-v'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'

import { apps, type AppDefinition, type AppId } from '@/apps/registry'
import { trashJokes } from '@/content/desktop'
import { useNotificationsStore } from '@/stores/notifications'
import { useWindowsStore } from '@/stores/windows'
import UiAppIcon from '@/ui/UiAppIcon.vue'

import { dockTargets, minimizedFromDock } from './dockTargets'
import TrashIcon from './TrashIcon.vue'

/**
 * The Dock. Icons magnify with pointer proximity and follow it 1:1; the
 * neighbours slide apart so nothing overlaps, and the shelf widens to fit.
 */
const windows = useWindowsStore()
const notifications = useNotificationsStore()
const reduced = usePreferredReducedMotion()

const dockApps = apps.filter((app) => app.dock && app.desktop)
/** Magnifiable slots, left to right. The Trash is the last one. */
const slotCount = dockApps.length + 1

const base = ref(52)
const max = ref(80)
const GAP = 4
const SEPARATOR = 17 // 1px line + 8px margin each side

const scales = reactive<number[]>(Array.from({ length: slotCount }, () => 1))
const settling = ref(true)
const hovered = ref<number | null>(null)

const shelf = ref<HTMLElement | null>(null)
// Function refs keep index order stable (v-for ref arrays don't guarantee it).
const buttons: HTMLElement[] = []
const bouncers: HTMLElement[] = []
const setButton = (i: number) => (el: unknown) => {
  if (el instanceof HTMLElement) buttons[i] = el
}
const setBouncer = (i: number) => (el: unknown) => {
  if (el instanceof HTMLElement) bouncers[i] = el
}

/** Centre of each slot, in shelf coordinates, when nothing is magnified. */
function restCentre(i: number) {
  const sep = i === slotCount - 1 ? SEPARATOR : 0
  return 6 + i * (base.value + GAP) + base.value / 2 + sep
}

const extras = computed(() => scales.map((s) => (s - 1) * base.value))
const totalExtra = computed(() => extras.value.reduce((a, b) => a + b, 0))

/** Push each icon right by the growth of everything to its left, then recentre. */
function shiftFor(i: number) {
  let left = 0
  for (let j = 0; j < i; j++) left += extras.value[j]!
  return left + extras.value[i]! / 2 - totalExtra.value / 2
}

function onPointerMove(event: PointerEvent) {
  if (reduced.value === 'reduce' || !shelf.value) return
  settling.value = false
  const x = event.clientX - shelf.value.getBoundingClientRect().left
  const reach = base.value * 2.6
  const peak = max.value / base.value - 1
  for (let i = 0; i < slotCount; i++) {
    const d = Math.min(1, Math.abs(x - restCentre(i)) / reach)
    scales[i] = 1 + peak * Math.cos((d * Math.PI) / 2) ** 2
  }
}

function onPointerLeave() {
  settling.value = true
  hovered.value = null
  scales.fill(1)
  requestAnimationFrame(measureTargets)
}

function measureTargets() {
  dockApps.forEach((app, i) => {
    const rect = buttons[i]?.getBoundingClientRect()
    if (rect) dockTargets.set(app.id, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
  })
}

function bounce(i: number) {
  const el = bouncers[i]
  if (!el || reduced.value === 'reduce') return
  animate(el, { y: [0, -22, 0, -10, 0] }, { duration: 0.9, ease: 'easeOut' })
}

function launch(app: AppDefinition, i: number) {
  const win = windows.windows[app.id]
  if (!win?.isOpen) bounce(i)
  else if (win.isMinimized) minimizedFromDock.add(app.id)
  windows.open(app.id)
}

function emptyTrash() {
  notifications.notify({
    title: 'Trash',
    body: trashJokes[Math.floor(Math.random() * trashJokes.length)]!,
  })
}

const isRunning = (id: AppId) => !!windows.windows[id]?.isOpen

useResizeObserver(shelf, () => requestAnimationFrame(measureTargets))
onMounted(async () => {
  const styles = getComputedStyle(document.documentElement)
  base.value = parseFloat(styles.getPropertyValue('--dock-icon-size')) || 52
  max.value = parseFloat(styles.getPropertyValue('--dock-magnified-size')) || 80
  await nextTick()
  measureTargets()
})
</script>

<template>
  <nav class="dock chrome fixed" aria-label="Dock" @pointerleave="onPointerLeave">
    <div
      class="shelf-bg material-dock"
      :class="{ settling }"
      :style="{ left: `${-totalExtra / 2}px`, right: `${-totalExtra / 2}px` }"
      aria-hidden="true"
    />
    <ul ref="shelf" class="relative flex items-end p-1.5" :style="{ gap: `${GAP}px` }" @pointermove="onPointerMove">
      <li
        v-for="(app, i) in dockApps"
        :key="app.id"
        class="slot"
        :class="{ settling }"
        :style="{ transform: `translateX(${shiftFor(i)}px)` }"
      >
        <span
          v-if="hovered === i"
          class="tooltip material-popover text-body"
          :style="{ transform: `translate(-50%, ${-extras[i]!}px)` }"
          role="tooltip"
        >
          {{ app.name }}
        </span>
        <button
          :ref="setButton(i)"
          type="button"
          class="icon-button"
          :class="{ settling }"
          :style="{ transform: `scale(${scales[i]})`, width: `${base}px`, height: `${base}px` }"
          :aria-label="isRunning(app.id) ? `${app.name}, running` : app.name"
          @click="launch(app, i)"
          @pointerenter="hovered = i"
          @focus="hovered = i"
          @blur="hovered = null"
        >
          <span :ref="setBouncer(i)" class="block">
            <UiAppIcon :name="app.icon" :size="base" :badge="app.badge?.() ?? 0" />
          </span>
        </button>
        <span class="dot" :class="{ 'is-on': isRunning(app.id) }" aria-hidden="true" />
      </li>

      <li class="separator" aria-hidden="true" :style="{ transform: `translateX(${shiftFor(slotCount - 1) - extras[slotCount - 1]! / 2}px)` }" />

      <li
        class="slot"
        :class="{ settling }"
        :style="{ transform: `translateX(${shiftFor(slotCount - 1)}px)` }"
      >
        <span
          v-if="hovered === slotCount - 1"
          class="tooltip material-popover text-body"
          :style="{ transform: `translate(-50%, ${-extras[slotCount - 1]!}px)` }"
          role="tooltip"
        >
          Trash
        </span>
        <button
          type="button"
          class="icon-button"
          :class="{ settling }"
          :style="{ transform: `scale(${scales[slotCount - 1]})`, width: `${base}px`, height: `${base}px` }"
          aria-label="Trash"
          @click="emptyTrash"
          @pointerenter="hovered = slotCount - 1"
          @focus="hovered = slotCount - 1"
          @blur="hovered = null"
        >
          <TrashIcon class="size-full" :style="{ filter: 'var(--elev-icon-drop)' }" />
        </button>
        <span class="dot" aria-hidden="true" />
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.dock {
  left: 50%;
  bottom: 6px;
  transform: translateX(-50%);
  z-index: var(--z-dock);
}

.shelf-bg {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: var(--radius-dock);
}

.slot {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.separator {
  align-self: stretch;
  width: 1px;
  margin: 6px 8px;
  background: var(--separator);
}

.icon-button {
  display: block;
  transform-origin: 50% 100%;
  border-radius: 22%;
}
.icon-button:hover {
  filter: brightness(1.04);
}
.icon-button:active {
  filter: brightness(0.82);
}
.icon-button:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}

.settling {
  transition:
    transform var(--dur-short) var(--ease-out),
    left var(--dur-short) var(--ease-out),
    right var(--dur-short) var(--ease-out);
}

.dot {
  width: 4px;
  height: 4px;
  margin-top: 2px;
  border-radius: 999px;
  background: transparent;
}
.dot.is-on {
  background: var(--label);
}

.tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  padding: 3px 10px;
  border-radius: 7px;
  white-space: nowrap;
  color: var(--label);
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .settling {
    transition: none;
  }
}
</style>
