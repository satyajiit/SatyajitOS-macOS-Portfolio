<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { AnimatePresence, motion } from 'motion-v'
import { onMounted, ref } from 'vue'

import { useClock } from '@/composables/useClock'
import { spring } from '@/design/motion'
import { useNotificationsStore } from '@/stores/notifications'
import UiButton from '@/ui/UiButton.vue'

import { closeMenus } from '../shellUi'
import NotificationCard from './NotificationCard.vue'
import { useNotificationActions } from './useNotificationActions'

/** Opened from the clock: every notification this session, newest first. */
const notifications = useNotificationsStore()
const { act, remove } = useNotificationActions()
const clock = useClock()

const panel = ref<HTMLElement | null>(null)
onClickOutside(panel, closeMenus, { ignore: ['[data-panel-toggle="notification-center"]'] })

// Banners fold into the Center while it is open, as on macOS.
onMounted(() => {
  for (const n of [...notifications.banners]) notifications.dismissBanner(n.id)
})

function open(id: string, action?: Parameters<typeof act>[1]) {
  act(id, action)
  remove(id)
  closeMenus()
}
</script>

<template>
  <section
    ref="panel"
    class="nc chrome fixed flex w-[356px] flex-col gap-2"
    aria-label="Notification Center"
    @keydown.esc="closeMenus"
  >
    <header class="flex items-center justify-between px-1 text-white text-shadow-desktop">
      <div>
        <p class="text-title-3 font-semibold">{{ clock.longDate.value }}</p>
      </div>
      <UiButton v-if="notifications.history.length" size="small" @click="notifications.clearAll()">
        Clear All
      </UiButton>
    </header>

    <div class="flex max-h-[calc(100vh-120px)] flex-col gap-2 overflow-y-auto p-1.5">
      <AnimatePresence>
        <motion.div
          v-for="n in notifications.history"
          :key="n.id"
          layout
          :initial="{ opacity: 0, y: -8 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, x: 60, transition: { duration: 0.16 } }"
          :transition="spring.default"
        >
          <NotificationCard :notification="n" @dismiss="remove(n.id)" @act="open(n.id, $event)" />
        </motion.div>
      </AnimatePresence>
      <p
        v-if="!notifications.history.length"
        class="material-notification rounded-notification px-4 py-6 text-center text-body text-label-secondary"
      >
        No Notifications
      </p>
    </div>
  </section>
</template>

<style scoped>
.nc {
  top: calc(var(--menubar-height) + 8px);
  right: 8px;
  z-index: var(--z-control-center);
}
</style>
