<script setup lang="ts">
import { useDebounceFn, useEventListener } from '@vueuse/core'
import { AnimatePresence } from 'motion-v'
import { computed } from 'vue'

import { useWindowsStore } from '@/stores/windows'

import MacWindow from './MacWindow.vue'

/**
 * Every visible window, stacked by z-index inside one layer that sits under
 * the Dock and menu bar. Minimised windows leave the layer (and animate
 * into the Dock on the way out).
 */
const windows = useWindowsStore()
const visible = computed(() => windows.openWindows.filter((w) => !w.isMinimized))

useEventListener(window, 'resize', useDebounceFn(windows.fitToViewport, 150))
</script>

<template>
  <div class="layer pointer-events-none fixed inset-0">
    <AnimatePresence>
      <MacWindow v-for="w in visible" :id="w.id" :key="w.id" class="pointer-events-auto" />
    </AnimatePresence>
  </div>
</template>

<style scoped>
.layer {
  z-index: var(--z-windows);
}
</style>
