<script setup lang="ts">
import { computed } from 'vue'

import { brands, type BrandDef, type BrandName } from './registry'

/**
 * A brand logo at a fixed square size. `decorative` hides it from assistive
 * tech when a visible label already names the brand.
 */
const props = withDefaults(defineProps<{ name: BrandName; size?: number; decorative?: boolean }>(), {
  size: 16,
  decorative: false,
})
const brand = computed<BrandDef>(() => brands[props.name])
</script>

<template>
  <span
    class="brand"
    :data-ink="brand.ink"
    :style="{ width: `${size}px`, height: `${size}px` }"
    :role="decorative ? undefined : 'img'"
    :aria-label="decorative ? undefined : brand.label"
    :aria-hidden="decorative || undefined"
  >
    <component :is="brand.component" :width="size" :height="size" />
  </span>
</template>

<style scoped>
.brand {
  display: inline-grid;
  place-items: center;
  flex: none;
}
.brand :deep(svg) {
  max-width: 100%;
  max-height: 100%;
}

/* Dark parts of a mark follow the text colour so the logo reads in dark mode. */
.brand[data-ink='black'] :deep(:is([fill='#000'], [fill='#000000'], [fill='black'], path:not([fill]))) {
  fill: currentColor;
}
.brand[data-ink='1b1f23'] :deep([fill='#1b1f23' i]) {
  fill: currentColor;
}
.brand[data-ink='001e2b'] :deep([fill='#001e2b' i]) {
  fill: currentColor;
}
.brand[data-ink='252f3e'] :deep([fill='#252f3e' i]) {
  fill: currentColor;
}
.brand[data-ink='00546b'] :deep([fill='#00546b' i]) {
  fill: currentColor;
}
</style>

<style>
/* Unscoped on purpose: it keys off the appearance attribute on <html>. */
:root[data-appearance='dark'] .brand[data-ink='invert'] svg {
  filter: invert(1);
}
</style>
