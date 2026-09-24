<script setup lang="ts">
import { computed } from 'vue'

import TrafficLights from './TrafficLights.vue'
import { useWindowContext } from './context'

/**
 * Unified 52px toolbar (Finder, Mail…). Title sits left after the navigation
 * controls, as in macOS 26. Pass `lights: false` when a sidebar already hosts
 * the traffic lights.
 */
const props = withDefaults(
  defineProps<{ title?: string; subtitle?: string; lights?: boolean }>(),
  { lights: true },
)
const ctx = useWindowContext()
const title = computed(() => props.title ?? ctx?.title ?? '')
const dim = computed(() => (ctx ? !ctx.isKey.value : false))
</script>

<template>
  <header
    class="toolbar chrome flex h-(--toolbar-height) shrink-0 items-center gap-3 border-b border-separator bg-window-toolbar pr-3"
    :class="lights ? 'pl-5' : 'pl-3'"
    data-drag-region
  >
    <TrafficLights v-if="lights" class="mr-3" />
    <div class="flex items-center gap-1" data-no-drag>
      <slot name="leading" />
    </div>
    <div class="min-w-0 flex-1">
      <slot name="title">
        <h1 class="truncate text-title-3 font-bold" :class="dim ? 'text-label-tertiary' : 'text-label'">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="truncate text-subheadline text-label-secondary">{{ subtitle }}</p>
      </slot>
    </div>
    <div class="flex items-center gap-2" data-no-drag>
      <slot name="trailing" />
    </div>
  </header>
</template>
