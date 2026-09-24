<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'

import { shutdown as copy } from '@/content/system'
import { spring } from '@/design/motion'
import { useSystemStore } from '@/stores/system'
import UiProgress from '@/ui/UiProgress.vue'
import IconText from '@/ui/IconText.vue'

import BrandGlyph from '../BrandGlyph.vue'

/** "Shut down" a website. It plays along, then refuses, then comes back. */
const system = useSystemStore()
</script>

<template>
  <div class="power fixed inset-0 grid place-items-center chrome">
    <div class="flex w-80 flex-col items-center gap-8 text-center">
      <BrandGlyph class="mark size-20" />
      <p class="title text-title-2 font-semibold">
        <IconText :text="system.systemProgress > 80 ? copy.twistTitle : copy.title" />
      </p>
      <UiProgress class="w-40" tone="light" :value="system.systemProgress" :label="system.systemMessage" />
      <p class="message text-body" aria-live="polite"><IconText :text="system.systemMessage" /></p>

      <AnimatePresence>
        <motion.div
          v-if="system.systemProgress > 60 && system.systemProgress <= 90"
          key="reveal"
          class="message flex flex-col gap-1 text-callout"
          :initial="{ opacity: 0, y: 8 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0 }"
          :transition="spring.default"
        >
          <p v-for="line in copy.reveal" :key="line"><IconText :text="line" /></p>
        </motion.div>
        <motion.div
          v-else-if="system.systemProgress > 90"
          key="surprise"
          class="message flex flex-col gap-1 text-callout"
          :initial="{ opacity: 0, y: 8 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0 }"
          :transition="spring.default"
        >
          <p v-for="line in copy.surprise" :key="line"><IconText :text="line" /></p>
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
</template>

<style scoped>
.power {
  z-index: var(--z-system);
  background: var(--boot-bg);
}
.mark,
.title {
  color: var(--boot-fg);
}
.message {
  color: var(--boot-fill);
  opacity: 0.7;
}
</style>
