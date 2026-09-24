<script setup lang="ts">
import TrafficLights from './TrafficLights.vue'

/**
 * Translucent source-list sidebar. When it is the leftmost pane it hosts the
 * traffic lights in its top strip (drag region), and the toolbar beside it is
 * rendered with `:lights="false"`.
 */
withDefaults(defineProps<{ width?: number; lights?: boolean; label?: string }>(), {
  width: 200,
  lights: true,
  label: 'Sidebar',
})
</script>

<template>
  <nav
    class="material-sidebar chrome flex h-full shrink-0 flex-col border-r border-separator"
    :style="{ width: `${width}px` }"
    :aria-label="label"
  >
    <div v-if="lights" class="flex h-(--toolbar-height) shrink-0 items-center pl-5" data-drag-region>
      <TrafficLights />
    </div>
    <div class="min-h-0 flex-1 overflow-y-auto px-2.5 pb-3">
      <slot />
    </div>
    <slot name="footer" />
  </nav>
</template>
