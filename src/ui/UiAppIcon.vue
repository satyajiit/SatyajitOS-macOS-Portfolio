<script setup lang="ts">
import { computed } from 'vue'

import { appIcons, type AppIconName } from './app-icons'
import UiBadge from './UiBadge.vue'

/** An app icon at any size, with the macOS drop shadow and an optional badge. */
const props = withDefaults(
  defineProps<{ name: AppIconName; size?: number; badge?: number; shadow?: boolean }>(),
  { size: 52, badge: 0, shadow: true },
)
const icon = computed(() => appIcons[props.name])
</script>

<template>
  <span class="relative inline-block shrink-0" :style="{ width: `${size}px`, height: `${size}px` }">
    <component
      :is="icon"
      class="block h-full w-full"
      :style="shadow ? { filter: 'var(--elev-icon-drop)' } : undefined"
    />
    <UiBadge
      v-if="badge"
      :count="badge"
      :size="size >= 56 ? 'large' : 'small'"
      class="absolute -right-1.5 -top-1.5"
    />
  </span>
</template>
