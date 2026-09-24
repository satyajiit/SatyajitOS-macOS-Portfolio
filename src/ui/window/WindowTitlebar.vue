<script setup lang="ts">
import { computed } from 'vue'

import TrafficLights from './TrafficLights.vue'
import { useWindowContext } from './context'

/**
 * The classic 32px title bar: lights on the left, centred title.
 * Drag it to move the window, double-click it to zoom.
 */
const props = defineProps<{ title?: string; transparent?: boolean }>()
const ctx = useWindowContext()
const title = computed(() => props.title ?? ctx?.title ?? '')
</script>

<template>
  <header
    class="titlebar chrome relative flex h-(--titlebar-height) shrink-0 items-center px-3"
    :class="transparent ? '' : 'border-b border-separator bg-window-toolbar'"
    data-drag-region
  >
    <TrafficLights />
    <h1
      class="pointer-events-none absolute inset-x-24 truncate text-center text-headline"
      :class="ctx && !ctx.isKey.value ? 'text-label-tertiary' : 'text-label-secondary'"
    >
      {{ title }}
    </h1>
    <div class="ml-auto flex items-center gap-2" data-no-drag>
      <slot name="trailing" />
    </div>
  </header>
</template>
