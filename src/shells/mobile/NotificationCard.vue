<script setup lang="ts">
import { X } from '@lucide/vue'
import { useIntervalFn, useNow } from '@vueuse/core'
import { animate, motion, useMotionValue } from 'motion-v'
import { computed } from 'vue'

import { getApp } from '@/apps/registry'
import { notificationCentre as copy, pickRandom } from '@/content/mobile'
import { spring } from '@/design/motion'
import type { NotificationAction, OsNotification } from '@/stores/notifications'
import UiAppIcon from '@/ui/UiAppIcon.vue'

import { createVelocityTracker, project, rubberband } from './gestures'
import { relativeTime } from './useClock'

/**
 * A notification in Notification Centre or a banner. Swipe it left to clear
 * (tracks 1:1, projects the flick), tap it to act on it.
 */
const props = withDefaults(defineProps<{ notification: OsNotification; swipe?: 'left' | 'up' }>(), {
  swipe: 'left',
})
const emit = defineEmits<{ open: []; dismiss: []; action: [NotificationAction] }>()

const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 30000) })
const when = computed(() => relativeTime(props.notification.createdAt, now.value.getTime()))
const icon = computed(() => (props.notification.app ? getApp(props.notification.app)?.icon : undefined) ?? 'brand')
const appName = computed(() =>
  props.notification.app ? (getApp(props.notification.app)?.name ?? 'SatyajitOS') : 'SatyajitOS',
)
const dismissLabel = pickRandom(copy.dismissLabels)

const offset = useMotionValue(0)
const tracker = createVelocityTracker()
let drag: { start: number; id: number; moved: boolean; size: number } | null = null
const axis = (e: PointerEvent) => (props.swipe === 'left' ? e.clientX : e.clientY)

function onDown(event: PointerEvent) {
  if (event.button !== 0) return
  const el = event.currentTarget as HTMLElement
  drag = {
    start: axis(event),
    id: event.pointerId,
    moved: false,
    size: props.swipe === 'left' ? el.offsetWidth : el.offsetHeight,
  }
  tracker.reset()
  tracker.add(axis(event))
}

function onMove(event: PointerEvent) {
  if (!drag || event.pointerId !== drag.id) return
  const d = axis(event) - drag.start
  if (!drag.moved && Math.abs(d) < 8) return
  if (!drag.moved) {
    drag.moved = true
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }
  tracker.add(axis(event))
  offset.set(d < 0 ? d : rubberband(d, drag.size))
}

function onUp(event: PointerEvent) {
  if (!drag || event.pointerId !== drag.id) return
  const { moved, size } = drag
  drag = null
  if (!moved) return
  const velocity = tracker.velocity()
  if (offset.get() + project(velocity) < -size * 0.4) {
    animate(offset, -size * 1.3, { ...spring.momentum, velocity }).then(() => emit('dismiss'))
  } else {
    animate(offset, 0, { ...spring.momentum, velocity })
  }
}

function onClick(event: MouseEvent) {
  if ((event.target as Element).closest('[data-dismiss], [data-action]')) return
  emit('open')
}

const style = computed(() => (props.swipe === 'left' ? { x: offset } : { y: offset }))
</script>

<template>
  <motion.article
    class="card material-notification rounded-[22px] text-ios-label"
    :style="style"
    :class="swipe === 'left' ? 'touch-pan-y' : 'touch-none'"
    role="button"
    tabindex="0"
    :aria-label="`${appName}: ${notification.title}. ${notification.body}`"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
    @click="onClick"
    @keydown.enter.prevent="emit('open')"
    @keydown.delete.prevent="emit('dismiss')"
  >
    <UiAppIcon :name="icon" :size="38" :shadow="false" class="mt-0.5" />
    <div class="min-w-0 flex-1">
      <div class="flex items-baseline gap-2">
        <h3 class="min-w-0 flex-1 truncate text-ios-subheadline font-semibold">{{ notification.title }}</h3>
        <time class="shrink-0 text-ios-footnote text-ios-label-secondary">{{ when }}</time>
      </div>
      <p class="line-clamp-4 text-ios-subheadline">{{ notification.body }}</p>
      <div v-if="notification.actions?.length" class="mt-2 flex flex-wrap gap-2">
        <button
          v-for="action in notification.actions"
          :key="action.label"
          type="button"
          class="action focus-ring"
          data-action
          @click.stop="emit('action', action)"
        >
          {{ action.label }}
        </button>
      </div>
    </div>
    <button
      type="button"
      class="dismiss focus-ring"
      data-dismiss
      :aria-label="dismissLabel"
      :title="dismissLabel"
      @click.stop="emit('dismiss')"
    >
      <X aria-hidden="true" />
    </button>
  </motion.article>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  user-select: none;
  -webkit-user-select: none;
  transition: transform var(--dur-micro) var(--ease-out);
}

.card:active {
  filter: brightness(0.96);
}

.card:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}

/* Hover-only close button, for pointer users who can't swipe; keyboard gets Delete. */
.dismiss {
  position: absolute;
  top: -6px;
  left: -6px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: var(--ios-bg-tertiary);
  box-shadow: var(--elev-control);
  color: var(--ios-label-secondary);
  opacity: 0;
  transition: opacity var(--dur-micro) var(--ease-out);
}
.dismiss svg {
  width: 12px;
  height: 12px;
  stroke-width: 2.6;
}
.card:hover .dismiss,
.dismiss:focus-visible {
  opacity: 1;
}
.dismiss:active {
  transform: scale(0.9);
}

.action {
  height: 30px;
  padding: 0 14px;
  border-radius: 999px;
  background: var(--ios-fill-tertiary);
  color: var(--accent);
  font-size: var(--text-ios-footnote);
  font-weight: 600;
  transition: transform var(--dur-micro) var(--ease-out);
}
.action:hover {
  background: var(--ios-fill-secondary);
}
.action:active {
  transform: scale(0.95);
  background: var(--ios-fill);
}
</style>
