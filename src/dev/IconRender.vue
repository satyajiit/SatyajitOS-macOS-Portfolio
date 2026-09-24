<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { appIcons, type AppIconName } from '@/ui/app-icons'

/**
 * Dev-only: renders one app icon on a transparent page so scripts can export
 * PWA icons / favicons from the same SVG artwork.
 *   /__icon/brand?size=512&pad=0.1
 * pad = transparent margin as a fraction of the size (the macOS icon grid is ~0.1)
 */
const route = useRoute()
const name = computed(() => route.params.name as AppIconName)
const size = computed(() => Number(route.query.size ?? 512))
const pad = computed(() => Number(route.query.pad ?? 0))
</script>

<template>
  <div
    class="icon-render"
    :style="{ width: `${size}px`, height: `${size}px`, padding: `${size * pad}px` }"
  >
    <component :is="appIcons[name]" class="block h-full w-full" />
  </div>
</template>

<style scoped>
.icon-render {
  box-sizing: border-box;
}
:global(html:has(.icon-render)),
:global(body:has(.icon-render)) {
  background: transparent !important;
}
</style>
