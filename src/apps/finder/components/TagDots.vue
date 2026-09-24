<script setup lang="ts">
import type { TagColor } from '@/content/files'

import { TAG_TOKENS } from '../locations'

/** Finder's overlapping tag dots. */
defineProps<{ colors: TagColor[] }>()
</script>

<template>
  <span v-if="colors.length" class="inline-flex shrink-0 items-center" :aria-label="`Tags: ${colors.join(', ')}`">
    <span
      v-for="(color, i) in colors"
      :key="color"
      class="dot"
      :style="{ background: TAG_TOKENS[color], marginLeft: i ? '-3px' : '0' }"
    />
  </span>
</template>

<style scoped>
.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  box-shadow: 0 0 0 1px var(--window-content);
}
</style>
