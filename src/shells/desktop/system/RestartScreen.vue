<script setup lang="ts">
import { restart as copy } from '@/content/system'
import { useSystemStore } from '@/stores/system'
import UiProgress from '@/ui/UiProgress.vue'

import BrandGlyph from '../BrandGlyph.vue'

/** Black screen, mark, bar: then the page really does reload. */
const system = useSystemStore()
</script>

<template>
  <div class="power fixed inset-0 grid place-items-center chrome">
    <div class="flex w-64 flex-col items-center gap-10 text-center">
      <BrandGlyph class="mark size-20" />
      <UiProgress class="w-40" tone="light" :value="system.systemProgress" :label="system.systemMessage" />
      <p class="message text-body" aria-live="polite">{{ system.systemMessage }}</p>
      <p v-if="system.systemProgress > 80" class="message text-callout">
        {{ copy.almostDone }} {{ copy.refreshWarning }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.power {
  z-index: var(--z-system);
  background: var(--boot-bg);
}
.mark {
  color: var(--boot-fg);
}
.message {
  color: var(--boot-fill);
  opacity: 0.7;
}
</style>
