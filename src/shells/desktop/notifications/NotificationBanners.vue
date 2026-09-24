<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'

import { spring } from '@/design/motion'
import { useNotificationsStore } from '@/stores/notifications'

import NotificationCard from './NotificationCard.vue'
import { useNotificationActions } from './useNotificationActions'

/** Transient banners, top-right under the menu bar. Newest on top. */
const notifications = useNotificationsStore()
const { act, dismiss } = useNotificationActions()
</script>

<template>
  <section class="banners fixed flex w-[344px] flex-col gap-2" aria-live="polite" aria-label="Notifications">
    <AnimatePresence>
      <motion.div
        v-for="n in notifications.banners"
        :key="n.id"
        layout
        :initial="{ opacity: 0, x: 380 }"
        :animate="{ opacity: 1, x: 0 }"
        :exit="{ opacity: 0, x: 40, transition: { duration: 0.18 } }"
        :transition="spring.default"
      >
        <NotificationCard :notification="n" @dismiss="dismiss(n.id)" @act="act(n.id, $event)" />
      </motion.div>
    </AnimatePresence>
  </section>
</template>

<style scoped>
.banners {
  top: calc(var(--menubar-height) + 10px);
  right: 12px;
  z-index: var(--z-notifications);
  pointer-events: none;
}
.banners > * {
  pointer-events: auto;
}
</style>
