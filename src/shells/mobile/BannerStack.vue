<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import { computed } from 'vue'

import { spring } from '@/design/motion'
import { useNotificationsStore, type OsNotification } from '@/stores/notifications'

import NotificationCard from './NotificationCard.vue'
import { useNotificationActions } from './useNotificationActions'

/**
 * iOS banners: the newest one drops in from the top edge and leaves the same
 * way. Swipe it up to dismiss, tap it to open what it's about.
 */
const notifications = useNotificationsStore()
const { runAction, openNotification } = useNotificationActions()
const current = computed(() => notifications.banners[0] ?? null)

function open(n: OsNotification) {
  if (!openNotification(n)) notifications.dismissBanner(n.id)
}
</script>

<template>
  <div class="banners pointer-events-none fixed inset-x-0 top-0" aria-live="polite">
    <AnimatePresence>
      <motion.div
        v-if="current"
        :key="current.id"
        class="pointer-events-auto mx-auto w-[min(100%-16px,420px)]"
        :initial="{ y: '-130%', opacity: 0 }"
        :animate="{ y: 0, opacity: 1 }"
        :exit="{ y: '-130%', opacity: 0 }"
        :transition="spring.default"
      >
        <NotificationCard
          :notification="current"
          swipe="up"
          @open="open(current)"
          @action="runAction(current, $event)"
          @dismiss="notifications.dismissBanner(current.id)"
        />
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<style scoped>
.banners {
  padding-top: max(env(safe-area-inset-top), 8px);
}
</style>
