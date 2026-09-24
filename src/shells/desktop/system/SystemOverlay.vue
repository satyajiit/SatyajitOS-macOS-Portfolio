<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'

import { duration, ease } from '@/design/motion'
import { useSystemStore } from '@/stores/system'

import LockScreen from './LockScreen.vue'
import RestartScreen from './RestartScreen.vue'
import ShutdownScreen from './ShutdownScreen.vue'
import SleepScreen from './SleepScreen.vue'

/** Full-screen power states. Each fades in over the desktop and out again. */
const system = useSystemStore()
const fade = { duration: duration.long, ease: ease.out }
</script>

<template>
  <AnimatePresence>
    <!-- The fade wrapper forms its own stacking context, so it carries the layer. -->
    <motion.div
      v-if="!system.isNormal"
      :key="system.currentState"
      class="relative z-(--z-system)"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      :transition="fade"
    >
      <LockScreen v-if="system.isLocked" />
      <SleepScreen v-else-if="system.isSleeping" />
      <RestartScreen v-else-if="system.isRestarting" />
      <ShutdownScreen v-else-if="system.isShuttingDown" />
    </motion.div>
  </AnimatePresence>
</template>
