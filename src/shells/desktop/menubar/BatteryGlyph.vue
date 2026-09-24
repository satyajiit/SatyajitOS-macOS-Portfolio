<script setup lang="ts">
import { computed } from 'vue'

/** The menu-bar battery: outline, level fill (red when low), bolt when charging. */
const props = defineProps<{ level: number; charging?: boolean }>()
const width = computed(() => Math.max(1.5, (Math.min(100, props.level) / 100) * 19))
const low = computed(() => props.level <= 20 && !props.charging)
</script>

<template>
  <svg viewBox="0 0 27 13" width="27" height="13" aria-hidden="true">
    <rect x="0.5" y="0.5" width="23" height="12" rx="3.6" fill="none" stroke="currentColor" stroke-opacity="0.45" />
    <path d="M25 4.5a1.4 1.4 0 0 1 1.4 1.4v1.2A1.4 1.4 0 0 1 25 8.5z" fill="currentColor" fill-opacity="0.45" />
    <rect
      x="2.5"
      y="2.5"
      :width="width"
      height="8"
      rx="1.8"
      :fill="low ? 'var(--sys-red)' : 'currentColor'"
    />
    <path
      v-if="charging"
      d="M13 1.6 8.8 7.4h3l-.9 4 4.3-5.9h-3z"
      fill="currentColor"
      stroke="var(--tint-menubar)"
      stroke-width="0.6"
    />
  </svg>
</template>
