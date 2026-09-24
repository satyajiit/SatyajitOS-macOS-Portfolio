<script setup lang="ts">
import { BellOff, X } from '@lucide/vue'
import { AnimatePresence, motion } from 'motion-v'
import { computed } from 'vue'

import { notificationCentre as copy, pickBelow, pickRandom } from '@/content/mobile'
import { spring } from '@/design/motion'
import { useMobileStore } from '@/stores/mobile'
import { useNotificationsStore, type OsNotification } from '@/stores/notifications'
import IconText from '@/ui/IconText.vue'

import NotificationCard from './NotificationCard.vue'
import PanelGrabber from './PanelGrabber.vue'
import { useClock } from './useClock'
import { useNotificationActions } from './useNotificationActions'
import { usePanelDrag } from './usePanelDrag'

/**
 * Notification Centre, drawn as the Lock Screen: date, big clock, two
 * lock-screen widgets (mood and distraction, from the old panel), then the
 * notification stack.
 */
const store = useMobileStore()
const notifications = useNotificationsStore()
const { time, date } = useClock()

const subtitle = pickRandom(copy.subtitles)
const emptyMessage = pickRandom(copy.emptyMessages)
const count = computed(() => notifications.history.length)
const mood = computed(() => pickBelow(copy.mood, count.value))
const distraction = computed(() => pickBelow(copy.distraction, count.value))

const { runAction, openNotification } = useNotificationActions()

function open(n: OsNotification) {
  const handled = openNotification(n)
  notifications.remove(n.id)
  // System notifications have nothing to open, so the OS answers back.
  if (!handled) notifications.notify({ title: copy.tapReplyTitle, body: pickRandom(copy.tapReplies), silent: true })
}

function addDemo() {
  const demo = pickRandom(copy.demos)
  notifications.notify({ ...demo, silent: true })
}

function snoozeAll() {
  const snoozed = count.value
  if (!snoozed) return
  notifications.clearAll()
  notifications.notify({ title: copy.snoozed.title, body: copy.snoozed.body(snoozed), silent: true })
}

function markAllRead() {
  notifications.clearAll()
  notifications.notify({ ...copy.markedRead, silent: true })
}

const { y, onDown, onMove, onUp } = usePanelDrag(() => store.closePanel())
</script>

<template>
  <div class="fixed inset-0" role="dialog" aria-modal="true" aria-label="Notification Centre">
    <motion.div
      class="backdrop absolute inset-0 bg-black/40"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      :transition="{ duration: 0.25 }"
    />
    <motion.div
      class="sheet absolute inset-0 overflow-y-auto overscroll-contain text-white"
      :style="{ y }"
      :initial="{ opacity: 0, y: -40 }"
      :animate="{ opacity: 1, y: 0 }"
      :exit="{ opacity: 0, y: -40 }"
      :transition="spring.default"
    >
      <div class="content mx-auto">
        <header class="flex flex-col items-center pt-2 text-center">
          <p class="text-ios-headline font-semibold opacity-90">{{ date }}</p>
          <p class="clock tabular text-clock">{{ time }}</p>
        </header>

        <div class="mt-3 grid grid-cols-2 gap-2.5" aria-label="Lock Screen widgets">
          <section class="widget material-ios-platter">
            <p class="text-ios-caption-2 font-semibold uppercase opacity-70">Notification Mood</p>
            <p class="text-ios-subheadline font-semibold"><IconText :text="mood.emoji" /> <IconText :text="mood.hint" /></p>
          </section>
          <section class="widget material-ios-platter">
            <p class="text-ios-caption-2 font-semibold uppercase opacity-70">Distraction Level</p>
            <p class="text-ios-subheadline font-semibold"><IconText :text="distraction.level" /> · <IconText :text="distraction.hint" /></p>
          </section>
        </div>

        <div class="mb-2.5 mt-7 flex items-end justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-ios-title-3 font-bold">Notification Centre</h2>
            <p class="truncate text-ios-footnote opacity-70"><IconText :text="subtitle" /></p>
          </div>
          <button
            v-if="count"
            type="button"
            class="clear material-ios-platter focus-ring"
            aria-label="Clear all notifications"
            @click="notifications.clearAll()"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <ul role="list" class="flex flex-col gap-2">
          <AnimatePresence>
            <motion.li
              v-for="n in notifications.history"
              :key="n.id"
              layout
              :initial="{ opacity: 0, scale: 0.96, y: -8 }"
              :animate="{ opacity: 1, scale: 1, y: 0 }"
              :exit="{ opacity: 0, scale: 0.94 }"
              :transition="spring.snappy"
            >
              <NotificationCard
                :notification="n"
                @open="open(n)"
                @action="runAction(n, $event)"
                @dismiss="notifications.remove(n.id)"
              />
            </motion.li>
          </AnimatePresence>
        </ul>

        <div v-if="!count" class="flex flex-col items-center gap-2 py-10 text-center opacity-80">
          <BellOff class="size-7" aria-hidden="true" />
          <p class="text-ios-headline">No Notifications</p>
          <p class="text-ios-footnote opacity-80"><IconText :text="emptyMessage" /></p>
        </div>

        <div class="mt-5 flex flex-wrap justify-center gap-2 pb-24">
          <button type="button" class="pill material-ios-platter focus-ring" @click="addDemo">Add Demo</button>
          <button v-if="count" type="button" class="pill material-ios-platter focus-ring" @click="snoozeAll">
            Snooze All
          </button>
          <button v-if="count" type="button" class="pill material-ios-platter focus-ring" @click="markAllRead">
            Mark All Read
          </button>
        </div>
      </div>
    </motion.div>

    <PanelGrabber
      label="Close Notification Centre"
      @down="onDown"
      @move="onMove"
      @up="onUp"
      @activate="store.closePanel()"
    />
  </div>
</template>

<style scoped>
.backdrop {
  backdrop-filter: blur(var(--blur-xl)) saturate(160%);
}

@media (prefers-reduced-transparency: reduce) {
  .backdrop {
    backdrop-filter: none;
    background: var(--ios-bg-secondary);
  }
}

.sheet {
  touch-action: pan-y;
}

.content {
  width: min(100% - 24px, 440px);
  padding-top: calc(var(--ios-status-height) + 8px);
}

.clock {
  font-size: clamp(64px, 22vw, 96px);
  line-height: 1;
  margin-top: 2px;
}

.widget {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding: 10px 12px;
  border-radius: 18px;
}

.clear {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex: none;
  border-radius: 999px;
}
.clear svg {
  width: 16px;
  height: 16px;
  stroke-width: 2.6;
}

.pill {
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: var(--text-ios-footnote);
  font-weight: 600;
}

.clear:active,
.pill:active {
  transform: scale(0.95);
  opacity: 0.8;
}
</style>
